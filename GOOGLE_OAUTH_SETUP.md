# Google OAuth 2.0 Setup Guide

This guide will help you set up Google OAuth 2.0 credentials for your DeepCode application.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "New Project"
4. Enter a project name (e.g., "DeepCode Auth")
5. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on "Google+ API" and then click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace account)
3. Click "Create"
4. Fill in the required information:
   - **App name**: DeepCode
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
5. Click "Save and Continue"
6. On the "Scopes" page, click "Save and Continue" (we'll use default scopes)
7. On the "Test users" page, add your email address for testing
8. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application" as the application type
4. Enter a name (e.g., "DeepCode Web Client")
5. Add authorized redirect URIs:
   - For development: `http://localhost:8000/auth/google/callback`
   - For production: `https://your-production-domain.com/auth/google/callback`
6. Click "Create"

## Step 5: Copy Your Credentials


## Step 6: Configure Authorized Domains

1. In the OAuth consent screen configuration
2. Go to "Authorized domains"
3. Add your domains:
   - For development: `localhost`
   - For production: `your-production-domain.com`

## Step 7: Update Environment Variables

Make sure your `server/.env` file contains:


## Step 8: Test the Integration

1. Start your backend server: `cd server && npm run start:dev`
2. Start your frontend: `cd client && npm start`
3. Navigate to `http://localhost:3000`
4. Click "Login with Google"
5. Complete the OAuth flow

## Production Deployment

When deploying to production:

1. Update the `GOOGLE_CALLBACK_URL` in your production environment
2. Add your production domain to authorized domains
3. Update CORS configuration in your NestJS app
4. Ensure HTTPS is enabled for your production domain

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**:
   - Ensure the callback URL in your Google Console matches exactly with your environment variable
   - Check for trailing slashes and protocol (http vs https)

2. **"access_blocked" error**:
   - Make sure your app is in testing mode and you've added your email as a test user
   - Or publish your app for production use

3. **CORS errors**:
   - Verify your frontend URL is included in the CORS configuration
   - Ensure credentials are enabled in CORS settings

4. **Cookie not being set**:
   - Check that `withCredentials: true` is set in your axios configuration
   - Verify cookie settings (httpOnly, secure, sameSite)

## Security Best Practices

1. **Never expose your client secret** in frontend code
2. **Use HTTPS in production** for secure cookie transmission
3. **Implement proper CORS** to prevent unauthorized access
4. **Rotate your JWT secret** regularly
5. **Set appropriate cookie expiration** times
6. **Validate user data** on both frontend and backend

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NestJS Passport Documentation](https://docs.nestjs.com/security/authentication)
- [React Context API Documentation](https://reactjs.org/docs/context.html)