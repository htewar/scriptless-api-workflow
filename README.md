# 🚀 Scriptless API Workflow (Backend)

A **Node.js** and **TypeScript**-based backend service for API workflow automation.



## 🔧 Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [npm](https://www.npmjs.com/) 

## 🚀 Setup & Installation

### 1️⃣ Clone the Repository

```sh
git clone https://github.com/your-repo/scriptless-api-workflow.git
cd scriptless-api-workflow
```

### 2️⃣ Install Dependencies

```sh
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file in the project root and add:

```env
JWT_SECRET_KEY=your-secret-key-here
```

### 4️⃣ Run in Development Mode

```sh
npm run dev
```

Runs the project using **Nodemon** (`src/server.ts`).

### 5️⃣ Build for Production

```sh
npm run build
```

Compiles TypeScript into JavaScript inside the `dist/` folder.

### 6️⃣ Run in Production Mode

```sh
npm start
```

Starts the compiled backend (`dist/server.js`).

## 🔑 Environment Variables

| Variable         | Description                                |
| ---------------- | ------------------------------------------ |
| `JWT_SECRET_KEY` | Secret key for signing JWT tokens          | |

## 📜 Available Scripts

| Command         | Description                                             |
| --------------- | ------------------------------------------------------- |
| `npm run dev`   | Runs the backend in development mode with **Nodemon**   |
| `npm run build` | Compiles TypeScript into JavaScript (output in `dist/`) |
| `npm start`     | Runs the backend in production mode                     |




