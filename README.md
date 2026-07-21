# My Blog — MVP

A simple full-stack blog: React (JavaScript) frontend, Node.js/Express backend, MongoDB database.

## What it does
- Anyone can browse posts, filter by tag, and comment (just typing a name — no login/signup).
- Only the admin (single hardcoded account, password hashed with bcrypt) can create or delete posts.
- Likes are stored on the post document in MongoDB.
- Comments support a simple "reply to" tag so threads feel conversational, without building a full nested-tree UI.

Note on the spec: your notes mentioned both "no auth needed" and "role based access control / account creation for posting." I went with the simpler, more common version of what you described: one admin login (password + JWT) for publishing, and open commenting with just a username. If you actually want visitors to create accounts too, that's a bigger feature — let me know and I'll add it.

## Project structure
```
blog-app/
  backend/     Express API + MongoDB models
  frontend/    React app (Vite)
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — your MongoDB connection string (use [MongoDB Atlas](https://www.mongodb.com/atlas) free tier for hosting)
- `JWT_SECRET` — any long random string

Start the server:
```bash
npm run dev
```
API runs on `http://localhost:5000`.

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

`.env` should point at your backend:
```
VITE_API_URL=http://localhost:5000/api
```

Start it:
```bash
npm run dev
```
Opens on `http://localhost:5173`.

## 3. Using it
1. Go to `/admin/login`, sign in with the admin credentials from `.env`.
2. Click "NEW POST" to publish. Add comma-separated tags like `technical, life`.
3. Anyone visiting the site can browse, filter by tag, like a post, and leave comments under any post (just typing a display name each time).

## 4. Deploying

**Backend**: Vercel's serverless model doesn't run a long-lived Express server well out of the box. The easiest path is to deploy `backend/` as-is to [Render](https://render.com) or [Railway](https://railway.app) (both have simple free/cheap tiers for a Node app), then point the frontend's `VITE_API_URL` at that URL. If you specifically want everything on Vercel, the backend routes would need to be restructured as Vercel serverless functions — happy to do that conversion if you want to go that route.

**Frontend**: Deploy `frontend/` to Vercel as a Vite/React app (Vercel detects this automatically). Set `VITE_API_URL` in the Vercel project's environment variables to your deployed backend URL.

**Database**: Use MongoDB Atlas's free tier and put the connection string in the backend's `MONGO_URI`.

## Notes / simplifications made for the MVP
- Comment threading is flat with a "replying to X" label rather than deeply nested replies — keeps the UI and data model simple.
- Like de-duplication is done client-side via `localStorage`, not server-enforced per-user (there's no user accounts to check against). Fine for an MVP, not abuse-proof.
- No image uploads — posts are plain text/markdown-style content. Say the word if you want image support (would need a storage service like Cloudinary or S3).
