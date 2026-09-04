# Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (v6 or higher)
- **Redis** (optional, for caching and queues)
- **Git**

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/property-finder-clone.git
cd property-finder-clone
```

### 2. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd ../backend
npm install
```

### 3. Environment Setup

Create `.env` files from the examples:

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key
```

**Backend** (`.env`):
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/property-finder
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=your_openai_key
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name
```

### 4. Start MongoDB

**MacOS (Homebrew):**
```bash
brew services start mongodb-community
```

**Windows:**
```bash
# Run MongoDB as a service or:
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath="C:\data\db"
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 5. Start Redis (Optional)

```bash
# MacOS
brew services start redis

# Linux
sudo systemctl start redis

# Windows
# Download from https://github.com/microsoftarchive/redis/releases
```

### 6. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 7. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api

## Initial Configuration

### Set up MongoDB Database

The database will be created automatically when you first run the application.

To seed with initial data (optional):

```bash
cd backend
npm run seed
```

### Create First Admin User

```bash
cd backend
npm run create-admin
```

## API Keys Setup

### OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add it to your `.env` files

### Mapbox Token

1. Go to https://account.mapbox.com/access-tokens/
2. Create a new access token
3. Add to `NEXT_PUBLIC_MAPBOX_TOKEN` in frontend `.env.local`

### AWS S3 (Optional)

1. Create an S3 bucket
2. Set up IAM user with S3 access
3. Add credentials to backend `.env`

### Stripe (Optional)

1. Get API keys from https://dashboard.stripe.com/apikeys
2. Add to backend `.env`

## Development Workflow

### Running in Development Mode

```bash
# Frontend with hot reload
cd frontend && npm run dev

# Backend with hot reload
cd backend && npm run start:dev
```

### Running Tests

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# E2E tests
cd backend && npm run test:e2e
```

### Building for Production

```bash
# Frontend
cd frontend && npm run build

# Backend
cd backend && npm run build
```

## Troubleshooting

### Port Already in Use

If port 3000 or 3001 is already in use:

```bash
# Frontend - change in next.config.js or use:
PORT=3001 npm run dev

# Backend - change in .env PORT variable
```

### MongoDB Connection Issues

Check if MongoDB is running:

```bash
mongosh
# or
mongo
```

### Module Not Found Errors

Clean install:

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Generate type definitions
npm run type-check
```

## Docker Setup (Optional)

If you prefer using Docker:

```bash
# Build images
docker-compose build

# Start services
docker-compose up

# Stop services
docker-compose down
```

## IDE Setup

### Recommended VSCode Extensions

- ESLint
- Prettier
- TypeScript
- Tailwind CSS IntelliSense
- Thunder Client (API testing)

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

## Next Steps

1. Read the [Architecture Documentation](./ARCHITECTURE.md)
2. Explore the [API Documentation](http://localhost:3001/api)
3. Check out the [Component Library](./COMPONENTS.md)
4. Review [Best Practices](./BEST_PRACTICES.md)

## Getting Help

- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues page
- **Discord**: Join our community
- **Email**: support@propertyfinder.com

