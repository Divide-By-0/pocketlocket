// Production Node.js/Express backend for Stripe Checkout
//
// This server handles:
// 1. API endpoints for Stripe Checkout
// 2. Serving the frontend static files (index.html, etc.)
// 3. Dynamic configuration for the frontend via /stripe-config.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(cors());
app.use(express.json());

// Serve stripe-config.js dynamically based on environment variables
app.get('/stripe-config.js', (req, res) => {
  res.type('application/javascript');
  // Prevent caching to ensure updates to env vars are reflected immediately
  res.setHeader('Cache-Control', 'no-store');
  // We leave backendUrl empty so the frontend makes relative requests
  // This avoids CORS issues and URL configuration errors
  res.send(`
    window.STRIPE_CONFIG = {
      publishableKey: '${process.env.STRIPE_PUBLISHABLE_KEY || ""}',
      backendUrl: ''
    };
  `);
});

// Helper to ensure domain has protocol for Stripe redirects
const getDomain = () => {
  const domain = process.env.DOMAIN;
  if (!domain) return `http://localhost:${process.env.PORT || 3000}`;
  if (domain.startsWith('http://') || domain.startsWith('https://')) return domain;
  return `https://${domain}`;
};

// Create checkout session endpoint
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { phoneModel, color, amount } = req.body;
    const domain = getDomain();

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'PocketLocket Case Reservation',
              description: `${phoneModel} - ${color} | Release: Feb 7, 2026 | Retail: $69.99`,
              images: [`${domain}/assets/adaptive-icon.png`], // Placeholder if image exists
            },
            unit_amount: amount, // Amount in cents ($1.00 = 100)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${domain}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/index.html#product`,
      metadata: {
        phoneModel: phoneModel,
        color: color,
        releaseDate: '2026-02-07',
        retailPrice: '69.99',
      },
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Success page endpoint
app.get('/success', async (req, res) => {
  const { session_id } = req.query;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // In a real app, you would save the reservation to a database here

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reservation Confirmed!</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'DM Sans', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #FFFBF5;
            margin: 0;
            color: #1F1F1F;
          }
          .container {
            text-align: center;
            max-width: 500px;
            padding: 2rem;
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            margin: 1rem;
          }
          h1 {
            color: #E11D48;
            margin-bottom: 1rem;
          }
          .checkmark {
            font-size: 4rem;
            margin-bottom: 1rem;
            color: #E11D48;
          }
          p {
            line-height: 1.6;
          }
          .details {
            background: #FFF1F2;
            padding: 1.5rem;
            border-radius: 12px;
            margin: 1.5rem 0;
            text-align: left;
          }
          .btn {
            display: inline-block;
            background: #E11D48;
            color: white;
            padding: 1rem 2rem;
            border-radius: 100px;
            text-decoration: none;
            margin-top: 1rem;
            font-weight: 500;
            transition: transform 0.2s;
          }
          .btn:hover {
            transform: translateY(-2px);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="checkmark">✓</div>
          <h1>Reservation Confirmed!</h1>
          <p>Thank you for reserving your PocketLocket case!</p>
          <div class="details">
            <p><strong>Phone Model:</strong> ${session.metadata.phoneModel}</p>
            <p><strong>Color:</strong> ${session.metadata.color}</p>
            <p><strong>Release Date:</strong> February 7, 2026</p>
            <p><strong>Retail Price:</strong> $69.99</p>
          </div>
          <p>We'll send you an email with more details and payment information for the full amount before the release date.</p>
          <a href="/" class="btn">Back to Home</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).send('Error processing your request');
  }
});

// Serve static files from the current directory
app.use(express.static(path.join(__dirname, '.')));

// Catch-all route to serve index.html for any other requests (optional, mostly for SPAs)
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'index.html'));
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
