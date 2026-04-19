# 🌙 Dream Interpreter V2 ✨

An AI-powered celestial journal designed to translate the whispers of your subconscious. Experience a premium, mystical interface with responsive backgrounds, fluid glassmorphism animations, and deep spiritual insights.

![Dream Interpreter Social Preview](public/social-preview.png)

## 🌖 Core Features

-   **✨ AI-Driven Interpretation**: Leverages Google Gemini to decode themes, emotional tones, and deep symbolic meanings.
-   **💬 Chat with Your Dream**: Engage in a real-time dialogue with an AI celestial guide to dive deeper into specific symbols or feelings from your interpretation.
-   **📔 Celestial Journaling**: A private history of your journey with sentiment-based color-coded glows and a smooth, persistent interface.
-   **📊 Analytics Dashboard**: Visualize your emotional atmosphere over time with interactive charts powered by Recharts.
-   **🔐 Shared Visions**: Generate encrypted share links to show your interpretations to others without compromising your private journal.
-   **🌓 Device-Adaptive Experience**: Custom desktop and mobile mystical backgrounds for a seamless experience on any device.
-   **🛡️ Secure & Private**: Built on Supabase with robust Row Level Security (RLS) and automated PostgreSQL archiving.

## 🛠️ Technology Stack

-   **Frontend**: React 18, Vite, TypeScript, React Router.
-   **Styling**: Vanilla CSS (Premium Glassmorphism Design System).
-   **Backend**: Netlify Serverless Functions & Supabase.
-   **AI Engine**: Google Gemini API.

## ⚙️ Quick Setup

### 1. Requirements
-   Node.js (v18+)
-   Supabase Account
-   Netlify Account
-   Gemini API Key

### 2. Local Configuration
Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_ADMIN_EMAIL=your_admin_email@example.com
```

### 3. Database Initialization
Run the contents of [supabase-setup.sql](./supabase-setup.sql) in your Supabase SQL Editor. 
**Important**: Ensure your `dreams` table includes the `deleted_at` column for the archiving trigger to function correctly:
```sql
ALTER TABLE public.dreams ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
```

### 4. Installation
```bash
npm install
npm run dev
```

## 🚀 Deployment

This project is optimized for **Netlify**.

1.  Push your repository to GitHub.
2.  Connect the repository to Netlify.
3.  Add your Gemini API Key as a Environment Variable in the Netlify dashboard under `GEMINI_API_KEY`.

---

*Brewed with ❤️ & ☕ in BLR by Shubham.*
