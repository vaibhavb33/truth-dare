# Environment Setup & Infrastructure Guide

**Project Name:** Project Asteria  
**Document:** Environment Variables & Local Setup Runbook  
**Role:** Senior Full-Stack Architect & Lead Developer  
**Date:** November 5, 2026  
**Status:** Approved & Implemented

---

## 1. Environment Variable Catalog

Create a `.env.local` file in the project root:

```ini
# Application Base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Supabase Public API (For Client Realtime & RLS)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Supabase Service Role (Server-Side Only - NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# PostgreSQL Connection String (Optional Direct Pool)
DATABASE_URL="postgresql://postgres:password@localhost:5432/asteria_db"

# Admin Authentication Secret
ADMIN_JWT_SECRET="super-secure-production-jwt-secret-min-32-chars"
ADMIN_DEFAULT_PASSWORD="AsteriaAdmin2026!Secure"
```

---

## 2. Quick-Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Run automated test suites
npm run test

# 4. Create production build
npm run build

# 5. Start production runtime
npm run start
```

