# Besu Ops Fullstack App

This project is a fullstack TypeScript monorepo for Besu node operations, featuring:
- React frontend (Vite, TypeScript)
- Express backend (TypeScript, serves API and UI)
- Single Docker image for production

## Local Development

### Frontend (React)
```
npm run dev
```
Runs the React app with Vite on port 5173 (default).

### Backend (Express, dev mode)
```
npm run dev:server
```
Runs the Express backend (TypeScript, not compiled) on port 3000.

### Full Production Build
```
npm run build:all
```
- Builds the backend to `dist-server/`
- Builds the frontend to `dist/`

### Start Production Server
```
npm run start:server
```
Serves both API and UI from a single process on port 3000.

## Docker

Build and run the fullstack app in a single container:
```
docker build -t besu-ops .
docker run -p 3000:3000 besu-ops
```

## Kubernetes

You can deploy the built Docker image to your Kubernetes cluster. Example deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: besu-ops
spec:
  replicas: 1
  selector:
    matchLabels:
      app: besu-ops
  template:
    metadata:
      labels:
        app: besu-ops
    spec:
      containers:
        - name: besu-ops
          image: <your-docker-repo>/besu-ops:latest
          ports:
            - containerPort: 3000
```

## Project Structure

- `src/` - React frontend
- `server/` - Express backend (TypeScript)
- `dist/` - React build output
- `dist-server/` - Backend build output
- `besu-scripts/` - Custom scripts (e.g., backup.sh)

---
For questions or improvements, open an issue or PR!
