# 🚀 Scriptless API Workflow (Backend)

A **Node.js** and **TypeScript**-based backend service to automate workflows of sequential API calls. It supports conditional execution, assertion handling, state tracking, and real-time progress updates via WebSocket



## 🔧 Prerequisites.

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [npm](https://www.npmjs.com/) 
- [Docker](https://www.docker.com/) (optional but recommended for Redis)

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
REDIS_HOST=localhost
REDIS_PORT=6379
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
| `JWT_SECRET_KEY` | Secret key for signing JWT tokens          |
| `REDIS_HOST`     | Redis Host where its running                            |
| `REDIS_PORT`     | Redis Port          |

## 📜 Available Scripts

| Command         | Description                                             |
| --------------- | ------------------------------------------------------- |
| `npm run dev`   | Runs the backend in development mode with **Nodemon**   |
| `npm run build` | Compiles TypeScript into JavaScript (output in `dist/`) |
| `npm start`     | Runs the backend in production mode                     |


## 📦 REST API Endpoints

| Method | Endpoint                          | Description                          |
|--------|-----------------------------------|--------------------------------------|
| POST   | `/api/workflow/create`            | Create a new workflow                |
| GET    | `/api/workflow/ids`               | Get all workflow IDs                 |
| GET    | `/api/workflow/:id`               | Get a specific workflow by ID        |
| PUT    | `/api/workflow/:id`               | Update a workflow by ID              |
| DELETE | `/api/workflow/:id`               | Delete a workflow by ID              |
| POST   | `/api/workflow/execute/:workflowId` | Execute a workflow by ID           |
| GET    | `/api/workflow/status/:jobId`     | Get job + node-level progress status |

## 🔌 WebSocket Integration Guide (Frontend)

This backend supports real-time updates for workflow execution using **Socket.IO**. Frontend can subscribe to a workflow job and listen for per-node execution updates.

---

### 📡 Connect to WebSocket Server

Use `socket.io-client` to connect to the server:

```ts
import { io } from "socket.io-client";

// Replace with actual backend WebSocket URL
const socket = io("http://localhost:3000");


Step 1: Subscribe to a Workflow Job
POST /api/workflow/execute/:workflowId

// You'll receive a jobId. Use it to subscribe to workflow execution updates:
socket.emit("subscribeToJob", jobId);

Step 2: Listen for Node Progress Updates
Once subscribed, listen for node updates using the workflow-progress event:

socket.on("workflow-progress", (update) => {
  console.log("Progress Update:", update);
});


Example Payload: workflow-progress
{
  "jobId": "abc123",
  "nodeId": "http_1",
  "type": "http",
  "status": "in_progress",
  "progressPercentage": 50,
  "response": {
    "data": {
      "message": "Success"
    }
  },
  "errorMessage": null
}

