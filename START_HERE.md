# 🚀 START HERE - Apartmány Vita Vercel Deployment

## ⚡ TL;DR (Too Long; Didn't Read)

**Problem:** Booking doesn't work on Vercel production  
**Cause:** Missing `DATABASE_URL` environment variable  
**Solution:** 5 minutes → [VERCEL_QUICK_FIX.md](./VERCEL_QUICK_FIX.md)

---

## 🎯 Choose Your Path

```
┌────────────────────────────────────────┐
│   How much time do you have?          │
└────────────────┬───────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
    
  5 MINUTES          30+ MINUTES
        │                 │
        ▼                 ▼
        
 Quick Fix         Complete Setup
 
 VERCEL_          VERCEL_
 QUICK_FIX        PRODUCTION_FIX
                  +
                  DEPLOYMENT_
                  CHECKLIST
```

---

## 🔥 QUICK START (5 minutes)

### Step 1: Read Problem Summary
```bash
cat PROBLEM_SOLUTION_SUMMARY.md
```
**Time:** 2 minutes  
**Learn:** What's wrong and why

### Step 2: Apply Quick Fix
```bash
cat VERCEL_QUICK_FIX.md
```
**Time:** 3 minutes  
**Do:** Set DATABASE_URL in Vercel → Redeploy

### Step 3: Test
```bash
# After redeploy
curl https://apartmany-vita.vercel.app/api/test-env
```
**Expected:** `"status": "READY"`

**✅ DONE!** Your booking should work now.

---

## 📚 COMPLETE SETUP (2 hours)

### For first-time deployment or deep understanding:

**Step 1:** Understand the problem  
→ [PROBLEM_SOLUTION_SUMMARY.md](./PROBLEM_SOLUTION_SUMMARY.md) - 2 min

**Step 2:** Read deployment guide  
→ [VERCEL_PRODUCTION_FIX.md](./VERCEL_PRODUCTION_FIX.md) - 30 min

**Step 3:** Follow checklist  
→ [VERCEL_DEPLOYMENT_CHECKLIST.md](./VERCEL_DEPLOYMENT_CHECKLIST.md) - 45 min

**Step 4:** Test deployment  
```bash
./scripts/verify-production.sh https://apartmany-vita.vercel.app
```

**Step 5:** Monitor  
- Check `/api/test-env` endpoint
- Review Vercel logs

---

## 🗺️ ALL DOCUMENTATION

### Quick Reference
| Document | Time | Purpose |
|----------|------|---------|
| [**START_HERE.md**](./START_HERE.md) | 1 min | You are here! |
| [**PROBLEM_SOLUTION_SUMMARY.md**](./PROBLEM_SOLUTION_SUMMARY.md) | 2 min | Problem overview |
| [**VERCEL_QUICK_FIX.md**](./VERCEL_QUICK_FIX.md) | 5 min | Fast solution |
| [**VERCEL_PRODUCTION_FIX.md**](./VERCEL_PRODUCTION_FIX.md) | 30 min | Complete guide |
| [**VERCEL_DEPLOYMENT_CHECKLIST.md**](./VERCEL_DEPLOYMENT_CHECKLIST.md) | 45 min | Systematic deploy |
| [**PRODUCTION_ISSUE_SUMMARY.md**](./PRODUCTION_ISSUE_SUMMARY.md) | 15 min | Full analysis |
| [**DOCS_NAVIGATION_GUIDE.md**](./DOCS_NAVIGATION_GUIDE.md) | - | Find right doc |
| [**DEPLOYMENT_DOCS_INDEX.md**](./DEPLOYMENT_DOCS_INDEX.md) | - | Index |

---

## 🛠️ TESTING TOOLS

### Check Environment Variables
```bash
curl https://apartmany-vita.vercel.app/api/test-env
```

### Test Database Connection (locally)
```bash
node scripts/test-database-connection.js
```

### Verify Production Deployment
```bash
./scripts/verify-production.sh https://apartmany-vita.vercel.app
```

---

## 🆘 COMMON SCENARIOS

### "Booking redirects back on Vercel"
→ **DATABASE_URL** is missing  
→ Read: [VERCEL_QUICK_FIX.md](./VERCEL_QUICK_FIX.md) → Step 2

### "First time deploying to Vercel"
→ Need complete setup  
→ Read: [VERCEL_PRODUCTION_FIX.md](./VERCEL_PRODUCTION_FIX.md)  
→ Follow: [VERCEL_DEPLOYMENT_CHECKLIST.md](./VERCEL_DEPLOYMENT_CHECKLIST.md)

### "Stripe.js integration over HTTP warning"
→ This is NORMAL in development  
→ Not related to the Vercel production issue

### "Want to understand everything"
→ Read: [PRODUCTION_ISSUE_SUMMARY.md](./PRODUCTION_ISSUE_SUMMARY.md)  
→ Then: [VERCEL_PRODUCTION_FIX.md](./VERCEL_PRODUCTION_FIX.md)

### "Not sure which doc to read"
→ Read: [DOCS_NAVIGATION_GUIDE.md](./DOCS_NAVIGATION_GUIDE.md)  
→ Use decision trees to find your path

---

## ✅ MINIMUM REQUIREMENTS TO FIX

### Vercel Dashboard → Environment Variables:

**Critical (must have):**
```env
DATABASE_URL=postgresql://user:pass@host:port/db
NEXTAUTH_SECRET=[32+ characters]
NEXTAUTH_URL=https://apartmany-vita.vercel.app
BEDS24_LONG_LIFE_TOKEN=your_token_here
```

**For payments:**
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

**Where to get these?**  
→ See [VERCEL_QUICK_FIX.md](./VERCEL_QUICK_FIX.md) → Step 3

---

## 🎉 SUCCESS LOOKS LIKE

After fixing, you should be able to:

1. ✅ Visit https://apartmany-vita.vercel.app
2. ✅ Select an apartment
3. ✅ Choose dates
4. ✅ Click "Rezervovať"
5. ✅ See booking form (NOT redirect back!)
6. ✅ See pricing loaded from Beds24
7. ✅ Complete test payment with Stripe

**Test it:**
```bash
curl https://apartmany-vita.vercel.app/api/test-env
# Should return: "status": "READY"
```

---

## 📞 STILL STUCK?

### Run Diagnostics
```bash
# 1. Check environment
curl https://apartmany-vita.vercel.app/api/test-env

# 2. Verify deployment
./scripts/verify-production.sh https://apartmany-vita.vercel.app

# 3. Check logs
# Go to: Vercel Dashboard → Deployments → Function Logs
```

### Read Troubleshooting
→ [VERCEL_PRODUCTION_FIX.md](./VERCEL_PRODUCTION_FIX.md) → Section "Riešenie problémov"  
→ [VERCEL_DEPLOYMENT_CHECKLIST.md](./VERCEL_DEPLOYMENT_CHECKLIST.md) → "Common Issues"

---

## 🚀 NEXT ACTIONS

### ⚡ If you have 5 minutes:
```bash
1. Read VERCEL_QUICK_FIX.md
2. Set DATABASE_URL in Vercel
3. Redeploy
4. Test with curl /api/test-env
```

### 📖 If you have 30 minutes:
```bash
1. Read PROBLEM_SOLUTION_SUMMARY.md
2. Read VERCEL_PRODUCTION_FIX.md
3. Set all environment variables
4. Redeploy
5. Test with verify-production.sh
```

### ✅ If you have 2 hours (first deployment):
```bash
1. Read DEPLOYMENT_DOCS_INDEX.md
2. Read VERCEL_PRODUCTION_FIX.md (complete)
3. Follow VERCEL_DEPLOYMENT_CHECKLIST.md
4. Set up database
5. Configure Stripe
6. Deploy
7. Test thoroughly
```

---

**🎯 Remember: Start with your time budget, then choose the appropriate guide!**

**📅 Last Updated:** September 30, 2025  
**✨ Ready to deploy!**
