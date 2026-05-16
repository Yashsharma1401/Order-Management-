This guide provides comprehensive, step-by-step instructions to set up and run the project on your local machine.

---

## ✨ Features
* **Real-time Order Tracking:** Instantly receive new orders and status updates via Socket.IO without refreshing the page.
* **Multi-Store Management:** Dashboard to monitor performance, sales, and analytics across different branch locations.
* **Modern Frontend UI:** Built with React, Vite, and Tailwind CSS for a fast, responsive, and beautiful user experience.
* **Type-Safe Database:** Powered by PostgreSQL and Prisma ORM for reliable and structured data management.
* **Analytics Dashboard:** Visualize sales trends and order volumes using interactive Recharts graphs.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
1. **Node.js** (v18.0.0 or higher recommended) - [Download Here](https://nodejs.org/)
2. **Git** - [Download Here](https://git-scm.com/)
3. **PostgreSQL** Database (You can use a local installation or a cloud provider like Supabase, Render, or Prisma Data Platform).

---

## ⚙️ Installation & Setup

Because this is a full-stack project, you will need to set up the **Backend** and **Frontend** separately. We recommend opening two separate terminal windows.

### Part 1: Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   * Create a new file named `.env` in the `backend` folder.
   * Copy the contents of `.env.example` into your new `.env` file (or paste the following):
     ```env
     # The connection string to your PostgreSQL database
     DATABASE_URL="postgres://username:password@localhost:5432/tmbilldb"
     
     # The port the server will run on
     PORT=5000
     
     # The URL of your frontend (used for CORS security)
     CLIENT_URL="http://localhost:5173"
     ```
   * *Note: Replace the `DATABASE_URL` with your actual Postgres connection string.*

4. **Set up the Database (Prisma):**
   * Generate the Prisma client:
     ```bash
     npx prisma generate
     ```
   * Push the schema to your database (this creates the necessary tables):
     ```bash
     npx prisma db push
     ```

5. **Start the Backend Server:**
   ```bash
   npm run dev
   ```
   *If successful, you will see a message saying: `🚀 Server running on http://localhost:5000` and `🔌 Socket.IO ready`.*

---

### Part 2: Frontend Setup

1. **Open a new terminal window and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   * Create a new file named `.env` in the `frontend` folder.
   * Add the following configuration (these tell the frontend where to find the backend):
     ```env
     VITE_API_URL=http://localhost:5000
     VITE_SOCKET_URL=http://localhost:5000
     ```

4. **Start the Frontend Development Server:**
   ```bash
   npm run dev
   ```
   *If successful, the terminal will provide a local link (usually `http://localhost:5173`). Ctrl+Click the link to open the app in your browser.*

---

## 💻 Available Scripts

Here are the most useful commands you can run in your terminal:

### In the `backend` folder:
* `npm run dev`: Starts the backend server with Nodemon (auto-restarts on file changes).
* `npm start`: Starts the backend server in production mode.
* `npx prisma studio`: Opens a beautiful web interface to view, edit, and delete records directly inside your database.

### In the `frontend` folder:
* `npm run dev`: Starts the Vite development server.
* `npm run build`: Bundles the React application for production deployment (creates a `/dist` folder).
* `npm run preview`: Previews the production build locally.

---

## 🌍 Deployment Notes

If you are deploying this project to the internet (e.g., Render, Vercel), remember these crucial steps:

1. **Database:** Ensure your hosted backend is connected to a hosted PostgreSQL database.
2. **Environment Variables:**
   * On Vercel (Frontend), set `VITE_API_URL` and `VITE_SOCKET_URL` to your live backend URL (e.g., `https://my-backend.onrender.com`).
   * On Render (Backend), set `CLIENT_URL` to your live frontend URL (e.g., `https://my-frontend.vercel.app`). **Important:** Ensure there is no trailing slash (`/`) at the end of the `CLIENT_URL` to prevent CORS errors.
3. **Build Commands:**
   * Backend Build Command: `npm install && npx prisma generate`
   * Frontend Build Command: `npm run build`

---
