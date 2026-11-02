# MEDNEXUS – Step-by-Step GitHub Deployment Guide

This guide explains how to deploy and run **MEDNEXUS** directly on **GitHub** so it can be accessed from any device or system in the world.

---

## 📌 Important Context on GitHub's Two Deployment Models

Because **MEDNEXUS** is a full-stack DBMS application containing a **database (PostgreSQL/SQLite)**, **authentication (NextAuth with bcrypt)**, and **backend API Route Handlers**, GitHub provides two ways to host it:

| Feature | Method 1: GitHub Codespaces (Recommended) | Method 2: GitHub Pages |
| :--- | :--- | :--- |
| **Where it runs** | 100% on GitHub Cloud Virtual Machines | 100% on GitHub Static CDN |
| **Backend & Database** | ✅ Full Node.js + Prisma + DB + Auth | ❌ Static HTML only (no DB/APIs) |
| **Public Web URL** | ✅ Yes (`https://<id>-3000.app.github.dev`) | ✅ Yes (`https://<user>.github.io`) |
| **Cost** | Free (60 hours/month included for every GitHub account) | Free |
| **Best For** | Full-Stack BTech DBMS Evaluation & Live Testing | Static documentation sites |

---

## 🚀 STEP 1: Push MEDNEXUS to Your GitHub Account

1. Open your browser and go to: **[https://github.com/new](https://github.com/new)**
2. In **Repository name**, type: `mednexus`
3. Select **Public**
4. Leave **"Add a README file"**, **".gitignore"**, and **"license"** **UNCHECKED** (our local repo already contains them).
5. Click **"Create repository"**.
6. Copy your repository HTTPS URL (e.g. `https://github.com/YOUR_USERNAME/mednexus.git`).

### Push using the automated script:
Double click: `C:\Users\Arush\.gemini\antigravity\scratch\mednexus\push-to-github.bat`  
Paste your URL and hit **Enter**.

### OR Push manually in PowerShell:
```powershell
cd C:\Users\Arush\.gemini\antigravity\scratch\mednexus

$git = "C:\Users\Arush\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe"

& $git remote add origin https://github.com/YOUR_USERNAME/mednexus.git
& $git branch -M main
& $git push -u origin main
```

---

## 🌐 STEP 2 (Recommended): Deploy & Run Live 100% on GitHub (Codespaces)

With the included `.devcontainer/devcontainer.json`, GitHub will automatically provision a cloud environment, sync the database, start the server, and give you a public HTTPS URL:

1. Open your repository on GitHub: `https://github.com/YOUR_USERNAME/mednexus`
2. Click the green **`<> Code`** button.
3. Select the **`Codespaces`** tab.
4. Click **`Create codespace on main`**.
5. GitHub will open a web-based workstation in your browser. It will automatically:
   - Install dependencies (`pnpm install`)
   - Synchronize the 3NF database schema (`pnpm prisma db push`)
   - Seed the 22 patients and 8 doctors (`node prisma/seed.js`)
   - Launch the production server on port 3000 (`pnpm start`)
6. In the bottom panel, click the **`Ports`** tab:
   - Look for Port `3000`.
   - Right-click the **Visibility** column and change it from **Private** to **Public**.
   - Copy the **Forwarded Address** (it looks like: `https://xxxx-3000.app.github.dev`).
7. **You're live!** You can open that URL in any computer, smartphone, or tablet anywhere in the world to present and test the application!

---

## 📄 STEP 3 (Alternative): GitHub Pages Static Deployment

If your instructor or project rubric specifically mandates **GitHub Pages** (`username.github.io/mednexus`):

1. On GitHub, go to your repository **Settings** tab.
2. In the left sidebar, click **Pages**.
3. Under **Build and deployment** > **Source**, choose **GitHub Actions**.
4. GitHub Pages will execute the workflow and host the pre-rendered pages directly under:
   `https://YOUR_USERNAME.github.io/mednexus/`

*(Note: In static GitHub Pages mode, browser-based mock mode is utilized since GitHub Pages does not run background Node.js server daemons or relational database sockets).*
