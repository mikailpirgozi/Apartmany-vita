# 🚨 QUICK FIX: Google OAuth Not Redirecting

## What was wrong?
Google OAuth login refreshed the page instead of redirecting properly.

## ✅ Code fixes deployed
- ✅ Added `callbackUrl` to Google sign-in buttons
- ✅ Added `redirect` callback to NextAuth config
- ✅ Improved error handling

## ⚡ YOU NEED TO DO THIS NOW:

### 1️⃣ Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```
Copy the output.

### 2️⃣ Add Environment Variables in Vercel

Go to: https://vercel.com/your-account/apartmany-vita/settings/environment-variables

Add these 4 variables (select "Production" environment):

```
NEXTAUTH_URL=https://apartmany-vita.vercel.app
NEXTAUTH_SECRET=<paste-the-secret-from-step-1>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

### 3️⃣ Get Google OAuth Credentials

**Don't have them yet?**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI:
   ```
   https://apartmany-vita.vercel.app/api/auth/callback/google
   ```
4. Copy Client ID and Client Secret
5. Add them to Vercel (step 2 above)

**Already have them?**
- Just verify redirect URI is correct in Google Console
- Add them to Vercel environment variables

### 4️⃣ Redeploy
After adding env vars, Vercel should auto-redeploy.

**Or manually trigger:**
```bash
git commit --allow-empty -m "trigger redeploy"
git push
```

## 🧪 Test
1. Go to: https://apartmany-vita.vercel.app/auth/signin
2. Click "Prihlásenie cez Google"
3. Should now redirect properly! ✨

## ❌ Still not working?

Check:
- [ ] All 4 environment variables added to Vercel?
- [ ] Variables are in "Production" environment?
- [ ] Google redirect URI matches exactly (no trailing slash)?
- [ ] Cleared browser cache?
- [ ] Tried incognito mode?

See full guide: `GOOGLE_OAUTH_SETUP.md`
