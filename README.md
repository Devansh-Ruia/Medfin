# 🏥 MedFin AI - Healthcare Financial Navigator

AI-powered insurance policy analysis and bill validation platform using Google Gemini.

## 🚀 Live Demo
- **App:** https://medfin-phi.vercel.app
- **API:** https://medfin.onrender.com

## ✨ Features

### 📄 Policy Analysis
- Upload insurance policy (PDF or image)
- AI extracts ALL policy parameters automatically
- Coverage strength scoring
- Gap identification

### 💬 AI Q&A (Estimation Tool)
- Ask questions about your coverage in natural language
- Get cost estimates for procedures
- Understand complex insurance terms
- Conversational interface

### 📸 Bill Validation
- Photo-scan medical bills
- AI validates charges against your policy
- Identifies billing errors and overcharges
- Calculates expected vs actual patient responsibility

### ✨ Policy Optimization
- AI analyzes your healthcare needs
- Recommends coverage optimizations
- Suggests alternative plan types
- Prioritized action items

## 🛠️ Tech Stack
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** FastAPI, Python 3.9+
- **AI:** Google Gemini 1.5 Flash
- **Deployment:** Vercel + Render

## 📋 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/ai/upload-policy` | POST | Upload and analyze policy |
| `/api/v1/ai/ask-question` | POST | Ask questions about policy |
| `/api/v1/ai/upload-bill` | POST | Validate bill photo |
| `/api/v1/ai/optimize-policy` | POST | Get optimization recommendations |
| `/api/v1/ai/health` | GET | Check AI service status |

## 🔐 Environment Variables

### Backend (Render)
| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google AI API key |
| `RESEND_API_KEY` | Email service (optional) |

### Frontend (Vercel)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |

## 🔒 Privacy
- No policy data is stored permanently
- All analysis happens in real-time
- HIPAA-aware design principles

## Troubleshooting

### Build Failures on Render
If you see `pydantic-core` build errors, ensure `requirements.txt` uses `>=` version specifiers instead of `==` to allow pre-built wheels.

## 📝 License
MIT License
