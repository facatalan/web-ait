import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { courseSlug, lessonSlug } = await req.json();

    if (!courseSlug || !lessonSlug) {
      return new Response(
        JSON.stringify({ error: 'Missing courseSlug or lessonSlug' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Crear cliente Supabase con el token del usuario
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') || '' }
        }
      }
    );

    // Obtener usuario actual (puede ser null para lecciones gratis)
    const { data: { user } } = await supabase.auth.getUser();

    // Verificar acceso usando la función de la base de datos
    const { data: hasAccess, error: accessError } = await supabase.rpc('can_access_lesson', {
      p_user_id: user?.id ?? null,
      p_course_slug: courseSlug,
      p_lesson_slug: lessonSlug
    });

    if (accessError) {
      console.error('Access check error:', accessError);
      return new Response(
        JSON.stringify({ error: 'Error verificando acceso' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: 'No tienes acceso a esta lección' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obtener el playback ID de la lección
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('mux_playback_id')
      .eq('slug', lessonSlug)
      .single();

    if (lessonError || !lesson?.mux_playback_id) {
      return new Response(
        JSON.stringify({ error: 'Video no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obtener credenciales de Mux
    const signingKeyId = Deno.env.get('MUX_SIGNING_KEY_ID');
    const signingPrivateKey = Deno.env.get('MUX_SIGNING_PRIVATE_KEY');

    if (!signingKeyId || !signingPrivateKey) {
      // Si no hay signing keys, devolver solo el playback ID (video público)
      return new Response(
        JSON.stringify({
          playbackId: lesson.mux_playback_id,
          token: null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generar token JWT firmado para Mux
    const privateKey = await jose.importPKCS8(
      signingPrivateKey.replace(/\\n/g, '\n'),
      'RS256'
    );

    const token = await new jose.SignJWT({
      sub: lesson.mux_playback_id,
      aud: 'v',
      exp: Math.floor(Date.now() / 1000) + (4 * 60 * 60), // 4 horas
      kid: signingKeyId
    })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .sign(privateKey);

    return new Response(
      JSON.stringify({
        playbackId: lesson.mux_playback_id,
        token
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
