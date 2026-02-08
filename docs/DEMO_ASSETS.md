# Demo Assets Guide

This guide explains how to add screenshots and demo assets to showcase your Financial Tracker application.

## Overview

Adding visual demonstrations of your application helps potential users understand its features before trying it. This includes screenshots, GIFs, and optionally a demo video.

## Folder Structure

```
financial-tracker/
├── docs/
│   ├── images/
│   │   ├── dashboard-screenshot.png
│   │   ├── transaction-form.png
│   │   ├── savings-goals.png
│   │   ├── demo.gif
│   │   └── mobile-view.png
│   └── DEMO_ASSETS.md (this file)
└── README.md
```

## Creating Screenshots

### Desktop Screenshots

1. **Dashboard View**
   - Open the application at `http://localhost:5173`
   - Ensure you have some sample data visible
   - Take a full-page screenshot
   - Recommended size: 1920x1080 or 1440x900
   - Save as `docs/images/dashboard-screenshot.png`

2. **Transaction Form**
   - Navigate to "Add Transaction"
   - Fill in sample data
   - Take screenshot
   - Save as `docs/images/transaction-form.png`

3. **Savings Goals**
   - Ensure dashboard shows goals with progress bars
   - Take screenshot focusing on goals section
   - Save as `docs/images/savings-goals.png`

### Mobile Screenshots

1. **Open Chrome DevTools**
   - Press F12 or Cmd+Option+I (Mac)
   - Click the device toolbar icon (or press Cmd+Shift+M)

2. **Select Device**
   - Choose "iPhone 12 Pro" or "Pixel 5"
   - Take screenshot
   - Save as `docs/images/mobile-view.png`

### Tools for Screenshots

- **macOS**: Cmd+Shift+4 (select area) or Cmd+Shift+3 (full screen)
- **Windows**: Windows+Shift+S (Snipping Tool)
- **Linux**: Screenshot application or Shutter
- **Browser Extension**: [Awesome Screenshot](https://www.awesomescreenshot.com/)

## Creating an Animated GIF Demo

### Recommended Tools

1. **LICEcap** (Free, Windows/macOS)
   - Download: https://www.cockos.com/licecap/
   - Simple and lightweight
   - Records directly to GIF

2. **ScreenToGif** (Free, Windows)
   - Download: https://www.screentogif.com/
   - More features, includes editor

3. **Kap** (Free, macOS)
   - Download: https://getkap.co/
   - Modern interface
   - Can export to GIF or video

4. **Peek** (Free, Linux)
   - Install via package manager
   - Simple GIF recorder

### Recording Guidelines

1. **Keep it Short**: 10-20 seconds max
2. **Show Key Features**: 
   - Adding a transaction
   - Viewing updated balance
   - Progress toward a goal
3. **Frame Rate**: 10-15 FPS is sufficient
4. **Size**: Keep under 5MB
5. **Resolution**: 1280x720 or smaller

### Sample Recording Flow

```
1. Start on dashboard (2 seconds)
2. Click "Add Transaction" (1 second)
3. Fill in income form (3 seconds)
4. Submit and see balance update (2 seconds)
5. Show updated KPI cards (2 seconds)
```

## Optimizing Images

### Compression Tools

- **TinyPNG**: https://tinypng.com/ (Web-based, free)
- **ImageOptim**: https://imageoptim.com/ (macOS)
- **Squoosh**: https://squoosh.app/ (Web-based, Google)

### Guidelines

- PNG for screenshots (lossless)
- JPEG for photos (if any)
- WebP for best compression (modern browsers)
- Target: < 500KB per image
- GIF: < 5MB

## Adding Images to README

Once you have your images, update the README:

```markdown
## Screenshots

### Dashboard
![Dashboard](docs/images/dashboard-screenshot.png)

### Mobile View
<img src="docs/images/mobile-view.png" width="300" alt="Mobile View">

### Demo
![Demo](docs/images/demo.gif)
```

## Adding Badges

Add status badges at the top of README:

```markdown
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
```

## Creating a Demo Video (Optional)

### Tools

- **Loom**: https://loom.com (Free tier available)
- **OBS Studio**: https://obsproject.com (Free, open source)
- **QuickTime Player**: Built into macOS

### Video Guidelines

1. **Length**: 1-3 minutes
2. **Resolution**: 1920x1080 (1080p)
3. **Content**:
   - Quick intro (10 seconds)
   - Feature walkthrough (2 minutes)
   - Call to action (10 seconds)
4. **Narration**: Optional but helpful
5. **Upload**: YouTube or Vimeo

### Adding Video to README

```markdown
## Video Demo

[![Watch Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)
```

## GitHub Social Preview

Create a social media preview image:

1. **Size**: 1280x640 pixels
2. **Content**: App name + key visual
3. **Upload**: 
   - Go to repo Settings
   - Scroll to "Social preview"
   - Upload image

## Sample Data for Screenshots

Use this sample data for impressive screenshots:

### Transactions
- Income: Salary £3,500 (monthly)
- Income: Freelance £750
- Expense: Rent £1,200
- Expense: Groceries £300
- Expense: Transportation £150
- Expense: Entertainment £100

### Savings Goals
- Emergency Fund: £5,000 / £10,000 (50%)
- Vacation: £1,500 / £3,000 (50%)
- New Laptop: £800 / £1,200 (67%)

## Checklist

- [ ] Dashboard screenshot taken
- [ ] Mobile view screenshot taken
- [ ] Demo GIF created
- [ ] All images optimized (< 500KB each)
- [ ] Images added to `docs/images/` folder
- [ ] README updated with images
- [ ] Badges added to README
- [ ] GitHub social preview set
- [ ] Demo video created (optional)

## Resources

- [GitHub Badges](https://shields.io/)
- [Awesome README](https://github.com/matiassingers/awesome-readme)
- [How to Write a Good README](https://www.makeareadme.com/)
