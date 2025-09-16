// For Next.js App Router (route.js)
export async function POST(request) {
  // Webhook handler code
}

export async function GET() {
  return Response.json({ message: 'JotForm Webhook Active' });
}

// For Pages Router or Express (jotform-webhook.js)
export default function handler(req, res) {
  if (req.method === 'POST') {
    // Handle webhook
  }
  res.json({ message: 'JotForm Webhook Active' });
}

// For Serverless Functions
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'JotForm Webhook Active' })
  };
};
