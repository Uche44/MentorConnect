# Deployment Guide - Student-Mentor Portal

This guide covers deploying both the **frontend** (static HTML/CSS/JS) and the **JSON Server backend**.

---

## 📋 Table of Contents

1. [Deployment Options](#deployment-options)
2. [Frontend Deployment](#frontend-deployment)
3. [Backend (JSON Server) Deployment](#backend-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Post-Deployment Steps](#post-deployment-steps)

---

## 🚀 Deployment Options

### Recommended Stack:

| Component    | Service          | Free Tier | Notes                 |
| ------------ | ---------------- | --------- | --------------------- |
| **Frontend** | Vercel / Netlify | ✅ Yes    | Best for static sites |
| **Backend**  | Render / Railway | ✅ Yes    | JSON Server hosting   |

---

## 🎨 Frontend Deployment

The frontend is a static site (HTML/CSS/JS) that can be deployed to any static hosting service.

### Option 1: Vercel (Recommended)

**Steps:**

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy**

   ```bash
   vercel
   ```

4. **Follow prompts:**
   - Set up and deploy? `Y`
   - Which scope? (Select your account)
   - Link to existing project? `N`
   - Project name? `student-mentor-portal`
   - In which directory is your code? `./`
   - Want to override settings? `N`

5. **Production Deployment**
   ```bash
   vercel --prod
   ```

**Configuration:**

Create `vercel.json` in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "**/*.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

---

### Option 2: Netlify

**Steps:**

1. **Install Netlify CLI**

   ```bash
   npm install -g netlify-cli
   ```

2. **Login**

   ```bash
   netlify login
   ```

3. **Deploy**

   ```bash
   netlify deploy
   ```

4. **Specify publish directory:** `.` (current directory)

5. **Production deployment**
   ```bash
   netlify deploy --prod
   ```

**Configuration:**

Create `netlify.toml`:

```toml
[build]
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Option 3: GitHub Pages

**Steps:**

1. **Create `.github/workflows/deploy.yml`:**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

2. **Enable GitHub Pages** in repository settings
3. **Push to main branch**

---

## 🔧 Backend (JSON Server) Deployment

JSON Server needs a Node.js environment to run.

### Option 1: Render (Recommended - Free Tier)

**Steps:**

1. **Create `server.js` in your project root:**

```javascript
const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults({
  static: "./public",
});

const PORT = process.env.PORT || 3000;

// Enable CORS
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

server.use(middlewares);
server.use(router);

server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
});
```

2. **Update `package.json`:**

```json
{
  "name": "student-mentor-portal-api",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "json-server --watch db.json --port 3000"
  },
  "dependencies": {
    "json-server": "^0.17.4"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

3. **Create account on [Render.com](https://render.com)**

4. **Create New Web Service:**
   - Connect your GitHub repository
   - Name: `student-mentor-api`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: `Free`

5. **Deploy** - Render will auto-deploy on push

6. **Get your API URL:** `https://student-mentor-api.onrender.com`

---

### Option 2: Railway

**Steps:**

1. **Create account on [Railway.app](https://railway.app)**

2. **Install Railway CLI:**

   ```bash
   npm install -g @railway/cli
   ```

3. **Login:**

   ```bash
   railway login
   ```

4. **Initialize:**

   ```bash
   railway init
   ```

5. **Deploy:**

   ```bash
   railway up
   ```

6. **Get deployment URL:**
   ```bash
   railway domain
   ```

---

### Option 3: Heroku

**Steps:**

1. **Create `Procfile`:**

   ```
   web: node server.js
   ```

2. **Install Heroku CLI** and login:

   ```bash
   heroku login
   ```

3. **Create app:**

   ```bash
   heroku create student-mentor-api
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

---

## ⚙️ Environment Configuration

### Update Frontend API URL

After deploying the backend, update `js/api.js`:

**Before (Development):**

```javascript
const API_BASE_URL = "http://localhost:3000";
```

**After (Production):**

```javascript
const API_BASE_URL = "https://your-api-url.onrender.com";
// or
const API_BASE_URL = "https://student-mentor-api.railway.app";
```

### Environment Variables Approach (Better)

Create `js/config.js`:

```javascript
const CONFIG = {
  API_BASE_URL:
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://your-api-url.onrender.com",
};
```

Update `api.js`:

```javascript
const API_BASE_URL = CONFIG.API_BASE_URL;
```

Add to all HTML files before other scripts:

```html
<script src="js/config.js"></script>
```

---

## 📝 Post-Deployment Steps

### 1. Test the Deployment

**Frontend:**

- Visit your deployed URL
- Test signup/login
- Test mentor browsing
- Test appointment scheduling

**Backend:**

- Test API endpoints:
  ```bash
  curl https://your-api-url.onrender.com/users
  curl https://your-api-url.onrender.com/appointments
  ```

### 2. Set Up Custom Domain (Optional)

**Vercel/Netlify:**

- Go to project settings
- Add custom domain
- Update DNS records

**Render/Railway:**

- Go to service settings
- Add custom domain
- Update DNS CNAME record

### 3. Enable HTTPS

Most platforms enable HTTPS automatically. Verify:

- ✅ Frontend uses `https://`
- ✅ Backend uses `https://`
- ✅ No mixed content warnings

### 4. Monitor & Maintain

**Free Tier Limitations:**

- Render: Spins down after 15 min inactivity (cold starts)
- Railway: 500 hours/month free
- Vercel/Netlify: Generous bandwidth limits

**Solutions:**

- Use a service like [UptimeRobot](https://uptimerobot.com) to ping your API every 5 minutes
- Upgrade to paid tier for production apps

---

## 🎯 Quick Deployment Checklist

- [ ] Create `server.js` for JSON Server
- [ ] Update `package.json` with start script
- [ ] Deploy backend to Render/Railway
- [ ] Get backend API URL
- [ ] Update `API_BASE_URL` in `js/api.js`
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Test signup/login flow
- [ ] Test appointment creation
- [ ] Verify cross-browser functionality
- [ ] Set up monitoring (optional)
- [ ] Add custom domain (optional)

---

## 🆘 Troubleshooting

### CORS Issues

If you get CORS errors, ensure your `server.js` has:

```javascript
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});
```

### API Not Found (404)

- Check `API_BASE_URL` is correct
- Verify backend is running: visit `https://your-api-url.onrender.com/users`
- Check browser console for errors

### Cold Starts (Render Free Tier)

- First request may take 30-60 seconds
- Use UptimeRobot to keep service warm
- Or upgrade to paid tier

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [JSON Server GitHub](https://github.com/typicode/json-server)

---

## 🎉 You're Done!

Your Student-Mentor Portal is now live and accessible from anywhere! 🚀

**Next Steps:**

- Share the URL with users
- Gather feedback
- Iterate and improve
- Consider migrating to a real database (PostgreSQL, MongoDB) for production

Good luck! 🌟
