#!/usr/bin/env bash
export TAG=${TAG:-0.0.1}
# export IMG=${IMG:-kindservices/service-registry:$TAG}
# export PORT=${PORT:-8080}
export APP=${APP:-besu-example}
BRANCH=${BRANCH:-`git rev-parse --abbrev-ref HEAD`}

([ -d code ] || mkdir -p code) && cd code

uninstallArgo() {
    argocd app delete $APP --cascade
}

# assumes argocd (which argocd || brew install argocd) installed and logged in (argocd login localhost:$ARGO_PORT --username admin --password $MY_ARGO_PWD  --insecure --skip-test-tls )
#
# see 
# https://github.com/easy-being-green/argo-drone/blob/main/argo/argo.sh
#
installArgo() {
    echo "creating $APP in $BRANCH"

    kubectl create namespace data-mesh 2> /dev/null
    
    # beast mode :-)
    argocd app create $APP \
    --repo https://github.com/aaronp/besu-example.git \
    --path k8s \
    --dest-server https://kubernetes.default.svc \
    --dest-namespace quorum \
    --sync-policy automated \
    --auto-prune \
    --revision $BRANCH

    # --self-heal \
}



# conditional check to see if we have the data-mesh namespace
(kubectl get namespace argocd && echo "argocd is installed - installing data-mesh components" && clone && installArgo) || (. installK8S.sh)