# Deployment Guide - Render.com

This guide will help you deploy your Online Business Card application to Render.com.

## Prerequisites

1. A Render.com account (free tier available)
2. Your MongoDB Atlas connection string
3. Git repository (GitHub, GitLab, or Bitbucket)

---

## Step-by-Step Deployment

### 1. Prepare Your Repository

First, make sure your code is pushed to a Git repository (GitHub recommended).

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for Render deployment"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/your-username/online-business-card.git

# Push to GitHub
git push -u origin main
```

### 2. Sign Up / Log In to Render.com

1. Go to https://render.com
2. Sign up or log in
3. Connect your GitHub/GitLab/Bitbucket account

### 3. Create a New Web Service

1. Click **"New +"** button in Render dashboard
2. Select **"Web Service"**
3. Connect your repository
4. Select the repository: `online-business-card`

### 4. Configure the Web Service

Fill in the following settings:

**Basic Settings:**
- **Name:** `online-business-card` (or your preferred name)
- **Region:** Choose closest to your users (e.g., Oregon)
- **Branch:** `main` (or your default branch)
- **Root Directory:** Leave empty
- **Runtime:** `Node`

**Build & Deploy:**
- **Build Command:**
  ```bash
  npm install && npm run build
  ```
- **Start Command:**
  ```bash
  npm start
  ```

**Plan:**
- Select **"Free"** (or upgrade if needed)

### 5. Set Environment Variables

Click on **"Environment"** or **"Advanced"** and add these environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `mongodb+srv://overdimetechteam_db_user:CzNL3v6eiZIZHhTt@businesscard.s5ipwjh.mongodb.net/BusinessCardDB?retryWrites=true&w=majority` |
| `JWT_SECRET` | `d17921a46034375d2ec920dcffa18259b9ec979ae734aa29f46345ecede0044f` |
| `PORT` | `10000` (Render will automatically set this) |

**Important:**
- Keep `MONGODB_URI` and `JWT_SECRET` secret
- Never commit `.env` file to Git (it's already in `.gitignore`)

### 6. Deploy!

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build the frontend
   - Start the server
   - Assign a URL (e.g., `https://online-business-card.onrender.com`)

**Note:** First deployment may take 5-10 minutes.

---

## Post-Deployment Setup

### 1. Create Your First Admin User

Once deployed, create an admin account using the API:

```bash
curl -X POST https://your-app.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "your-secure-password",
    "fullName": "Admin User",
    "role": "admin"
  }'
```

**Replace:**
- `your-app.onrender.com` with your actual Render URL
- Change email and password to your preferred credentials

### 2. Access Your Application

Visit your Render URL: `https://your-app.onrender.com`

Login with the admin credentials you just created.

---

## Updating Your Application

To deploy updates:

```bash
# Make your changes
git add .
git commit -m "Your update message"
git push origin main
```

Render will automatically detect the push and redeploy!

---

## MongoDB Atlas Configuration

Make sure your MongoDB Atlas is configured correctly:

### 1. Network Access
1. Go to MongoDB Atlas dashboard
2. Navigate to **"Network Access"**
3. Click **"Add IP Address"**
4. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Or add Render's specific IPs if you prefer
5. Click **"Confirm"**

### 2. Database User
1. Go to **"Database Access"**
2. Verify user `overdimetechteam_db_user` exists
3. Make sure it has **"Read and write to any database"** permissions

---

## Custom Domain (Optional)

### Add Your Own Domain

1. In Render dashboard, go to your service
2. Click on **"Settings"**
3. Scroll to **"Custom Domains"**
4. Click **"Add Custom Domain"**
5. Enter your domain (e.g., `businesscard.yourdomain.com`)
6. Follow DNS configuration instructions
7. Render provides free SSL certificates!

---

## Monitoring & Logs

### View Logs
1. Go to your service in Render dashboard
2. Click on **"Logs"** tab
3. See real-time application logs

### Health Checks
Render automatically monitors: `https://your-app.onrender.com/api/health`

---

## Important Notes

### Free Tier Limitations
- **Sleep after inactivity:** Free tier services sleep after 15 minutes of inactivity
- **Wake up time:** First request after sleep takes ~30 seconds
- **Solution:** Upgrade to paid plan ($7/month) for always-on service

### Cold Starts
If using free tier:
- First visit after inactivity will be slow
- Consider using a service like UptimeRobot to ping your app every 14 minutes

---

## Troubleshooting

### Build Fails
**Problem:** Build command fails
**Solution:** Check logs for errors, ensure all dependencies are in `package.json`

### App Crashes After Deploy
**Problem:** Server crashes immediately
**Solution:**
- Check environment variables are set correctly
- Verify MongoDB connection string
- Check logs for error messages

### MongoDB Connection Failed
**Problem:** Can't connect to MongoDB
**Solution:**
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas network access (whitelist 0.0.0.0/0)
- Ensure database user has proper permissions

### 404 Errors on Routes
**Problem:** React routes return 404
**Solution:** This shouldn't happen with the production server setup, but if it does:
- Ensure `server/production.js` has the catch-all route
- Verify build was successful

---

## Alternative: Manual Deploy with Render.yaml

This project includes a `render.yaml` file. To use it:

1. Push your code to GitHub
2. In Render dashboard, click **"New +"**
3. Select **"Blueprint"**
4. Connect repository
5. Render will auto-detect `render.yaml` and configure everything!

**Note:** You still need to manually add environment variables (`MONGODB_URI` and `JWT_SECRET`)

---

## Cost Estimate

**Free Tier:**
- ✅ Free forever
- ✅ 750 hours/month
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ Slower cold starts

**Starter Plan ($7/month):**
- ✅ Always-on (no sleep)
- ✅ Faster performance
- ✅ 400 build minutes/month

---

## Support

If you encounter issues:
1. Check Render documentation: https://render.com/docs
2. Review logs in Render dashboard
3. Verify MongoDB Atlas configuration
4. Check GitHub repository for any missing files

---

## Quick Reference

**Your URLs after deployment:**
- Application: `https://your-app-name.onrender.com`
- API Health: `https://your-app-name.onrender.com/api/health`
- API Base: `https://your-app-name.onrender.com/api`

**Admin Login:**
- Default: Created via API after deployment
- Change password after first login

---

**That's it! Your application should now be live on Render.com!** 🚀
