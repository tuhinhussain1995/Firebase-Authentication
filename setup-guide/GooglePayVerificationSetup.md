# Google Pay Server-Side Verification Setup Guide

This guide provides step-by-step instructions for setting up server-side verification for Google Play in-app purchases and subscriptions.

## Overview

Server-side verification is essential for validating in-app purchases and subscriptions securely. It prevents fraud and ensures that users receive the digital goods they've purchased. This guide focuses on the API setup process, including OAuth configuration and Google Play Console setup.

## Prerequisites

- Google Play Developer account
- Google Cloud Platform account
- Published app on Google Play Store (or app in testing)
- Backend server (Node.js/NestJS in this example)

## Step 1: Create a Service Account in Google Cloud Platform

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" and select "OAuth client ID"
5. Configure the OAuth consent screen:
   - Select "External" user type
   - Fill in the required information (app name, user support email, developer contact information)
   - Add the necessary scopes (at minimum, you need `https://www.googleapis.com/auth/androidpublisher`)
   - Add test users if your app is in testing
   - Complete the registration process

## Step 2: Create OAuth Client ID

1. In the Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" and select "OAuth client ID"
3. Select "Web application" as the application type
4. Add a name for the OAuth client ID
5. Add authorized redirect URIs (e.g., `http://localhost:3000/oauth/callback` for testing)
6. Click "Create"
7. Save the Client ID and Client Secret that are generated

## Step 3: Enable the Google Play Android Developer API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Play Android Developer API"
3. Click on it and then click "Enable"

## Step 4: Link Your Google Cloud Project to Your Google Play Developer Account

1. Go to the [Google Play Console](https://play.google.com/console/)
2. Navigate to "Settings" > "Developer account" > "API access"
3. Click "Link" and select the Google Cloud project you created
4. Complete the linking process

## Step 5: Generate a Refresh Token

To generate a refresh token, you'll need to use the OAuth 2.0 flow:

1. Create a simple script or use a tool like Postman to make the following request:

```
https://accounts.google.com/o/oauth2/auth?
  scope=https://www.googleapis.com/auth/androidpublisher&
  response_type=code&
  access_type=offline&
  redirect_uri=YOUR_REDIRECT_URI&
  client_id=YOUR_CLIENT_ID
```

2. After authorization, you'll be redirected to your redirect URI with an authorization code
3. Exchange this code for a refresh token by making a POST request to:

```
POST https://oauth2.googleapis.com/token
Content-Type: application/x-www-form-urlencoded

code=AUTHORIZATION_CODE&
client_id=YOUR_CLIENT_ID&
client_secret=YOUR_CLIENT_SECRET&
redirect_uri=YOUR_REDIRECT_URI&
grant_type=authorization_code
```

4. The response will include a refresh token. Save this token securely as it doesn't expire unless revoked.

## Step 6: Configure Your Backend Server

1. Set up the following environment variables in your backend:

```
GOOGLE_PLAY_CLIENT_ID=your_client_id
GOOGLE_PLAY_CLIENT_SECRET=your_client_secret
GOOGLE_PLAY_REFRESH_TOKEN=your_refresh_token
```

2. Install the required dependencies:

```bash
npm install googleapis google-auth-library
```

## Step 7: Implement the Verification Service

The verification service should:

1. Initialize the Google OAuth2 client with your credentials
2. Use the refresh token to obtain access tokens automatically
3. Use the Google Play Android Developer API to verify purchases and subscriptions

Here's a simplified example of the implementation (refer to your existing code for a complete implementation):

```typescript
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

// Initialize OAuth client
const auth = new OAuth2Client({
  clientId: process.env.GOOGLE_PLAY_CLIENT_ID,
  clientSecret: process.env.GOOGLE_PLAY_CLIENT_SECRET,
});

// Set refresh token
auth.setCredentials({
  refresh_token: process.env.GOOGLE_PLAY_REFRESH_TOKEN,
});

// Initialize Android Publisher API
const androidPublisher = google.androidpublisher({
  version: 'v3',
  auth,
});

// Verify in-app purchase
async function verifyPurchase(purchaseToken, productId, packageName) {
  try {
    const response = await androidPublisher.purchases.products.get({
      packageName,
      productId,
      token: purchaseToken,
    });
    
    // Check if purchase is valid (purchaseState === 0 means purchased)
    return response.data.purchaseState === 0;
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
}

// Verify subscription
async function verifySubscription(purchaseToken, subscriptionId, packageName) {
  try {
    const response = await androidPublisher.purchases.subscriptions.get({
      packageName,
      subscriptionId,
      token: purchaseToken,
    });
    
    // Check if subscription is valid (paymentState === 1 means payment received)
    return response.data.paymentState === 1;
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
}
```

## Step 8: Create API Endpoints for Verification

Create endpoints that your client application can call to verify purchases:

```typescript
// Example using Express.js
app.post('/verify-purchase', async (req, res) => {
  const { purchaseToken, productId, packageName } = req.body;
  
  const isValid = await verifyPurchase(purchaseToken, productId, packageName);
  
  res.json({ success: isValid });
});

app.post('/verify-subscription', async (req, res) => {
  const { purchaseToken, subscriptionId, packageName } = req.body;
  
  const isValid = await verifySubscription(purchaseToken, subscriptionId, packageName);
  
  res.json({ success: isValid });
});
```

## Step 9: Implement Client-Side Integration

On the client side (Android app), you'll need to:

1. Implement the Google Play Billing Library
2. Process purchases and obtain purchase tokens
3. Send purchase tokens to your server for verification
4. Grant access to content based on the server's verification response

## Troubleshooting

### Common Issues:

1. **Invalid Credentials**: Ensure your Client ID, Client Secret, and Refresh Token are correct.
2. **API Not Enabled**: Make sure you've enabled the Google Play Android Developer API.
3. **Permission Issues**: Verify that your Google Cloud project is properly linked to your Google Play Developer account.
4. **Expired Refresh Token**: If your refresh token stops working, generate a new one.
5. **Package Name Mismatch**: Ensure the package name in your verification request matches your app's package name.

### Testing:

1. Use Google Play's test tracks to test in-app purchases without actual payment
2. Set up test accounts in the Google Play Console
3. Use the test endpoint in your backend to verify the connection is working

## Security Considerations

1. **Store Credentials Securely**: Never hardcode credentials in your application code.
2. **Use Environment Variables**: Store sensitive information in environment variables.
3. **Implement Rate Limiting**: Protect your verification endpoints from abuse.
4. **Log Verification Attempts**: Keep logs of verification attempts for debugging and security monitoring.
5. **Validate Input**: Always validate input parameters before making API calls.

## Additional Resources

- [Google Play Developer API Documentation](https://developers.google.com/android-publisher)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Play Billing Library Documentation](https://developer.android.com/google/play/billing)

## Conclusion

Server-side verification is a critical component of a secure in-app purchase system. By following this guide, you've set up a robust verification system that protects both your revenue and your users from fraudulent transactions.

Remember to keep your OAuth credentials secure and regularly monitor your verification logs for any unusual activity.