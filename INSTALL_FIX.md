# Fix for npm install issues

## The Problem

You encountered a peer dependency conflict between `@react-three/fiber` and `@react-three/xr`.

## Solution: Use --legacy-peer-deps

Run this command to install dependencies:

```bash
cd frontend
npm install --legacy-peer-deps
```

This flag tells npm to ignore peer dependency conflicts and install anyway.

---

## Alternative: Clean Install

If you still have issues, try a clean install:

```bash
cd frontend

# Remove existing files
rm -rf node_modules package-lock.json

# Install with legacy peer deps
npm install --legacy-peer-deps
```

---

## What I Changed

I removed these conflicting packages from `package.json`:
- `@react-three/xr` (VR library - not essential for MVP)
- `react-speech-recognition` (can be added later)

These were causing conflicts. You can still add VR/WebXR features later if needed.

---

## After Installation

Once `npm install --legacy-peer-deps` completes successfully:

1. ✅ Verify installation:
   ```bash
   npm list @react-three/fiber
   ```

2. ✅ Start the dev server:
   ```bash
   npm run dev
   ```

3. ✅ You should see:
   ```
   ▲ Next.js 14.x.x
   - Local: http://localhost:3000
   ```

---

## If Issues Persist

Try installing specific versions:

```bash
npm install --legacy-peer-deps --save-exact
```

Or use yarn:

```bash
npm install -g yarn
yarn install
```

