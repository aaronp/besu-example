# Ops App

## Development

```
npm install
npm run dev
```

## Production

```
npm install
npm start
```

## Docker

```
docker build -t ops-app .
docker run -p 3000:3000 -v /Users/aaron/dev/sandbox/besu-example/besu-scripts:/mnt/scripts ops-app
```

## Kubernetes

Apply the deployment:

```
kubectl apply -f deployment.yaml
``` 