#!/usr/bin/env bash
# export IMG=${IMG:-kindservices/service-registry:$TAG}
# export PORT=${PORT:-8080}
export APP=${APP:-besu-example}
BRANCH=${BRANCH:-`git rev-parse --abbrev-ref HEAD`}
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

([ -d code ] || mkdir -p code) && cd code

uninstallArgo() {
    # Delete all applications that start with besu-example-
    argocd app list --output name | grep "^application.argoproj.io/besu-example-" | xargs -r argocd app delete --cascade
}

# assumes argocd (which argocd || brew install argocd) installed and logged in (argocd login localhost:$ARGO_PORT --username admin --password $MY_ARGO_PWD  --insecure --skip-test-tls )
#
# see 
# https://github.com/easy-being-green/argo-drone/blob/main/argo/argo.sh
#
installArgo() {
    echo "Creating applications for all k8s subdirectories in $BRANCH"

    # Get all subdirectories under k8s
    for dir in "$BASE_DIR/k8s"/*/; do
        if [ -d "$dir" ]; then
            # Get the directory name without the trailing slash
            dir_name=$(basename "$dir")
            app_name="${APP}-${dir_name}"
            
            echo "Creating application for $dir_name..."
            argocd app create "$app_name" \
                --repo https://github.com/aaronp/besu-example.git \
                --path "k8s/$dir_name" \
                --dest-server https://kubernetes.default.svc \
                --dest-namespace quorum \
                --sync-policy automated \
                --auto-prune \
                --revision "$BRANCH"
        fi
    done
}

# conditional check to see if we have the besu namespace
(kubectl get namespace argocd && echo "argocd is installed - installing Besu" && installArgo) || (. installK8S.sh)