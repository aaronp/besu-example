#!/usr/bin/env bash
export TAG=${TAG:-0.0.1}
# export IMG=${IMG:-kindservices/service-registry:$TAG}
# export PORT=${PORT:-8080}
# export APP=${APP:-service-registry}
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


function clone() {
  cat <<-END

 CCCCC  lll                iii                 
CC    C lll  oooo  nn nnn      nn nnn   gggggg 
CC      lll oo  oo nnn  nn iii nnn  nn gg   gg 
CC    C lll oo  oo nn   nn iii nn   nn ggggggg 
 CCCCC  lll  oooo  nn   nn iii nn   nn      gg 
                                        ggggg  

END

  [ -d datamesh-service-registry ] || git clone https://github.com/kindservices/datamesh-service-registry.git
  [ -d datamesh-dashboard ] || git clone https://github.com/kindservices/datamesh-dashboard.git
  [ -d datamesh-component-pinot ] || git clone https://github.com/kindservices/datamesh-component-pinot.git
  [ -d kind-test-widget ] || git clone https://github.com/kindservices/kind-test-widget.git
  [ -d datamesh-widget-svelte.g8 ] || git clone https://github.com/kindservices/datamesh-widget-svelte.g8.git

  echo 
  echo "to create a new widget, use:"
  echo "    sbt new kindservices/datamesh-widget-svelte.g8"
  echo
  echo "see https://github.com/kindservices/datamesh-widget-svelte.g8"
  echo
}

function install() {
    cat <<-END

IIIII               tt            lll lll iii                 
 III  nn nnn   sss  tt      aa aa lll lll     nn nnn   gggggg 
 III  nnn  nn s     tttt   aa aaa lll lll iii nnn  nn gg   gg 
 III  nn   nn  sss  tt    aa  aaa lll lll iii nn   nn ggggggg 
IIIII nn   nn     s  tttt  aaa aa lll lll iii nn   nn      gg 
               sss                                     ggggg  

END


  ./datamesh-service-registry/install.sh
  ./datamesh-dashboard/install.sh
  ./datamesh-component-pinot/install.sh
  pushd ./kind-test-widget && make installArgo && popd
}


# conditional check to see if we have the data-mesh namespace
(kubectl get namespace argocd && echo "argocd is installed - installing data-mesh components" && clone && install) || (. installK8S.sh)