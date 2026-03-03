# Chiya and Puff 🥟☕

A modern restaurant management system designed for traditional Nepalese cuisine. Built with Next.js, Prisma, and SQLite, this project provides a seamless experience for both administrators and waitstaff.

## 🚀 Quick Start

To run this project on your local machine (macOS or Windows), follow these steps:

### 1. Prerequisites
- Ensure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).
- [Git](https://git-scm.com/) for version control.

### 2. Setup
Open your terminal (Terminal on macOS, CMD or PowerShell on Windows) and run:

```bash
# Clone the repository (if you haven't already)
# git clone <repository-url>
# cd "Chiya and Puff"

# Run the automated setup
npm run setup
```

The `setup` command will:
- Install all necessary dependencies.
- Generate the Prisma client.
- Initialize the SQLite database and seed it with the default Nepalese menu and accounts.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 💻 Cross-Platform Support

This project is optimized to run identically on **macOS** and **Windows**.

- **Database**: Uses SQLite (`dev.db`), which is file-based and requires no separate database installation.
- **Environment**: Rename `.env.example` to `.env` if you need to customize settings, though it comes pre-configured for local development.

---

## 📤 Uploading to GitHub

If you want to host this project on your GitHub:

1. Create a new repository on [GitHub](https://github.com/new).
2. Copy the remote URL (e.g., `https://github.com/your-username/chiya-and-puff.git`).
3. Run the following commands:

```bash
git remote add origin <your-repository-url>
git branch -M main
git push -u origin main
```

---

## 🛠 Tech Stack
- **Framework**: Next.js
- **Database**: Prisma with SQLite
- **Authentication**: Bcryptjs & JWT (Jose)
- **Styling**: Vanilla CSS / React Components
- **Icons**: Lucide React

## 👥 Default Accounts
After running `npm run setup`, you can log in with:
- **Admin**: `admin` / `admin123`
- **Waiter**: `waiter1` / `waiter123`

