# Razorpay Integration Guide

This guide will help you set up Razorpay payment integration for the Circlo rental platform.

## Prerequisites

1. **Razorpay Account**: Sign up at [razorpay.com](https://razorpay.com)
2. **Business Verification**: Complete your business verification (required for live payments)
3. **Bank Account**: Add your bank account for settlements

## Step 1: Get Your API Keys

### Test Mode (Development)
1. Log in to your Razorpay dashboard
2. Go to **Settings** → **API Keys**
3. Click **Generate Key Pair**
4. Save both the **Key ID** and **Key Secret**

### Live Mode (Production)
1. Complete business verification
2. Go to **Settings** → **API Keys**
3. Generate live mode keys
4. **Important**: Never share your live secret key

## Step 2: Configure Environment Variables

### Backend Configuration
Update your `backend/.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_key_here
```

### Frontend Configuration
Update your `.env` file:

```env
# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
```

## Step 3: Test the Integration

### 1. Start the Application
```bash
# Start backend
cd backend
npm run dev

# Start frontend (in new terminal)
npm run dev
```

### 2. Test Payment Flow
1. Navigate to any item listing
2. Click "Book Now"
3. Select dates and click "Confirm & Pay"
4. Complete the payment using test card details

### Test Card Details
Use these test cards for testing:

| Card Type | Number | Expiry | CVV |
|-----------|--------|--------|-----|
| Visa | 4111 1111 1111 1111 | Any future date | Any 3 digits |
| Mastercard | 5555 5555 5555 4444 | Any future date | Any 3 digits |
| RuPay | 6073 8400 0000 0008 | Any future date | Any 3 digits |

## Step 4: Payment Flow Explanation

### 1. Order Creation
When a user clicks "Confirm & Pay":
- Backend creates a booking with pending status
- Backend creates a Razorpay order with calculated amount
- Frontend receives order details

### 2. Payment Processing
- Razorpay modal opens with payment options
- User completes payment
- Razorpay sends payment details to frontend

### 3. Payment Verification
- Frontend sends payment details to backend
- Backend verifies payment signature
- Backend updates booking status to confirmed

## Step 5: Production Deployment

### 1. Switch to Live Keys
Update environment variables with live keys:
```env
RAZORPAY_KEY_ID=rzp_live_your_live_key_id
RAZORPAY_KEY_SECRET=your_live_secret_key
VITE_RAZORPAY_KEY_ID=rzp_live_your_live_key_id
```

### 2. Webhook Configuration (Optional)
For better payment tracking, set up webhooks:

1. Go to Razorpay Dashboard → **Settings** → **Webhooks**
2. Add webhook URL: `https://your-domain.com/api/payments/webhook`
3. Select events: `payment.captured`, `payment.failed`

### 3. Security Considerations
- Never expose secret keys in frontend code
- Always verify payment signatures on backend
- Use HTTPS in production
- Implement proper error handling

## Troubleshooting

### Common Issues

1. **Payment Fails with "Invalid Key"**
   - Check that your key ID is correct
   - Ensure you're using test keys for development
   - Verify the key is active in your Razorpay dashboard

2. **Payment Verification Fails**
   - Check that your secret key is correct
   - Ensure the signature verification logic is working
   - Verify the payment amount is in paise (multiply by 100)

3. **Modal Doesn't Open**
   - Check browser console for JavaScript errors
   - Ensure Razorpay script is loading correctly
   - Verify your key ID is valid

4. **CORS Errors**
   - Ensure your domain is whitelisted in Razorpay dashboard
   - Check that your frontend URL is correct

### Debug Mode
Enable debug logging in the backend:

```javascript
// In backend/routes/api.js
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Add logging
console.log('Razorpay config:', {
  key_id: process.env.RAZORPAY_KEY_ID,
  has_secret: !!process.env.RAZORPAY_KEY_SECRET
});
```

## Support

- **Razorpay Documentation**: [docs.razorpay.com](https://docs.razorpay.com)
- **Razorpay Support**: [razorpay.com/support](https://razorpay.com/support)
- **Project Issues**: Create an issue in this repository

## Security Best Practices

1. **Environment Variables**: Never commit API keys to version control
2. **Signature Verification**: Always verify payment signatures on backend
3. **HTTPS**: Use HTTPS in production for secure communication
4. **Error Handling**: Implement proper error handling for failed payments
5. **Logging**: Log payment events for debugging and audit trails
6. **Rate Limiting**: Implement rate limiting on payment endpoints
7. **Input Validation**: Validate all payment-related inputs

## Testing Checklist

- [ ] Test payment with valid card details
- [ ] Test payment with invalid card details
- [ ] Test payment cancellation
- [ ] Test payment verification
- [ ] Test booking status updates
- [ ] Test error handling
- [ ] Test with different payment methods (UPI, cards, etc.)
- [ ] Test webhook handling (if implemented) 