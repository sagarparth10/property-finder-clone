# 🏠 Property Finder Clone - Next-Gen Real Estate Super App

A modern, scalable real estate web application that combines the best features of Property Finder and Bayut, with advanced AI capabilities, 3D visualization, and multi-portal architecture.

## 🚀 Features

### Core Modules

1. **Property Discovery Portal**
   - Advanced search with natural language processing
   - Interactive map view with Google Maps/Mapbox
   - 3D & AR property tours using Three.js + WebXR
   - Floor plan visualization
   - Price trends and neighborhood insights
   - Verified listings system with AI-based fraud detection

2. **AI Multilingual Virtual Agent**
   - 3D human-like avatar built with Three.js
   - Natural language conversation about properties
   - Voice recognition and synthesis
   - Multi-language support (EN, AR, FR, HI, etc.)

3. **Multi-Portal Architecture**
   - User Portal (Buyers/Renters)
   - Agent Portal (manage listings, leads, analytics)
   - Broker Portal (team management, commissions)
   - Lawyer Portal (legal verification, documents)
   - Mortgage Advisor Portal (financing options)
   - Surveyor Portal (inspection reports, valuations)

4. **Advanced Features**
   - Blockchain-verified properties (optional)
   - AI image recognition for duplicate/fake detection
   - Real-time availability index
   - Personalized recommendations
   - Virtual staging with AI-generated interiors
   - Community reviews for agents and properties

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **3D/AR**: Three.js, React-Three-Fiber
- **Animation**: Framer Motion
- **State Management**: Zustand + Jotai
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Maps**: Mapbox/Google Maps API
- **i18n**: react-i18next
- **WebRTC**: Socket.io for chat/video

### Backend
- **Framework**: NestJS 10
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with Passport
- **API**: REST + GraphQL (optional)
- **File Upload**: AWS S3 + Multer
- **AI Integration**: Ollama (local LLaMA runtime, optional OpenAI fallback)
- **Queue**: Bull + Redis
- **Chat**: Socket.io
- **Payments**: Stripe

## 📁 Project Structure

```
Property_Finder_Clone/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # Next.js 14 app router
│   │   ├── components/      # React components
│   │   │   ├── Avatar/     # AI Avatar component
│   │   │   ├── Map/        # Property map
│   │   │   ├── 3DViewer/   # 3D property viewer
│   │   │   ├── ListingCard/
│   │   │   └── Chatbot/
│   │   ├── portals/        # Multi-portal architecture
│   │   │   ├── UserPortal/
│   │   │   ├── AgentPortal/
│   │   │   ├── BrokerPortal/
│   │   │   ├── LawyerPortal/
│   │   │   └── MortgagePortal/
│   │   └── utils/          # Utilities & API clients
│   └── public/
│       ├── models/         # 3D models
│       └── images/
├── backend/                  # NestJS backend
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/
│   │   │   ├── user/
│   │   │   ├── agent/
│   │   │   ├── property/
│   │   │   ├── ai/
│   │   │   ├── chat/
│   │   │   └── payment/
│   │   ├── common/         # Shared modules
│   │   └── config/
│   └── test/
├── shared/                   # Shared types & utilities
└── docs/                    # Documentation
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 6+
- Redis (for queues)
- Ollama (local LLM runtime) with the model defined in `OLLAMA_MODEL` (default `llama3`)
- Mapbox/Google Maps API Key (optional but recommended)
- OpenAI API Key (optional if you plan to use the cloud provider)

### Installation

1. **Clone the repository**
```