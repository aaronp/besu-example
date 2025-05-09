dev:
	npm run dev

deploy:
	./deployLocal.sh

createCluster:
	kind create cluster --name local-cluster --config kind-config.yaml

deleteCluster:
	kind delete cluster --name local-cluster

listClusters:
	kind get clusters

listImages:
	docker exec -it local-cluster-control-plane crictl images

	