# ✅ Admin Panel Deployment Checklist

## 📦 Čo Bolo Implementované

### ✅ Database Changes
- [x] Prisma schema update - pridané `isAdmin` field do User modelu
- [x] Migration pripravená (spustí sa automaticky pri deploy)

### ✅ Backend API
- [x] `/api/admin/upload` - upload fotiek do Vercel Blob
- [x] `/api/admin/apartments` - získanie zoznamu apartmánov
- [x] `/api/admin/apartments/[id]` - detail a update apartmánu
- [x] Admin autorizácia pre `pirgozi1@gmail.com`

### ✅ Frontend UI
- [x] Admin panel route: `/admin/apartments`
- [x] `ApartmentImageManager` komponent
- [x] Drag & drop upload
- [x] Image reordering
- [x] Delete images
- [x] Live preview

### ✅ Security
- [x] Admin role check na každom endpointe
- [x] File type validation (JPEG, PNG, WebP)
- [x] File size validation (max 5MB)
- [x] Session-based authentication

### ✅ Configuration
- [x] Next.js image domains (Vercel Blob)
- [x] Environment variables template
- [x] Package dependencies (@vercel/blob)

### ✅ Documentation
- [x] `ADMIN_PANEL_SETUP.md` - Technical setup guide
- [x] `QUICK_START_ADMIN.md` - User-friendly guide
- [x] `DEPLOYMENT_CHECKLIST_ADMIN.md` - This file
- [x] README.md update

---

## 🚀 Pre Deployment (Railway)

### 1. GitHub Push
```bash
cd "apartmany-vita"
git add .
git commit -m "feat: add admin panel for apartment image management

- Add @vercel/blob for image storage
- Create admin authorization system (pirgozi1@gmail.com)
- Add API endpoints for image upload and apartment management
- Create admin UI for image management (/admin/apartments)
- Add drag & drop, reorder, and delete functionality
- Update documentation and setup guides"

git push origin main
```

### 2. Railway Environment Variables

**Dashboard → Variables → Add New:**

```bash
# Vercel Blob Token
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXX
```

**Ako získať token:**
1. Choď na https://vercel.com/dashboard
2. Vyber projekt (alebo vytvor nový)
3. Storage → Create Database → Blob
4. Skopíruj `BLOB_READ_WRITE_TOKEN`

### 3. Database Migration

Railway automaticky spustí:
```bash
pnpm prisma migrate deploy
```

**Check migration status:**
```bash
railway run pnpm prisma migrate status
```

### 4. Verify Deployment

Po deployi skontroluj:

1. **Health Check:**
   ```
   https://apartmanvita.sk/api/health
   ```

2. **Admin Panel:**
   ```
   https://apartmanvita.sk/admin/apartments
   ```

3. **Login:**
   - Prihlás sa cez Google (`pirgozi1@gmail.com`)
   - Overí že vidíš admin panel

4. **Upload Test:**
   - Nahraj test fotku
   - Overí že sa uložila do Vercel Blob
   - Overí že sa zobrazuje na stránke

---

## 🔧 Post-Deployment Tasks

### Immediate (Do 1 hodiny)
- [ ] Prihlás sa do admin panelu
- [ ] Nahraj test fotku (overenie že Blob funguje)
- [ ] Zmaž test fotku
- [ ] Skontroluj že fotky sa zobrazujú na homepage

### First Day
- [ ] Nahraj všetky fotky Design apartmánu
- [ ] Nahraj všetky fotky Lite apartmánu  
- [ ] Nahraj všetky fotky Deluxe apartmánu
- [ ] Nastav hlavné fotky (prvá v zozname)
- [ ] Skontroluj responzívnosť na mobile

### First Week
- [ ] Monitor error logs v Railway
- [ ] Skontroluj Vercel Blob usage
- [ ] Get user feedback na fotky
- [ ] Optimize image ordering podľa analytics

---

## 📊 Monitoring

### Railway Logs
```bash
railway logs --service apartmany-vita
```

### Vercel Blob Dashboard
- https://vercel.com/dashboard/stores
- Sleduj storage usage
- Check CDN bandwidth

### Error Tracking
Check Railway logs pre:
- `Upload error:`
- `Unauthorized`
- `Failed to update apartment`

---

## 🆘 Rollback Plan

Ak niečo nefunguje:

### Quick Rollback
```bash
# Railway Dashboard → Deployments → Previous deployment → Redeploy
```

### Database Rollback
```bash
# Ak migration pokazila DB
railway run pnpm prisma migrate resolve --rolled-back 20250930_add_admin_role
```

### Remove Admin Feature
```bash
git revert HEAD
git push origin main
```

---

## 🎯 Success Criteria

Admin panel je úspešne nasadený keď:

- ✅ Prihlásenie cez `pirgozi1@gmail.com` funguje
- ✅ Admin panel `/admin/apartments` je prístupný
- ✅ Upload fotiek funguje (Vercel Blob)
- ✅ Fotky sa zobrazujú na homepage
- ✅ Reordering a delete funguje
- ✅ Žiadne errors v Railway logs
- ✅ Page load time < 2s
- ✅ Mobile responsive

---

## 📞 Support Contacts

**Technical Issues:**
- Railway Support: https://railway.app/help
- Vercel Support: https://vercel.com/support
- GitHub Issues: [your-repo]/issues

**Documentation:**
- Admin Setup: `ADMIN_PANEL_SETUP.md`
- Quick Start: `QUICK_START_ADMIN.md`
- Implementation Plan: `IMPLEMENTATION_PLAN.md`

---

**Pripravené pre deployment:** ✅  
**Dátum:** 30.09.2025  
**Verzia:** 1.0.0  
**Autor:** Mikail Pirgozi

