.PHONY: dev build publish deploy
dev:
	DATA_DIR=./d8a BACKUP_DIR=./backups npm run dev

TAG ?= 0.0.19
IMAGE ?= kindservices/besu-ops

build:
	docker build -t $(IMAGE):$(TAG) . 

publish: build
	TAG=$(TAG) IMAGE=$(IMAGE) ./scripts/publish.sh

deploy:
	kubectl apply -f k8s
