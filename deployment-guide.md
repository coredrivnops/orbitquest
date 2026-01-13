---
description: Complete guide to deploy HearthIQ to Google Cloud Run
---

# HearthIQ Production Deployment

## Critical Project Details
> **IMPORTANT**: These are the ACTUAL values for this project. Do NOT guess or use generic placeholders.

| Setting | Value |
|---------|-------|
| **GCP Project ID** | `gen-lang-client-0667918696` |
| **Cloud Run Service** | `hearthiq-app` |
| **Region** | `us-central1` |
| **Production URL** | `https://gethearthiq.com` |
| **Cloud Run URL** | `https://hearthiq-app-623622256552.us-central1.run.app` |

---

## 🚀 Quick Deploy (2 Steps)

### Step 1: Push to GitHub
// turbo
```powershell
git add .
git commit -m "Your commit message"
git push
```

### Step 2: Trigger Cloud Build (Choose ONE option)

**Option A: Auto-Deploy (Default)**
- The Cloud Build trigger is configured to **auto-deploy on push to `main`**.
- Just push to GitHub and wait ~3-5 minutes.

**Option B: Manual Trigger via Direct URL**
// turbo
1. Open: https://console.cloud.google.com/cloud-build/triggers?project=gen-lang-client-0667918696
2. Find the `hearthiq-app` trigger
3. Click **"Run"** → **"Run trigger"**

**Option C: Local Terminal (Fastest - gcloud installed!)**
// turbo
```powershell
& 'C:\Users\shrav\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd' builds triggers run 72172132-ebfd-4f08-bf7b-281514dd371a --branch=main
```

---

## 📊 Monitor Build Status

**Direct Link to Build History:**
https://console.cloud.google.com/cloud-build/builds?project=gen-lang-client-0667918696

**Expected Build Steps:**
1. FETCHSOURCE (Clone from GitHub) - ~30s
2. Build (npm ci + npm run build) - ~2-3 min
3. Push (Push Docker image to GCR) - ~30s
4. Deploy (Update Cloud Run) - ~30s

**Total Time:** ~3-5 minutes

---

## ✅ Verify Deployment

After build succeeds:
// turbo
1. Open: https://gethearthiq.com
2. Hard refresh (Ctrl+Shift+R) to bust cache
3. Check a city page to verify changes

---

## 🔧 Troubleshooting

### "Project not found" Error
- The project ID is `gen-lang-client-0667918696`, NOT `hearth-iq` or `hearthiq-app`

### gcloud not available locally
- Use the Cloud Console UI instead: https://console.cloud.google.com/cloud-build/triggers?project=gen-lang-client-0667918696
- Or use Cloud Shell from the browser

### Build Fails
1. Check build logs: https://console.cloud.google.com/cloud-build/builds?project=gen-lang-client-0667918696
2. Common issues:
   - TypeScript errors (run `npm run build` locally first)
   - Missing dependencies (check `package.json`)

---

## 📝 Deployment Checklist
- [ ] Code pushed to GitHub (`git push`)
- [ ] Build triggered (auto or manual)
- [ ] Build succeeded (check build history)
- [ ] Production verified (https://gethearthiq.com)

