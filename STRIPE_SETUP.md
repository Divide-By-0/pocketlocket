# Stripe Payment Integration Setup

Your PocketLocket HTML has been updated with Stripe payment integration for $1 reservations. Follow these steps to complete the setup:

## Changes Made

### Security Improvements
1. Created `.gitignore` to prevent committing sensitive files
2. Moved Stripe configuration to external `stripe-config.js` file
3. Added configuration validation and error handling
4. Added accessibility attributes (ARIA labels, roles)
5. Implemented request timeouts and proper error messages
6. Added duplicate error prevention

### Frontend Updates
1. Added Stripe.js script to the `<head>` section
2. Updated all pricing from $79 to $1 reservation
3. Added release date information (February 7, 2026)
4. Added retail price information ($69.99)
5. Updated CTA buttons to "Reserve Your Spot"
6. Added comprehensive JavaScript code for Stripe Checkout

## Setup Instructions

### 1. Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create a Stripe account if you don't have one
3. Navigate to Developers > API keys
4. Copy your **Publishable key** and **Secret key**

⚠️ **Security Note**: Never commit your Stripe keys to git. Use the provided configuration files.

### 2. Configure Frontend

Edit `stripe-config.js` (this file is in .gitignore):

```javascript
window.STRIPE_CONFIG = {
  publishableKey: 'pk_test_your_actual_key_here', // Replace with your key
  backendUrl: 'http://localhost:3000' // Your backend URL
};
```

For production, use your live key (`pk_live_...`) and production backend URL.

### 3. Set Up Backend Server

The file `server.js` contains a complete Node.js/Express backend example.

#### Install Dependencies

```bash
npm init -y
npm install stripe express cors dotenv
```

#### Create .env File

Copy the example environment file:

```bash
cp .env.example .env
```

Then edit `.env` and add your actual values:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
DOMAIN=http://localhost:3000
PORT=3000
```

⚠️ **Security Note**: The `.env` file is in .gitignore and will never be committed. Always use `.env.example` as a template.

#### Run the Server

```bash
node server.js
```

### 4. Test the Integration

1. Open `index.html` in your browser
2. Click "Reserve Your Spot — $1"
3. You should be redirected to Stripe Checkout
4. Use test card: `4242 4242 4242 4242` with any future date and any CVC
5. Complete the test payment

### 5. Deploy to Production

#### Frontend (index.html)
- Deploy to GitHub Pages, Netlify, or Vercel
- Update the `YOUR_BACKEND_URL` to your production backend URL

#### Backend
- Deploy to Heroku, Railway, Render, or any Node.js hosting
- Update environment variables with production Stripe keys (`pk_live_` and `sk_live_`)
- Update the `DOMAIN` variable to your production domain

### 6. Important Security Notes

- **Never commit your Stripe secret key to Git**
- Keep your secret key in environment variables
- Use test keys (`pk_test_` / `sk_test_`) during development
- Only use live keys (`pk_live_` / `sk_live_`) in production
- Add `.env` to your `.gitignore` file

## Webhook Setup (Optional but Recommended)

To track successful payments and update your database:

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add an endpoint: `https://your-domain.com/webhook`
3. Select events: `checkout.session.completed`
4. Add webhook handling code to your backend

Example webhook handler:

```javascript
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Save reservation to database
    // Send confirmation email
    console.log('Reservation completed:', session.metadata);
  }

  res.json({received: true});
});
```

## Testing

### Test Cards

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Authentication Required: `4000 0025 0000 3155`

Use any future expiration date and any 3-digit CVC.

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Checkout Docs](https://stripe.com/docs/payments/checkout)

## Current Pricing Structure

- **Reservation Fee:** $1 (paid now via Stripe)
- **Release Date:** February 7, 2026
- **Retail Price:** $69.99 (to be charged on or before release)

You'll need to set up a separate payment collection system for the $69.99 balance before the February 7th release date.
