import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2'

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
    const { email, documentSlug, documentTitle, documentUrl, source } = await req.json();

    // Validar campos requeridos
    if (!email || !documentSlug || !documentTitle || !documentUrl) {
      return new Response(
        JSON.stringify({ error: 'Email, slug, título y URL del documento son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Guardar lead en Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error: dbError } = await supabase.from('leads').upsert({
      email: email.toLowerCase().trim(),
      document_slug: documentSlug,
      source: source || null,
    }, {
      onConflict: 'email,document_slug'
    });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Error guardando información');
    }

    // Enviar email con Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY no configurada');
    }

    const resend = new Resend(resendApiKey);

    const { error: emailError } = await resend.emails.send({
      from: 'AIThinking <recursos@ai-thinking.io>',
      to: email,
      subject: `Tu recurso: ${documentTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f; color: #d1d5db; padding: 40px 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #12121a; border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.1);">
    <h1 style="color: #ffffff; font-size: 24px; margin-bottom: 24px;">
      ¡Hola!
    </h1>

    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
      Gracias por tu interés en <strong style="color: #3b82f6;">${documentTitle}</strong>.
    </p>

    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
      Haz clic en el botón para descargar tu recurso:
    </p>

    <a href="${documentUrl}"
       style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
      Descargar documento
    </a>

    <p style="font-size: 14px; color: #9ca3af; margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);">
      — Equipo AIThinking
    </p>
  </div>
</body>
</html>
      `,
    });

    if (emailError) {
      console.error('Email error:', emailError);
      throw new Error('Error enviando email');
    }

    // Actualizar timestamp de envío
    await supabase
      .from('leads')
      .update({ email_sent_at: new Date().toISOString() })
      .eq('email', email.toLowerCase().trim())
      .eq('document_slug', documentSlug);

    return new Response(
      JSON.stringify({ success: true, message: 'Email enviado correctamente' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
