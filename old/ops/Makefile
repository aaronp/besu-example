dev:
	npm run dev
run:
	docker run -it --rm -p 3000:3000 -v $(PWD)/scripts:/mnt/scripts kindservices/ops-app:latest
deploy:
	./scripts/deployLocal.sh

publish:
	./scripts/publish.sh

createCluster:
	kind create cluster --name local-cluster --config kind-config.yaml

deleteCluster:
	kind delete cluster --name local-cluster

listClusters:
	kind get clusters

listImages:
	docker exec -it local-cluster-control-plane crictl images

	