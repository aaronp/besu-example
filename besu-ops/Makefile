.PHONY: dev build publish deploy
dev:
	npm run dev

TAG ?= 0.0.12
IMAGE ?= kindservices/besu-ops

build:
	docker build -t $(IMAGE):$(TAG) . 

publish: build
	TAG=$(TAG) IMAGE=$(IMAGE) ./scripts/publish.sh

deploy:
	kubectl apply -f k8s
