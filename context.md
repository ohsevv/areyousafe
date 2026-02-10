# areyousafe - Serverless Security Reconnaissance Tool

## Mission
Build "areyousafe," a serverless security scanner designed to provide instant feedback on a website's public-facing security posture.

## Project Structure
- **frontend/**: React + Vite + Tailwind CSS (hosted on Firebase).
- **engine/**: Python Flask API (hosted on GCP Cloud Run).
- **.ai_context/**: Context, diagrams, and logs.

## Technical Requirements

### Backend (Python)
- **Library**: `requests` for header analysis.
- **Library**: `socket` for basic port scanning.
- **Endpoint**: `/scan` POST endpoint returning JSON.
- **Logic**:
    - **Header Analysis**: Check for CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.
    - **Port Discovery**: Check common ports (80, 443, 22, 8080).
    - **SSL/TLS Health**: Verify certificate validity and encryption strength.

### Frontend (React)
- **Style**: Minimalist dashboard.
- **Components**:
    - Large search bar for URL.
    - "Results Card" with color-coded badges (Green="Secure", Red="Missing").
- **Integration**: Fetch data from the Python backend.

### Database
- **Firebase Firestore**: Log scan history.

## Infrastructure & Deployment
- **Engine**: Dockerfile optimized for Google Cloud Run.
- **Frontend**: `firebase.json` for Firebase Hosting.
- **Scripts**: `google-cloud-deploy.sh` for automation.

## Agent Execution Rules
1. **Security First**: No insecure "quick fixes" (e.g., avoid `CORS: *` if possible, use proper configs).
2. **Atomic Changes**: Modify one thing at a time.
3. **Structured Data**: JSON communication between frontend and backend.
4. **Zero-Trust**: Validate and sanitize all user inputs.
5. **DevSecOps**: Check git status and recommend commit messages.

## Roadmap
- [x] Repo initialized
- [ ] Frontend Scaffolding (React + Tailwind)
- [ ] Backend Scaffolding (Python + Flask)
- [ ] Dockerization & Cloud Run Deployment
- [ ] Firestore Integration
