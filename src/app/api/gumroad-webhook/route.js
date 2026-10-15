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

    console.log('[Gumroad Webhook] Received Ping payload:', payload);

    const saleId = payload.sale_id || payload.order_number || `GR-${Date.now()}`;
    const customerEmail = payload.email || payload.buyer_email || 'عميل Gumroad';
    const customerName = payload.full_name || payload.buyer_name || 'محقق سجل';
    const totalPrice = payload.price ? parseFloat((payload.price / 100).toFixed(2)) : 0;
    const currency = payload.currency || 'USD';
    const productTitle = payload.product_name || 'قضية سجل الجنائية';

    const orderData = {
      orderId: `GR-${saleId}`,
      source: 'gumroad',
      date: new Date().toLocaleDateString('ar-SA'),
      timestamp: Date.now(),
      customerName,
      customerEmail,
      totalPrice,
      currency,
      items: [
        {
          id: payload.product_id || `case-${Date.now()}`,
          title: productTitle,
          price: totalPrice,
          caseNumber: `GR-${String(saleId).slice(-4)}`,
        }
      ],
      rawPayload: payload
    };

    // Save order into Firebase
    await fetch(`${FIREBASE_DB_URL}/sijill/orders/${orderData.orderId}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    return NextResponse.json({ success: true, orderId: orderData.orderId }, { status: 200 });
  } catch (error) {
    console.error('[Gumroad Webhook Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'active', 
    service: 'Sijill Gumroad Webhook Endpoint',
    time: new Date().toISOString()
  });
}
