# 🚀 Getting Started - Quick Guide

## Step 1: Install Node.js (if not already installed)

### Download & Install Node.js:
1. Go to: **https://nodejs.org/**
2. Download the **LTS version** (Recommended)
3. Run the installer
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Install MongoDB:
1. Go to: **https://www.mongodb.com/try/download/community**
2. Download for Windows
3. Run the installer
4. Install as a Windows Service

---

## Step 2: Install Project Dependencies

Open **PowerShell** or **Command Prompt** and run:

```bash
# Navigate to the project
cd "C:\Users\PARTH SAGAR\OneDrive\Desktop\Cursor_Projects\Property_Finder_Clone"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## Step 3: Create Environment Files

### Create `backend/.env` file:

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/property-finder
JWT_SECRET=change-this-to-a-random-string-in-production
OPENAI_API_KEY=
NODE_ENV=development
```

### Create `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_OPENAI_API_KEY=
```

---

## Step 4: Start MongoDB

**Option A: If installed as Windows Service**
- MongoDB should start automatically

**Option B: Manual start**
```bash
# Open new terminal
mongod --dbpath="C:\data\db"
```

---

## Step 5: Run the Application

Open **TWO separate terminals**:

### Terminal 1 - Backend Server:
```bash
cd "C:\Users\PARTH SAGAR\OneDrive\Desktop\Cursor_Projects\Property_Finder_Clone\backend"
npm run start:dev
```

Wait until you see:
```
🚀 Server running on http://localhost:3001
📚 Swagger docs available at http://localhost:3001/api
```

### Terminal 2 - Frontend Server:
```bash
cd "C:\Users\PARTH SAGAR\OneDrive\Desktop\Cursor_Projects\Property_Finder_Clone\frontend"
npm run dev
```

Wait until you see:
```
- ready started server on 0.0.0.0:3000
- Local: http://localhost:3000
```

---

## Step 6: Open the Application

Open your browser and go to:
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:3001/api

---

## Troubleshooting

### Issue: "npm is not recognized"
**Solution**: Install Node.js from https://nodejs.org/

### Issue: "MongoDB connection failed"
**Solution**: 
1. Check if MongoDB is running
2. Verify MongoDB is installed: `mongod --version`
3. Start MongoDB manually if needed

### Issue: "Port 3000 or 3001 already in use"
**Solution**: Kill the process using that port:
```powershell
# Find process on port 3001
netstat -ano | findstr :3001
# Kill it (replace <PID> with actual process ID)
taskkill /PID <PID> /F
```

### Issue: "Module not found"
**Solution**: 
```bash
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

---

## Quick Commands Reference

### Backend
```bash
cd backend
npm run start:dev    # Start development server
npm run build        # Build for production
npm test             # Run tests
```

### Frontend
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

---

## What You Should See

✅ **Backend running on**: http://localhost:3001
- API Documentation available at `/api`
- All endpoints accessible

✅ **Frontend running on**: http://localhost:3000
- Landing page with property search
- AI Avatar component
- Property listings
- Interactive map

---

## Next Steps

1. ✨ Explore the frontend UI
2. 📖 Read the API documentation at http://localhost:3001/api
3. 🔧 Start customizing components
4. 📝 Add your own features
5. 🧪 Test the application

---

## Need Help?

- 📚 Read `README.md` for overview
- 🏗️ Check `docs/ARCHITECTURE.md` for system design
- 🔧 See `docs/SETUP.md` for detailed setup
- 💬 Contact for support

Happy coding! 🚀

