# Setup & Deployment Guide

This guide covers local development setup, deployment options, and IDE configuration for the Financial Tracker application.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [GitHub Pages Deployment](#github-pages-deployment)
- [IDE Setup](#ide-setup)
- [Backend Options](#backend-options)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Verify Installation

```bash
node --version  # Should be v16 or higher
npm --version   # Should be 7 or higher
git --version
```

## Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/JohnnyvonH/financial-tracker.git
cd financial-tracker
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including React, Vite, and Lucide icons.

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### 5. Preview Production Build

```bash
npm run preview
```

Serves the production build locally for testing before deployment.

## GitHub Pages Deployment

### One-Time Setup

1. **Update vite.config.js**
   
   Open `vite.config.js` and ensure the `base` field matches your repository name:
   ```javascript
   export default defineConfig({
     base: '/financial-tracker/',
     // ... rest of config
   })
   ```

2. **Install gh-pages package** (if not already installed)
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Add deploy script to package.json**
   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     }
   }
   ```

### Deploy to GitHub Pages

Every time you want to deploy updates:

```bash
npm run deploy
```

This command will:
1. Build your application for production
2. Create/update the `gh-pages` branch
3. Push the build to GitHub Pages

### Enable GitHub Pages (First Time Only)

1. Go to your repository on GitHub: `https://github.com/JohnnyvonH/financial-tracker`
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under **Source**, select `gh-pages` branch
4. Under **Folder**, ensure `/ (root)` is selected
5. Click **Save**
6. Wait 2-5 minutes for deployment

Your site will be live at: `https://johnnyvonh.github.io/financial-tracker/`

### Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to the `public/` directory with your domain
2. Configure DNS settings with your domain provider
3. Enable HTTPS in GitHub Pages settings

## IDE Setup

### Visual Studio Code

**Recommended Extensions:**
- ESLint
- Prettier - Code formatter
- ES7+ React/Redux/React-Native snippets
- Auto Rename Tag
- Path Intellisense

**Settings:**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### PyCharm / WebStorm

1. **Open the project**
   - File → Open → Select the `financial-tracker` folder

2. **Install Node.js plugin** (PyCharm only)
   - Settings → Plugins → Search "Node.js"
   - Install and restart

3. **Configure npm scripts**
   - Right-click `package.json` → Show npm Scripts
   - A panel will appear on the right showing all available scripts
   - Double-click any script to run it

4. **Run development server**
   - Open terminal in PyCharm (Alt+F12 / Option+F12)
   - Run `npm run dev`
   - Or use the npm scripts panel

5. **Enable JSX/React support**
   - Settings → Languages & Frameworks → JavaScript
   - Set JavaScript language version to "React JSX"

### Sublime Text

1. Install Package Control
2. Install packages:
   - Babel (for JSX syntax highlighting)
   - JsPrettier
   - SublimeLinter-eslint

## Backend Options

### Option 1: Firebase (Recommended for Beginners)

**Advantages:** Free tier, no server management, real-time sync, built-in authentication

1. **Install Firebase**
   ```bash
   npm install firebase
   ```

2. **Create Firebase Project**
   - Go to [firebase.google.com](https://firebase.google.com)
   - Create a new project
   - Enable Firestore Database

3. **Configure Firebase**
   Create `src/services/firebase.js`:
   ```javascript
   import { initializeApp } from 'firebase/app';
   import { getFirestore } from 'firebase/firestore';
   
   const firebaseConfig = {
     // Your config from Firebase Console
   };
   
   const app = initializeApp(firebaseConfig);
   export const db = getFirestore(app);
   ```

4. **Replace localStorage calls** with Firestore operations

### Option 2: Supabase (Modern Alternative)

**Advantages:** PostgreSQL database, built-in authentication, real-time subscriptions

1. **Install Supabase**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Get your API keys

3. **Configure Supabase**
   Create `src/services/supabase.js`

### Option 3: Custom Node.js Backend

**Advantages:** Full control, any database, custom business logic

1. **Create separate backend repository**
2. **Tech stack options:**
   - Express.js + MongoDB
   - NestJS + PostgreSQL
   - Fastify + MySQL

3. **Deploy backend:**
   - Railway (recommended)
   - Render
   - Vercel (for serverless)
   - DigitalOcean

4. **Update frontend to make API calls**

## Environment Variables

For sensitive configuration (API keys, backend URLs):

1. **Create `.env` file**
   ```env
   VITE_API_URL=https://your-api.com
   VITE_FIREBASE_API_KEY=your-key-here
   ```

2. **Access in code**
   ```javascript
   const apiUrl = import.meta.env.VITE_API_URL;
   ```

3. **Add to .gitignore**
   ```
   .env
   .env.local
   ```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5173   # Windows (then kill process)
```

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### GitHub Pages 404 Error

- Ensure `base` in `vite.config.js` matches your repo name
- Check that GitHub Pages is enabled and using `gh-pages` branch
- Wait 5-10 minutes after first deployment

### localStorage Not Working

- Check browser privacy settings
- Ensure cookies/storage aren't blocked
- Try a different browser
- Check browser console for errors

### Import Errors

```bash
# Verify all dependencies are installed
npm install

# Check for missing peer dependencies
npm ls
```

## Performance Optimization

### Code Splitting

Implement lazy loading for routes:
```javascript
const Dashboard = React.lazy(() => import('./components/Dashboard'));
```

### Image Optimization

- Use WebP format for images
- Compress images before adding to project
- Use responsive images with `srcset`

### Bundle Size Analysis

```bash
npm run build
npm install -g vite-bundle-visualizer
vite-bundle-visualizer
```

## Testing

### Setup Testing (Optional)

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

## Support

For additional help:
- [Open an issue](https://github.com/JohnnyvonH/financial-tracker/issues)
- Check existing issues for solutions
- Review Vite documentation: [vitejs.dev](https://vitejs.dev)
- Review React documentation: [react.dev](https://react.dev)
