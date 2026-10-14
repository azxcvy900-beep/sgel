import { NextResponse } from 'next/server';

const FIREBASE_DB_URL = 'https://sjel-58f26-default-rtdb.firebaseio.com';

export async function POST(request) {
  try {
    let payload = {};
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      payload = await request.json();
    } else {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        payload[key] = value;
      });
    }

    console.log('[Payhip Webhook] Received payload:', payload);

    // Build standardized order object
    const orderId = payload.id || payload.invoice_id || `PH-${Date.now()}`;
    const customerEmail = payload.email || payload.buyer_email || 'عميل Payhip';
    const customerName = payload.buyer_name || 'مشتري معتمد';
    const totalPrice = parseFloat(payload.price || payload.amount || 0);
    const currency = payload.currency || 'SAR';
    const productKey = payload.product_key || payload.link_id || '';
    const productTitle = payload.product_name || payload.title || 'قضية جنائية مدفوعة';

    const orderData = {
      orderId: `PH-${orderId}`,
      source: 'payhip',
      date: new Date().toLocaleDateString('ar-SA'),
      timestamp: Date.now(),
      customerName,
      customerEmail,
      totalPrice,
      currency,
      items: [
        {
          id: productKey || `case-${Date.now()}`,
          title: productTitle,
          price: totalPrice,
          caseNumber: `PH-${String(orderId).slice(-4)}`,
        }
      ],
      rawPayload: payload
    };

    // Save order directly into Firebase orders list
    await fetch(`${FIREBASE_DB_URL}/sijill/orders/${orderData.orderId}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    return NextResponse.json({ success: true, orderId: orderData.orderId }, { status: 200 });
  } catch (error) {
    console.error('[Payhip Webhook Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'active', 
    service: 'Sijill Payhip Webhook Endpoint',
    time: new Date().toISOString()
  });
}
