export const config = { runtime: 'edge' };

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Expose-Headers': 'X-Error-Code, Retry-After'
  };

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const upstream = await fetch('https://consultadanfe.com/api/v1/danfe/etiqueta-html', {
      method: 'POST',
      headers: { 'Content-Type': req.headers.get('Content-Type') },
      body: req.body
    });

    const responseHeaders = new Headers(corsHeaders);
    // A rota de etiquetas retorna HTML
    responseHeaders.set('Content-Type', upstream.headers.get('Content-Type') || 'text/html');
    
    ['X-Error-Code', 'Retry-After'].forEach(h => {
      if (upstream.headers.has(h)) responseHeaders.set(h, upstream.headers.get(h));
    });

    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ message: `Falha: ${err.message}` }), { status: 502, headers: corsHeaders });
  }
}
