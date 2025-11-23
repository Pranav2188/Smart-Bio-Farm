# 🚀 Quick Access - Smart Bio Farm

**Last Updated:** November 23, 2025  
**Status:** ✅ LIVE

---

## 🌐 Live URLs

### Production
- **Frontend:** https://smartbiofarm.web.app
- **Backend:** https://trip-defender-backend.onrender.com

### Admin Consoles
- **Firebase:** https://console.firebase.google.com/project/smartbiofarm
- **Render:** https://dashboard.render.com

---

## ⚡ Quick Commands

### Frontend
```bash
# Development
npm start                    # Start dev server (port 3000)

# Build & Deploy
npm run build               # Build production bundle
npm run deploy:firebase     # Deploy to Firebase Hosting

# Testing
npm test                    # Run tests
```

### Backend
```bash
cd backend

# Development
npm start                   # Start backend (port 5000)
npm run dev                 # Start with nodemon

# Deployment
npm run prepare-credentials # Prepare Firebase credentials
npm run deploy:prod        # Deploy to production
npm run health:prod        # Check backend health

# Monitoring
npm run deployment-history # View deployment history
npm run env:list          # List environments
```

### Combined Development
```bash
npm start                   # Starts both frontend & backend
npm run dev                 # Dev mode (kills all on failure)
```

---

## 📱 Test URLs

### Quick Tests
```bash
# Frontend
https://smartbiofarm.web.app

# Backend Health
https://trip-defender-backend.onrender.com/

# Backend Validation
https://trip-defender-backend.onrender.com/validate-admin-code
```

### PowerShell Tests
```powershell
# Frontend
Invoke-WebRequest -Uri https://smartbiofarm.web.app

# Backend
Invoke-WebRequest -Uri https://trip-defender-backend.onrender.com/
```

---

## 🔑 Key Features

### For Farmers
- ✅ Animal management (pigs, chickens)
- ✅ Live weather updates
- ✅ Alert system
- ✅ Veterinary requests
- ✅ Analytics dashboard
- ✅ Multi-language (EN, HI, MR)

### For Veterinarians
- ✅ Request management
- ✅ Push notifications
- ✅ Farmer communication

### For Government
- ✅ Alert monitoring
- ✅ Activity tracking
- ✅ Dashboard access

---

## 📊 Status Check

### Quick Health Check
```bash
cd backend
npm run health:prod
```

Expected output:
```
✓ Status: HEALTHY ✓
Environment: production
Response Time: <500ms (warm) or ~30s (cold start)
```

---

## 🐛 Quick Troubleshooting

### Frontend Issues
```bash
# Clear cache and rebuild
npm run build
npm run deploy:firebase
```

### Backend Issues
```bash
# Check health
cd backend
npm run health:prod

# View logs in Render dashboard
# https://dashboard.render.com
```

### Common Issues
- **Backend slow?** Cold start (wait 30s)
- **Notifications not working?** Check browser permissions
- **Mobile layout broken?** Clear browser cache

---

## 📚 Documentation

- **Deployment Guide:** `DEPLOYMENT_GUIDE.md`
- **Deployment Success:** `DEPLOYMENT_SUCCESS.md`
- **Verification Report:** `DEPLOYMENT_VERIFICATION.md`
- **Backend Docs:** `backend/docs/DEPLOYMENT.md`
- **Troubleshooting:** `backend/docs/TROUBLESHOOTING.md`
- **Accessibility Audit:** `.kiro/specs/mobile-responsive-dashboard/ACCESSIBILITY_AUDIT_REPORT.md`

---

## 🎯 Quick Stats

### Deployment
- **Frontend:** Firebase Hosting
- **Backend:** Render.com (Free Tier)
- **Database:** Firebase Firestore
- **Auth:** Firebase Authentication

### Performance
- **Build Size:** 365.93 kB (gzipped)
- **Load Time:** <2s on 4G
- **Backend Response:** <500ms (warm)
- **Uptime:** 24/7

### Accessibility
- **Touch Targets:** 44x44px ✅
- **Text Size:** 16px+ ✅
- **Color Contrast:** WCAG AA ✅
- **Keyboard Nav:** Full support ✅

---

## 🔄 Update Workflow

### Frontend Updates
```bash
# 1. Make changes
# 2. Test locally
npm start

# 3. Build and deploy
npm run build
npm run deploy:firebase
```

### Backend Updates
```bash
# 1. Make changes
# 2. Test locally
cd backend
npm start

# 3. Push to GitHub (auto-deploys)
git add .
git commit -m "Update description"
git push origin main

# 4. Verify deployment
npm run health:prod
```

---

## 📞 Support

### Need Help?
1. Check documentation files
2. Review troubleshooting guide
3. Check Firebase/Render dashboards
4. Review deployment logs

### Useful Links
- Firebase Docs: https://firebase.google.com/docs
- Render Docs: https://render.com/docs
- React Docs: https://react.dev
- Tailwind CSS: https://tailwindcss.com

---

## ✅ Deployment Checklist

- [x] Frontend built successfully
- [x] Frontend deployed to Firebase
- [x] Backend running on Render
- [x] Health checks passing
- [x] Mobile responsive working
- [x] Accessibility compliant
- [x] Push notifications working
- [x] Multi-language support active
- [x] Real-time updates working
- [x] Charts rendering correctly

---

**Status:** 🟢 ALL SYSTEMS OPERATIONAL

**Quick Access Card - Keep this handy for daily operations!**
