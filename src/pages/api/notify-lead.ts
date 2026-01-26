import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const ntfyTopic = import.meta.env.NTFY_TOPIC;

  if (!ntfyTopic) {
    console.warn('NTFY_TOPIC not configured, skipping notification');
    return new Response(JSON.stringify({ ok: true, skipped: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { name, email, phone, timing, source } = await request.json();

    const timingLabels: Record<string, string> = {
      urgente: 'Lo antes posible',
      '2_3_meses': 'En 2-3 meses',
      explorando: 'Explorando opciones',
      informacion: 'Solo información',
    };

    const body = [
      `${name}`,
      `${email} · ${phone}`,
      `Timing: ${timingLabels[timing] || timing}`,
      source && source !== 'direct' ? `Fuente: ${source}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    await fetch(`https://ntfy.sh/${ntfyTopic}`, {
      method: 'POST',
      headers: {
        Title: 'Nueva agenda AIThinking',
        Tags: 'calendar,sparkles',
      },
      body,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending ntfy notification:', error);
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
