# 🎙️ AI Interviewer - Voice Interview Practice Platform

An intelligent interview practice platform powered by AI, featuring real-time voice conversations with VAPI and automated feedback generation using Google Gemini AI.

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Routing:** React Router v6
- **Voice:** VAPI Web SDK
- **Database:** Firebase Client SDK (Auth + Firestore)

### Backend (Node.js)
- **Runtime:** Node.js with Express
- **AI Models:** Google Gemini 2.0 Flash (via Vercel AI SDK)
- **Database:** Firebase Admin SDK (Firestore)
- **Validation:** Zod schemas

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **Firebase Account** ([Sign up](https://firebase.google.com/))
- **VAPI Account** ([Sign up](https://vapi.ai/))
- **Google AI Studio API Key** ([Get key](https://makersuite.google.com/app/apikey))

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ai-interviewer
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd Backend
npm install
```

#### Configure Environment Variables
Copy the example file and fill in your values:
```bash
cp .env.example .env
```

Edit `Backend/.env`:
```env
# Google Gemini AI API Key
# Get from: https://makersuite.google.com/app/apikey
GOOGLE_GENERATIVE_AI_API_KEY=your_actual_key_here

# Firebase Admin SDK Credentials
# Get from Firebase Console → Project Settings → Service Accounts → Generate new private key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**How to get Firebase Admin credentials:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → Settings → Service Accounts
3. Click "Generate new private key"
4. Download the JSON file
5. Open it and copy these values to your `.env`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

**Note:** Keep the quotes and `\n` characters in `FIREBASE_PRIVATE_KEY`. The backend will automatically convert `\\n` to actual newlines.

#### Start Backend Server
```bash
npm start
# Server runs on http://localhost:8085
```

### 3. Frontend Setup

#### Install Dependencies
```bash
cd Frontend
npm install
```

#### Configure Environment Variables
Copy the example file and fill in your values:
```bash
cp .env.example .env
```

Edit `Frontend/.env`:
```env
# VAPI Public Key
# Get from: https://dashboard.vapi.ai → API Keys
VITE_VAPI_PUBLIC_KEY=pk_your_public_key_here

# Firebase Client Configuration
# Get from: Firebase Console → Project Settings → General → Your apps
VITE_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXX
VITE_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
VITE_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
VITE_MEASUREMENT_ID=G-XXXXXXXXXX
```


#### Start Development Server
```bash
npm run dev
# App runs on http://localhost:8080
```

### 4. Firebase Database Setup

#### Enable Firestore
1. Go to Firebase Console → Firestore Database
2. Click "Create database"
3. Choose location and start in **production mode**

#### Set Security Rules
Go to Firestore → Rules and add:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Interviews collection
    match /interviews/{interviewId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                       resource.data.userId == request.auth.uid;
    }
    
    // Feedback collection
    match /feedback/{feedbackId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow write: if false; // Only backend can write
    }
  }
}
```

## 📁 Project Structure

```
ai-interviewer/
├── Backend/
│   ├── server.js                    # Main Express server
│   ├── firebaseConfig.js           # Firebase Admin (uses env vars)
│   ├── constants.js                # Zod schemas & configs
│   ├── .env.example                # Environment template
│   ├── .env                        # Your credentials (git-ignored)
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Index.tsx           # Home page with interview list
│   │   │   ├── InterviewCall.tsx   # Voice interview page
│   │   │   └── FeedbackPage.tsx    # Feedback display page
│   │   ├── components/
│   │   │   ├── FeedbackView.tsx    # Feedback component
│   │   │   ├── InterviewList.tsx   # Interview history list
│   │   │   └── InterviewSetupDialog.tsx  # Interview creation form
│   │   ├── firebase/
│   │   │   └── config.ts           # Firebase client config
│   │   ├── lib/
│   │   │   ├── api.ts              # Backend API calls
│   │   │   └── actions/
│   │   │       ├── auth.action.ts  # Authentication helpers
│   │   │       └── general.action.ts  # Firestore queries
│   │   ├── constants/
│   │   │   └── index.ts            # VAPI interviewer config
│   │   └── App.tsx                 # Routes & app setup
│   ├── .env.example                # Environment template
│   ├── .env                        # Your credentials (git-ignored)
│   └── package.json
│
└── README.md
```

## 🔧 API Endpoints

### Backend API

#### Generate Interview Questions
```http
POST /api/vapi/generate
Content-Type: application/json

{
  "type": "general",
  "role": "Software Engineer",
  "level": "senior",
  "techstack": "React, Node.js",
  "amount": 8,
  "userid": "user123"
}
```

#### Create Feedback
```http
POST /api/feedback/create
Content-Type: application/json

{
  "interviewId": "interview_id",
  "userId": "user123",
  "messages": [
    { "role": "user", "content": "Hello..." },
    { "role": "assistant", "content": "Hi..." }
  ]
}
```

#### Get Feedback
```http
GET /api/feedback/:interviewId?userId=user123
```

#### Get Interview
```http
GET /api/interviews/:id
```

#### Health Check
```http
GET /health
```

## 🎯 How It Works

### Interview Flow

1. **User Creates Interview**
   - Fills form with role, question count, and type
   - Backend generates questions using Gemini AI
   - Interview saved to Firestore

2. **Voice Interview Session**
   - Frontend starts VAPI call with generated questions
   - AI interviewer asks questions in real-time
   - User responds via microphone
   - Transcript collected in frontend

3. **Feedback Generation**
   - Call ends → Frontend sends transcript to backend
   - Backend uses Gemini AI to analyze performance
   - Generates scores, strengths, and improvement areas
   - Saves feedback to Firestore

4. **View Results**
   - User sees detailed feedback with scores
   - Can review past interviews from history

### Data Flow

```
┌─────────────┐     Questions      ┌─────────────┐
│   Frontend  │ ─────────────────> │   Backend   │
│   (React)   │                    │  (Node.js)  │
└─────────────┘                    └─────────────┘
       │                                   │
       │ VAPI Voice Call                   │ Gemini AI
       │                                   │
       v                                   v
┌─────────────┐    Transcript      ┌─────────────┐
│    VAPI     │                    │  Firebase   │
│    SDK      │                    │  Firestore  │
└─────────────┘                    └─────────────┘
       │                                   │
       └──────────> Messages ──────────────┘
                   (feedback)
```

## 🔐 Security Best Practices

### ✅ DO:
- Keep `firebase-admin-key.json` secret
- Use Firebase security rules
- Store API keys in `.env` files
- Add `.env` and `firebase-admin-key.json` to `.gitignore`

### ❌ DON'T:
- Commit API keys to Git
- Expose backend Admin SDK keys in frontend
- Allow public write access to Firestore

### .gitignore
```gitignore
# Environment variables (contains secrets)
.env
.env.local
.env.*.local

# Dependencies
node_modules/

# Build outputs
dist/
build/
.next/

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

See [Docker Setup Guide](./DOCKER.md) for detailed instructions.

## 🛠️ Development

### Backend Development
```bash
cd Backend
npm run dev  # With nodemon for auto-reload
```

### Frontend Development
```bash
cd Frontend
npm run dev  # Vite dev server with hot reload
```

### Build for Production

#### Backend
```bash
cd Backend
npm install --production
```

#### Frontend
```bash
cd Frontend
npm run build  # Creates optimized build in dist/
```

## 🐛 Troubleshooting

### Backend Issues

**Server won't start:**
```bash
# Check if port is in use
lsof -i :8085  # Mac/Linux
netstat -ano | findstr :8085  # Windows

# Verify environment variables
node -e "require('dotenv').config(); console.log(process.env)"
```

**Firebase connection error:**
- Verify `firebase-admin-key.json` exists
- Check Firebase project ID matches
- Ensure service account has correct permissions

### Frontend Issues

**VAPI calls fail:**
- Check `VITE_VAPI_PUBLIC_KEY` in `.env`
- Verify public key is correct in VAPI dashboard
- Check browser console for errors

**Can't fetch interviews:**
- Verify backend is running
- Check `VITE_BACKEND_URL` points to correct address
- Ensure Firestore security rules allow read access

## 📊 Tech Stack Details

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Frontend Framework** | React 18 + TypeScript | UI components & logic |
| **Build Tool** | Vite | Fast development & bundling |
| **Styling** | Tailwind CSS | Utility-first styling |
| **UI Components** | shadcn/ui | Pre-built accessible components |
| **Routing** | React Router v6 | Client-side navigation |
| **Voice AI** | VAPI Web SDK | Real-time voice interviews |
| **Backend** | Express.js | REST API server |
| **AI Models** | Google Gemini 2.0 | Question & feedback generation |
| **Database** | Firebase Firestore | NoSQL document database |
| **Authentication** | Firebase Auth | User authentication |
| **Validation** | Zod | Schema validation |

## 📝 Environment Variables Reference

### Backend `.env.example`
```env
# Google Gemini AI API Key
# Get from: https://makersuite.google.com/app/apikey
GOOGLE_GENERATIVE_AI_API_KEY=

# Firebase Admin SDK Credentials
# Get from Firebase service account JSON (download from Firebase Console)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**How to get Firebase Admin credentials:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → Settings → Service Accounts
3. Click "Generate new private key" → Download JSON
4. Open the JSON file and copy values to `.env`:
   ```json
   {
     "project_id": "your-project",        // → FIREBASE_PROJECT_ID
     "client_email": "firebase-admin...", // → FIREBASE_CLIENT_EMAIL  
     "private_key": "-----BEGIN..."       // → FIREBASE_PRIVATE_KEY (keep \n)
   }
   ```

**Note:** Your `firebaseConfig.js` uses these environment variables and automatically converts `\\n` to real newlines - no JSON file needed!

### Frontend `.env.example`
```env
# VAPI Public Key
# Get from: https://dashboard.vapi.ai → API Keys
VITE_VAPI_PUBLIC_KEY=

# Firebase Client Configuration
# Get from: Firebase Console → Project Settings → General → Your apps
VITE_PUBLIC_FIREBASE_API_KEY=
VITE_PUBLIC_FIREBASE_AUTH_DOMAIN=
VITE_PUBLIC_FIREBASE_PROJECT_ID=
VITE_PUBLIC_FIREBASE_STORAGE_BUCKET=
VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
VITE_PUBLIC_FIREBASE_APP_ID=
VITE_MEASUREMENT_ID=
```

**How to get Firebase Client config:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → Settings → General
3. Scroll to "Your apps" section
4. Click on your web app (or create one)
5. Copy the `firebaseConfig` object values


