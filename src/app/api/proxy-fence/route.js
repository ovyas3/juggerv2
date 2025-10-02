// Next.js App Router API route to proxy fence data requests and bypass CORS
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url || !url.startsWith('https://s3.ap-south-1.amazonaws.com/instageofence/')) {
    return Response.json({ error: 'Invalid or missing URL parameter' }, { status: 400 });
  }

  try {
    console.log('Proxying fence data request to:', url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Return the data with proper CORS headers
    return Response.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return Response.json(
      { error: 'Failed to fetch fence data', details: error.message },
      { status: 500 }
    );
  }
}