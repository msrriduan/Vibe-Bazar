const https = require('https');

/**
 * Netlify Function: whatsapp-notify
 * 
 * Automatically sends a WhatsApp notification with order details when a new order is placed.
 * It is triggered in the background by the checkout flow.
 * 
 * Recommended Cost-Effective Providers:
 * 1. UltraMsg (https://ultramsg.com): Very simple, flat-rate monthly pricing. Great for personal/staff alerts.
 * 2. Green API (https://green-api.com): Extremely cheap, flat-rate instance-based API. Highly reliable.
 * 3. Twilio WhatsApp API: High quality, official, message volume pricing, but requires template pre-approval.
 * 
 * Setup instructions for UltraMsg (Default configured below):
 * 1. Create an account on UltraMsg.com and get your Instance ID (e.g. instance12345) and Token.
 * 2. Add these environment variables to your Netlify site settings (under Site Config -> Environment Variables):
 *    - WHATSAPP_API_URL: Set to "https://api.ultramsg.com/your-instance-id/messages/chat"
 *    - WHATSAPP_API_TOKEN: Your UltraMsg instance token.
 *    - MY_WHATSAPP_NUMBER: Your specific WhatsApp number (including country code, e.g., "8801989475141").
 */

exports.handler = async function (event, context) {
  // Only allow POST request
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const payload = JSON.parse(event.body);
    const order = payload.order;

    if (!order) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing order details in request payload' }),
      };
    }

    // Retrieve credentials from environment variables
    const apiUrl = process.env.WHATSAPP_API_URL || '';
    const apiToken = process.env.WHATSAPP_API_TOKEN || '';
    const destinationNumber = process.env.MY_WHATSAPP_NUMBER || '8801989475141'; // Fallback admin WhatsApp

    // 1. Format the order notification text beautifully
    const itemsSummary = order.items
      .map(item => `• ${item.name} (Qty: ${item.quantity}) - ${item.price} BDT`)
      .join('\n');

    const whatsappMessage = `🔔 *New Order Received on Vibebazar!* 🔔\n\n` +
      `📦 *ORDER ID:* ${order.id}\n` +
      `📅 *Date:* ${new Date(order.createdAt).toLocaleDateString('en-BD')}\n\n` +
      `👤 *Customer Name:* ${order.customerName}\n` +
      `📞 *Phone:* ${order.customerPhone}\n` +
      `📍 *Address:* ${order.customerAddress}\n\n` +
      `🛒 *Purchased Items:*\n${itemsSummary}\n\n` +
      `💵 *Grand Total:* ${order.totalAmount} BDT\n` +
      `💳 *Payment Method:* ${order.paymentMethod}\n` +
      `${order.transactionId ? `🔑 *Transaction ID (trxID):* ${order.transactionId}\n` : ''}` +
      `${order.discountCode ? `🎟️ *Used Coupon:* ${order.discountCode} (-${order.discountAmount} BDT)\n` : ''}\n` +
      `Please log into the Vibebazar Admin Panel to approve and ship this order! 🚀`;

    // 2. Validate API setup
    if (!apiUrl || !apiToken) {
      console.log('--- WhatsApp API Credentials missing in Environment Variables ---');
      console.log('Sending backup notification print to Netlify logs:');
      console.log(whatsappMessage);
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          status: 'success',
          debug: true,
          message: 'Webhook parsed order successfully but environment keys (WHATSAPP_API_URL or WHATSAPP_API_TOKEN) are missing in Netlify. Logging order print to console helper.'
        }),
      };
    }

    // 3. Make HTTP request to UltraMsg API
    const postData = JSON.stringify({
      token: apiToken,
      to: destinationNumber,
      body: whatsappMessage,
      priority: 1
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 8000 // 8 seconds timeout
    };

    const sendRequest = () => {
      return new Promise((resolve, reject) => {
        const req = https.request(apiUrl, options, (res) => {
          let responseBody = '';
          res.on('data', (chunk) => { responseBody += chunk; });
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(responseBody);
            } else {
              reject(new Error(`API responded with status code ${res.statusCode}: ${responseBody}`));
            }
          });
        });

        req.on('error', (err) => {
          reject(err);
        });

        req.write(postData);
        req.end();
      });
    };

    const result = await sendRequest();
    console.log('WhatsApp notification dispatched through UltraMsg API successfully. Response:', result);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'success',
        message: 'WhatsApp automated notification sent successfully!',
        response: JSON.parse(result)
      }),
    };

  } catch (error) {
    console.error('Error handling whatsapp-notify function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message }),
    };
  }
};
