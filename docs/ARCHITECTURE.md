# Architecture Documentation

## System Overview

This document describes the architecture of the Property Finder Clone application, a modern real estate platform with AI capabilities.

## Architecture Pattern

The application follows a **modular monolith** pattern with clear separation between frontend and backend, with plans for microservices migration.

## Technology Stack

### Frontend
- **Next.js 14** (App Router) - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Three.js** - 3D visualization
- **Framer Motion** - Animations
- **Zustand** - State management
- **React Query** - Data fetching
- **Axios** - HTTP client

### Backend
- **NestJS** - Node.js framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Socket.io** - Real-time communication
- **OpenAI API** - AI services
- **AWS S3** - File storage
- **Bull + Redis** - Job queue
- **Stripe** - Payments

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │ User Portal│  │Agent Portal│  │  Other Portals       │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Shared Components                        │    │
│  │  • AI Avatar (Three.js)                           │    │
│  │  • Property Map (Mapbox)                          │    │
│  │  • 3D Viewer                                      │    │
│  │  • Listing Cards                                  │    │
│  │  • Chat Component                                 │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTP/REST + WebSocket
                           │
┌─────────────────────────────────────────────────────────────┐
│                      Backend (NestJS)                        │
│  ┌──────────────┬──────────────┬──────────────┬──────────┐  │
│  │ Auth Module  │ Property M.  │   AI Module  │ Chat M.  │  │
│  └──────────────┴──────────────┴──────────────┴──────────┘  │
│  ┌──────────────┬──────────────┬──────────────┬──────────┐  │
│  │ Agent M.    │  User M.     │  Payment M.  │ Broker M.│  │
│  └──────────────┴──────────────┴──────────────┴──────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ├── MongoDB (Property data)
                           ├── Redis (Cache/Queue)
                           ├── AWS S3 (Media)
                           ├── OpenAI (AI services)
                           └── Stripe (Payments)
```

## Module Structure

### Frontend Modules

1. **User Portal**
   - Property search and discovery
   - AI assistant interaction
   - Saved properties
   - Schedule viewings
   - Messaging with agents

2. **Agent Portal**
   - Listings management
   - Lead tracking
   - Analytics dashboard
   - Commission tracking

3. **Broker Portal**
   - Team management
   - Portfolio overview
   - Analytics
   - Marketing tools

4. **Lawyer Portal**
   - Legal verification
   - Document management
   - Digital signatures

5. **Mortgage Portal**
   - Financing options
   - Pre-approval workflows
   - Calculator tools

### Backend Modules

#### Core Modules

1. **Auth Module**
   - User registration/login
   - JWT token generation
   - Role-based access control
   - Password hashing

2. **Property Module**
   - CRUD operations
   - Search and filtering
   - Natural language search
   - Geo-location queries

3. **AI Module**
   - Avatar chat integration
   - Property recommendations
   - Fraud detection
   - Description generation

4. **Chat Module**
   - Real-time messaging
   - Video calling
   - File sharing

5. **Payment Module**
   - Subscription management
   - Transaction processing
   - Escrow services

#### Portal-Specific Modules

- **Agent Module**: Listing management, analytics
- **Broker Module**: Team management, commissions
- **Lawyer Module**: Legal services
- **Mortgage Module**: Financing services

## Data Flow

### Property Search Flow

```
User Input → Frontend Search Component
    ↓
API Call to /properties/search
    ↓
Backend Property Service
    ↓
MongoDB Query with Filters
    ↓
Return Results
    ↓
Frontend Displays Results (Map/Grid)
```

### AI Avatar Interaction Flow

```
User Voice Input → Web Speech API
    ↓
Transcript sent to /ai/chat
    ↓
OpenAI GPT-4 API
    ↓
Process Context & Generate Response
    ↓
Return Text Response
    ↓
Text-to-Speech (Web Speech API)
    ↓
Avatar Animation + Audio Output
```

## Security Architecture

### Authentication Flow

1. User logs in with email/password
2. Backend validates credentials
3. JWT token generated with user role
4. Token stored in localStorage
5. Token sent in Authorization header for API calls
6. Backend validates token on each request

### Authorization

- Role-based access control (RBAC)
- Middleware guards for route protection
- Resource-level permissions
- API rate limiting

## Deployment Architecture

### Production Setup

**Frontend**
- Hosted on Vercel
- CDN for static assets
- Edge functions for API routes

**Backend**
- Containerized with Docker
- Deployed on AWS ECS or GCP Cloud Run
- Auto-scaling based on load
- Load balancer for traffic distribution

**Database**
- MongoDB Atlas (cloud)
- Redis Cloud for caching
- AWS S3 for media storage

### CI/CD Pipeline

```
Code Push → GitHub
    ↓
Automated Tests (Jest)
    ↓
Build Docker Images
    ↓
Deploy to Staging
    ↓
Manual Approval
    ↓
Deploy to Production
```

## Scalability Considerations

### Current (Monolith)
- Vertical scaling
- Load balancer with multiple instances

### Future (Microservices)
- API Gateway pattern
- Separate services for:
  - Property service
  - AI service
  - Chat service
  - Payment service
- Service mesh (Istio/Linkerd)
- Message queue (RabbitMQ/Kafka)

## Performance Optimization

- Image optimization (Next.js Image component)
- Code splitting
- Lazy loading for 3D models
- Redis caching for frequently accessed data
- CDN for static assets
- Database indexing
- Query optimization

## Monitoring & Logging

- Application logs (Winston)
- Error tracking (Sentry)
- Performance monitoring (New Relic/DataDog)
- Analytics (Google Analytics)
- User behavior tracking (Hotjar)

