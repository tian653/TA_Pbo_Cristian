# PWA Icons Documentation

## 🎨 Current Icons

**Design**: Gunung (mountains) + Jalan (road) + Signal waves
- **Background**: Blue (#2563EB - primary-600)
- **Mountains**: White (2 peaks)
- **Road**: Dark gray (#1F2937) with yellow stripes (#FCD34D)
- **Signal**: Orange/yellow waves at top

**Files**:
- `icon.svg` - Master SVG source (512x512)
- `favicon.svg` - Same as icon.svg (for modern browsers)
- `favicon.ico` - 32x32 PNG fallback
- `icons/icon-192.png` - PWA icon (192x192)
- `icons/icon-512.png` - PWA icon (512x512)

---

## 🔄 Regenerate Icons (If SVG Changed)

### 1. Edit the Master SVG
Edit `public/icon.svg` with your design changes.

### 2. Install Dependencies (First Time Only)
```bash
npm install --save-dev sharp
```

### 3. Run Generator Script
```bash
node -e "
const sharp = require('sharp');
const sizes = [192, 512];

async function generate() {
  // Generate PNG icons
  for (const size of sizes) {
    await sharp('public/icon.svg')
      .resize(size, size)
      .png()
      .toFile(\`public/icons/icon-\${size}.png\`);
    console.log(\`✅ icon-\${size}.png\`);
  }
  
  // Generate favicon.ico
  await sharp('public/icons/icon-192.png')
    .resize(32, 32)
    .toFile('public/favicon.ico');
  console.log('✅ favicon.ico');
  
  console.log('🎉 Done!');
}

generate().catch(console.error);
"
```

### 4. Copy favicon.svg
```bash
cp public/icon.svg public/favicon.svg
```

### 5. Rebuild PWA
```bash
npm run build
```

---

## 📱 PWA Manifest Configuration

Defined in `vite.config.ts`:
```typescript
manifest: {
  name: 'Bencana Dairi - Sistem Informasi Pelaporan',
  short_name: 'Bencana Dairi',
  theme_color: '#2563EB',
  icons: [
    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
}
```

---

## 🎯 Icon Guidelines

**Safe Zone (for maskable icons)**:
- Keep important elements inside 80% center area
- OS may crop/mask outer 10% on each side

**Colors**:
- Background: `#2563EB` (primary brand blue)
- Mountains: `#FFFFFF` (white)
- Road: `#1F2937` (gray-800)
- Accents: `#FCD34D` (amber-300) for road stripes & signal

**Export Settings**:
- Format: PNG
- Color Mode: RGB
- Transparency: No (use solid background)
- Resolution: 72 DPI minimum

---

## 🔍 Test Icons

### Browser
1. Open http://localhost:5173
2. Check favicon in tab
3. Open DevTools → Application → Manifest
4. Verify icons load correctly

### Install PWA (Desktop Chrome)
1. Navigate to app
2. Click "Install" button in address bar
3. Check desktop icon appears correctly

### Install PWA (Mobile)
1. Open in mobile browser
2. Add to Home Screen
3. Check icon on home screen

---

## 📋 Checklist Before Deploy

- [ ] SVG design finalized
- [ ] PNG icons generated (192, 512)
- [ ] favicon.ico generated (32x32)
- [ ] favicon.svg copied
- [ ] index.html updated
- [ ] vite.config.ts manifest correct
- [ ] Build successful (`npm run build`)
- [ ] Icons tested in browser
- [ ] PWA install tested

---

**Last Updated**: 2026-11-17  
**Designer**: Kabupaten Dairi Team
