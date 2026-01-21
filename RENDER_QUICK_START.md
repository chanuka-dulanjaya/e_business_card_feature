# 🚀 Quick Start: Deploy to Render.com

Follow these simple steps to deploy your Online Business Card application to Render.com.

---

## ⚡ 5-Minute Deployment

### Step 1: Push to GitHub

```bash
# If you haven't already
git init
git add .
git commit -m "Ready for Render deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to https://render.com and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Fill in these settings:

   **Build Command:**
   ```
   npm install && npm run build
   ```

   **Start Command:**
   ```
   npm start
   ```

### Step 3: Add Environment Variables

Click **"Environment"** and add:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://overdimetechteam_db_user:CzNL3v6eiZIZHhTt@businesscard.s5ipwjh.mongodb.net/BusinessCardDB?retryWrites=true&w=majority
JWT_SECRET=d17921a46034375d2ec920dcffa18259b9ec979ae734aa29f46345ecede0044f
```

### Step 4: Deploy!

Click **"Create Web Service"** and wait 5-10 minutes.

### Step 5: Create Admin User

Once deployed, create your admin account:

```bash
# Replace YOUR_APP_URL with your Render URL
curl -X POST https://YOUR_APP_URL.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@youremail.com",
    "password": "YourSecurePassword123",
    "fullName": "Your Name",
    "role": "admin"
  }'
```

### Step 6: Access Your App

Visit: `https://YOUR_APP_URL.onrender.com`

Login with your admin credentials!

---

## 🎯 That's It!

Your application is now live! 🎉

**Need help?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## 📱 What You Get

- ✅ Full-stack app running on Render
- ✅ MongoDB Atlas database
- ✅ JWT authentication
- ✅ Admin dashboard
- ✅ QR code generation
- ✅ Public employee profiles
- ✅ Free SSL certificate
- ✅ Auto-deploy on Git push

---

## ⚠️ Important Notes

**Free Tier:**
- App sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- Upgrade to Starter ($7/month) for always-on service

**MongoDB Atlas:**
- Make sure IP whitelist includes `0.0.0.0/0` (allow all)
- Or add Render's IP ranges specifically

---

## 🔄 Updating Your App

To deploy updates:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render automatically redeploys! 🚀
