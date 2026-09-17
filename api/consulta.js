// netlify/functions/consulta.js
const API_URL = 'https://consultadanfe.com/api/v1/consulta';

exports.handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Expose-Headers': 'X-Error-Code, Retry-After', // ESSENCIAL para o front ler os headers
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Método não permitido' }),
    };
  }

  try {
    const upstream = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: event.body,
    });

    const text = await upstream.text();
    const errorCode = upstream.headers.get('X-Error-Code');
    const retryAfter = upstream.headers.get('Retry-After'); // Captura o Retry-After

    return {
      statusCode: upstream.status,
      headers: {
        ...corsHeaders,
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
        ...(errorCode ? { 'X-Error-Code': errorCode } : {}),
        ...(retryAfter ? { 'Retry-After': retryAfter } : {}), // Repassa para o front
      },
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: corsHeaders,
      body: JSON.stringify({ message: `Falha ao contatar a API: ${err.message}` }),
    };
  }
};
