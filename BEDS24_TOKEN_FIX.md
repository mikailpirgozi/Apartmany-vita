# 🔧 BEDS24 TOKEN FIX - Use Working Tokens from Localhost

## 🎯 PROBLÉM
Vercel používa `BEDS24_LONG_LIFE_TOKEN` ktorý je NEPLATNÝ.
Localhost používa `BEDS24_ACCESS_TOKEN` + `BEDS24_REFRESH_TOKEN` ktoré FUNGUJÚ.

## ✅ RIEŠENIE

Vo Vercel Dashboard použite TIE ISTÉ tokeny ako na localhoste:

### Choďte do Vercel:
```
https://vercel.com/dashboard
→ Váš projekt
→ Settings
→ Environment Variables
```

### Pridajte/Upravte tieto premenné:

```
Name: BEDS24_ACCESS_TOKEN
Value: XwJnUUA7YS9aHRIBFPhVWiIEBlb/+whEpT0SRe7m5IWp30A9+uJlz54IN+KTAYSFNkftzJQ9ODvTYrafP6c2o3sUExKkk288hi7lKcuJZ8zxfh3CxnUZckm/W3dGGs1ibWb1BIr/ch69m5RKYemFu/Rn6KfTjwgMUi+zyCgifcg=
Environment: ✅ Production, ✅ Preview

Name: BEDS24_REFRESH_TOKEN
Value: QsCylbIZO1MkEotBI6lEy5YMzGfJAuAK3FAb65FvW4bj2FsX9tY8svDSSCVm3oNKst+cXZx0hB/u9gPtn39beUSjcRLL6CRYujpgOfBhboFKbclRLGE6HBusZJL+zAw+/BAaZp2xRdLh65BJsnS9idjZ8khgLvQKzcHJg3d4anM=
Environment: ✅ Production, ✅ Preview
```

### ODSTRÁŇTE (alebo nechajte, ale nie je potrebný):
```
BEDS24_LONG_LIFE_TOKEN
```

Kód automaticky použije `ACCESS_TOKEN` + `REFRESH_TOKEN` ak `LONG_LIFE_TOKEN` chýba.

### Redeploy:
```
Deployments → Redeploy
```

---

## 🎉 VÝSLEDOK

Po redeploy:
```
https://apartmany-vita.vercel.app/apartments/deluxe-apartman
→ ✅ Kalendár sa načíta
→ ✅ Ceny sa zobrazia
→ ✅ Môžete rezervovať
→ ✅ Booking flow bude fungovať!
```

---

**Toto je finálne riešenie! Použite working tokeny z localhostu!** 🚀
