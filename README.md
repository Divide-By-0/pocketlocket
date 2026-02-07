# PocketLocket - Pre-order Landing Page

A beautiful landing page for PocketLocket phone cases with integrated Stripe payment for $1 reservations.

## Features

- $1 reservation system for pre-orders
- Stripe payment integration
- Responsive design
- Accessibility compliant (ARIA labels, keyboard navigation)
- Secure configuration management

## Project Structure

```
pocketlocket/
├── index.html                    # Main landing page
├── stripe-config.js              # Stripe configuration (gitignored, create from example)
├── stripe-config.example.js      # Template for Stripe config
├── server.js                     # Production Node.js backend
├── .env                          # Backend environment variables (gitignored, create from example)
├── .env.example                  # Template for environment variables
├── .gitignore                    # Git ignore rules
├── STRIPE_SETUP.md               # Detailed setup instructions
└── README.md                     # This file
```

## Quick Start

### 1. Clone or Download

If you're setting up from scratch, make sure you have all files from the project.

### 2. Configure Frontend

```bash
# Copy the config template
cp stripe-config.example.js stripe-config.js

# Edit stripe-config.js with your actual Stripe publishable key
```

### 3. Configure Backend

```bash
# Copy the env template
cp .env.example .env

# Edit .env with your actual Stripe secret key
```

### 4. Install Backend Dependencies

```bash
npm install
```

### 5. Run Backend Server

```bash
node server.js
```

### 6. Open Frontend

Open your browser to:

```
http://localhost:3000
```

The server (`server.js`) serves both the API and the static files (`index.html`).

## Security Notes

### Files That Should NEVER Be Committed

The following files contain sensitive information and are in `.gitignore`:

- `stripe-config.js` - Contains publishable key
- `.env` - Contains secret key
- `node_modules/` - Dependencies

### Safe to Commit

These template files are safe to commit:

- `stripe-config.example.js` - Config template with placeholders
- `.env.example` - Environment template with placeholders
- `.gitignore` - Git ignore rules

### Best Practices

1. ✅ Use test keys (`pk_test_`, `sk_test_`) during development
2. ✅ Use live keys (`pk_live_`, `sk_live_`) only in production
3. ✅ Keep secret keys in environment variables
4. ✅ Add `.env` to `.gitignore`
5. ❌ Never commit real Stripe keys to version control
6. ❌ Never expose secret keys in client-side code

## Configuration Files Explained

### stripe-config.js (Frontend)

Contains the Stripe publishable key and backend URL. This file:
- Is loaded by `index.html`
- Should contain your actual publishable key
- Is in `.gitignore` to prevent accidental commits
- Use `stripe-config.example.js` as template

### .env (Backend)

Contains sensitive backend configuration. This file:
- Is loaded by `server.js`
- Should contain your actual secret key
- Is in `.gitignore` to prevent accidental commits
- Use `.env.example` as template

## Deployment

### Frontend (GitHub Pages, Netlify, Vercel)

1. Deploy `index.html` to your hosting platform
2. Update `stripe-config.js` with production values:
   - Use live Stripe publishable key (`pk_live_...`)
   - Use production backend URL

### Backend (Heroku, Railway, Render)

1. Deploy `server.js`
2. Set environment variables in your hosting dashboard:
   - `STRIPE_SECRET_KEY` = your live secret key
   - `DOMAIN` = your frontend URL
   - `PORT` = provided by platform or 3000

## Testing

Use Stripe test cards:

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

Use any future expiration date and any 3-digit CVC.

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- See `STRIPE_SETUP.md` for detailed setup instructions

## License

Private project - All rights reserved
