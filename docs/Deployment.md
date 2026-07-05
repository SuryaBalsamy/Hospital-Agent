# Deployment Guide — HorizonCare AI Medical Center

This guide explains how to deploy HorizonCare AI Medical Center to production.

## 1. Database Deployment (MySQL Instance)
- Deploy a managed MySQL database instance (e.g. AWS RDS, DigitalOcean Managed Databases, or Railway).
- Run the schema initialization script using the SQL schema located in `docs/Database.md`.
- Set up index constraints for performance optimization on `appointments` and `users` tables.

## 2. Backend Deployment (FastAPI on Render)
Render is an excellent host for the FastAPI application:
1. Log in to Render and select **New Web Service**.
2. Connect your Git repository.
3. Configure the service settings:
   - **Environment:** `Python`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python run.py` (or `uvicorn app.main:app --host 0.0.0.0 --port 10000`)
4. Set the following environment variables in the Render settings:
   - `DB_HOST`: Database server host name
   - `DB_PORT`: Database port
   - `DB_USER`: Database user
   - `DB_PASSWORD`: Database password
   - `DB_NAME`: Database schema name (`hospital_ai_assistant`)
   - `SECRET_KEY`: Long, cryptographically secure JWT signing key
   - `ALGORITHM`: `HS256`
   - `GEMINI_API_KEY`: Google Gemini AI developer API key.

## 3. Frontend Deployment (React on Vercel)
Vercel is optimal for React static assets hosting:
1. Log in to Vercel and import your repository.
2. Select the `frontend` subfolder during import setup.
3. Set the Framework Preset to **Vite**.
4. Configure Build and Output Settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Note: Set up API rewrites/routing parameters inside `vercel.json` if proxying:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-render-url.onrender.com/api/:path*"
    }
  ]
}
```
6. Deploy the project!
