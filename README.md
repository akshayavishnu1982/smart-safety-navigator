# Smart Safety Navigator

A beginner-friendly full-stack college project for sharing public-area safety observations and preparing for journeys.

## Problem statement
People may benefit from planning journeys, checking personal-preparation steps, and sharing factual observations about public spaces. This MVP provides a journey-preparation checklist, general journey tips, a rule-based safety helper, and community reports stored in Supabase PostgreSQL.

## Features
- Responsive dashboard with a colourful UI.
- Journey planner with general preparation tips.
- Interactive personal safety checklist.
- Community reports stored persistently in Supabase.
- Rule-based AI Safety Mode demo (not a connected AI model).
- Express REST API, input validation, security headers, and rate limiting.

## Technology stack
HTML5, CSS3, Vanilla JavaScript, Node.js, Express, Supabase PostgreSQL, Git and GitHub.

## Folder structure
```text
smart-safety-navigator/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── backend/
│   ├── server.js
│   ├── supabase.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── database/schema.sql
├── .gitignore
└── README.md
```

## Prerequisites
Install:
- Node.js LTS: https://nodejs.org/
- Visual Studio Code: https://code.visualstudio.com/
- Git: https://git-scm.com/

Open a terminal and verify:
```bash
node --version
npm --version
git --version
```

## Supabase setup
1. Create a project at https://supabase.com/.
2. Open **SQL Editor** in your Supabase dashboard.
3. Open `database/schema.sql` in VS Code, copy the complete SQL, paste it into the SQL Editor, and run it.
4. In Supabase project settings, find the project URL and server-side secret/service-role key for your project's API settings. Supabase dashboard labels may vary.
5. Keep the privileged key secret. Never put it in HTML, CSS, frontend JavaScript, screenshots, public documents, or GitHub.

## Environment configuration
In `backend/`, copy `.env.example` to a new file named `.env`. Replace the placeholders with your own project URL and server-side key:
```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_real_server_only_key
```
These are placeholders, not working credentials. Do not commit `.env`.

## Install and run on Windows
In VS Code, open the root folder `smart-safety-navigator`. Open **Terminal > New Terminal**, then run:
```powershell
cd backend
npm install
npm run check
npm start
```
When the server starts, open http://localhost:3000 in your browser. Keep the terminal running while using the site. For code changes, restart the server; or use `npm run dev` during development.

The dashboard and journey planner can run without Supabase configured. Community reports require valid Supabase credentials and the SQL schema.

## API endpoints
| Method | Path | Purpose | Database required |
|---|---|---|---|
| GET | `/api/health` | Server and configuration status | No |
| POST | `/api/journey-plan` | Return general journey-preparation tips | No |
| GET | `/api/reports` | List up to 50 published reports | Yes |
| POST | `/api/reports` | Validate and create a report | Yes |

`POST /api/journey-plan` body:
```json
{"from":"College main gate","to":"Central bus station","preference":"daylight"}
```
Allowed preferences: `daylight`, `public`, `familiar`.

`POST /api/reports` body:
```json
{"area":"Library road crossing","category":"Lighting","description":"Street lighting appeared unavailable near the crossing."}
```
Categories: `Lighting`, `Road hazard`, `Crowding`, `Helpful resource`, `Other`.

## Test checklist
1. Open the dashboard at `http://localhost:3000`.
2. Tick safety checklist items; progress should update.
3. Submit a journey plan; general tips should appear.
4. With Supabase configured and schema created, submit a community report and confirm it appears in the list.
5. Refresh the page; saved reports should still appear.
6. Try submitting empty form fields; browser validation should stop the submission.
7. Open `http://localhost:3000/api/health`; a JSON health response should appear.
8. Resize the browser to check mobile layout.

## Important limitations and safety
- The journey planner does not connect to live maps, GPS, traffic, crime statistics, or verified safe-route data.
- The AI Safety Mode is a rule-based demonstration, not a generative AI model and not an emergency service.
- Public reports are not moderated in this starter version. Do not post private or identifying information. Before a public deployment, implement authentication, moderation, abuse reporting, stronger access policies, and an appropriate threat model.
- The backend uses a privileged Supabase key. It is server-side only and must remain secret. This simple starter is for local learning and should not be deployed publicly as-is.
- India emergency number shown in the interface: 112. In immediate danger, contact local emergency services; do not rely on the website.

## Troubleshooting
- **Port in use:** change `PORT=3000` to another port such as `3001` in `.env`, restart, and open the corresponding localhost URL.
- **Database not configured:** check the exact names and values in `backend/.env`, then restart the server.
- **Relation not found:** run `database/schema.sql` in the Supabase SQL Editor.
- **Invalid API key:** use the correct key for the same Supabase project and keep it server-side.
- **npm not recognised:** install Node.js LTS and reopen VS Code.
- **Reports fail:** inspect the VS Code terminal for the server-side error message without sharing credentials.

## GitHub upload
From the root folder:
```bash
git init
git status
git add .
git status
git commit -m "Build Smart Safety Navigator"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```
Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual GitHub repository URL. Confirm that `.env` and `node_modules/` are not staged. `.env.example` should be committed. If a secret was ever committed, rotate it immediately; `.gitignore` alone does not erase Git history.

## Future improvements
Add Supabase Auth, moderation and report verification, map integration with an appropriate data provider, and a real AI model through a secure server-side integration if permitted by project requirements. The current MVP intentionally avoids external AI APIs and paid integrations.
