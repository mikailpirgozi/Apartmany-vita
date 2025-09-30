# 🔐 Google OAuth Setup Guide

## Problem Description
Google OAuth login was refreshing the page instead of redirecting properly after successful authentication.

## Root Causes Identified
1. Missing `callbackUrl` parameter in `signIn('google')` call
2. Missing `redirect` callback in NextAuth configuration
3. Potentially missing or incorrect environment variables in Vercel

## ✅ Code Fixes Applied

### 1. Fixed Google Sign-In Button (signin/page.tsx)
```typescript
function GoogleSignInButton() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  
  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { 
        callbackUrl,
        redirect: true 
      })
    } catch (error) {
      console.error('Google sign in error:', error)
      router.push('/auth/error')
    }
  }
  
  return (
    <Button onClick={handleGoogleSignIn}>
      Prihlásenie cez Google
    </Button>
  )
}
```

### 2. Fixed Google Sign-Up Button (signup/page.tsx)
Same fix applied to signup page for consistency.

### 3. Added Redirect Callback (lib/auth.ts)
```typescript
callbacks: {
  jwt: async ({ token, user }) => { /* ... */ },
  session: async ({ session, token }) => { /* ... */ },
  redirect: async ({ url, baseUrl }) => {
    // Allows relative callback URLs
    if (url.startsWith('/')) return `${baseUrl}${url}`
    // Allows callback URLs on the same origin
    else if (new URL(url).origin === baseUrl) return url
    return baseUrl
  }
}
```

## 🚀 Required Environment Variables in Vercel

You **MUST** set these in Vercel Dashboard → Project Settings → Environment Variables:

### 1. NextAuth Configuration
```bash
NEXTAUTH_URL=https://apartmany-vita.vercel.app
NEXTAUTH_SECRET=<generate-random-secret>
```

Generate secret:
```bash
openssl rand -base64 32
```

### 2. Google OAuth Credentials
```bash
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

## 📋 Google Cloud Console Setup

### Step 1: Create OAuth 2.0 Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (or create new one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**

### Step 2: Configure OAuth Consent Screen
1. Click **OAuth consent screen** in left sidebar
2. Select **External** user type
3. Fill in:
   - **App name**: Apartmány Vita
   - **User support email**: your-email@example.com
   - **Developer contact**: your-email@example.com
4. Click **SAVE AND CONTINUE**
5. Add scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
6. Click **SAVE AND CONTINUE**

### Step 3: Create OAuth Client ID
1. **Application type**: Web application
2. **Name**: Apartmány Vita - Production
3. **Authorized JavaScript origins**:
   ```
   https://apartmany-vita.vercel.app
   ```
4. **Authorized redirect URIs**:
   ```
   https://apartmany-vita.vercel.app/api/auth/callback/google
   ```
5. Click **CREATE**
6. Copy **Client ID** and **Client Secret**

### Step 4: Add Environment Variables to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select **apartmany-vita** project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXTAUTH_URL` | `https://apartmany-vita.vercel.app` | Production |
| `NEXTAUTH_SECRET` | `<your-generated-secret>` | Production |
| `GOOGLE_CLIENT_ID` | `<your-client-id>` | Production |
| `GOOGLE_CLIENT_SECRET` | `<your-client-secret>` | Production |

5. Click **Save**

## 🧪 Testing

### Local Testing (Optional)
1. Add to `.env.local`:
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<your-secret>
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
```

2. Add redirect URI in Google Console:
```
http://localhost:3000/api/auth/callback/google
```

3. Test locally:
```bash
pnpm dev
```

### Production Testing
1. Deploy to Vercel:
```bash
git add .
git commit -m "fix: Google OAuth redirect issue"
git push origin main
```

2. Wait for deployment to complete

3. Test on https://apartmany-vita.vercel.app:
   - Go to `/auth/signin`
   - Click "Prihlásenie cez Google"
   - Should redirect to Google login
   - After successful login, should redirect back to home page (`/`)

## 🔍 Debugging

### Check Vercel Logs
```bash
vercel logs apartmany-vita --production
```

### Common Issues

#### Issue: "Redirect URI mismatch"
**Solution**: 
- Verify redirect URI in Google Console exactly matches:
  ```
  https://apartmany-vita.vercel.app/api/auth/callback/google
  ```
- No trailing slashes
- Must use HTTPS in production

#### Issue: Still refreshing instead of redirecting
**Solution**:
- Verify `NEXTAUTH_URL` is set in Vercel
- Check browser console for errors
- Clear browser cache and cookies
- Try incognito mode

#### Issue: "Configuration" error
**Solution**:
- Verify all environment variables are set in Vercel
- Redeploy after adding env vars
- Check `NEXTAUTH_SECRET` is set

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## ✅ Checklist

Before testing, ensure:
- [ ] Code changes deployed to Vercel
- [ ] Google OAuth client created in Google Cloud Console
- [ ] Authorized redirect URIs configured correctly
- [ ] All environment variables added to Vercel
- [ ] Environment variables are in "Production" environment
- [ ] Project redeployed after adding env vars

---

**Last Updated**: September 30, 2025
**Status**: ✅ Code fixes complete, awaiting environment variable configuration
