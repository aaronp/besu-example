## Besu Operations

The project provides a workable example for operations needed for maintaining a Besu Network, such as backup and restore.


To see how you install kubernetes, a besu cluster and this operations dashboard, see [here](./docs/installation.md)


Then see how we can backup and restore transactions on that besu network [here](./docs/backupRestore.md).

## Contents

<pre>
.
├── README.md        <-- this readme
├── installK8S.sh    <-- script which helps you install a local 'kind' kubernetes cluster 
├── besu-ops/        <-- the besu cluster stuff
│   ├── Makefile     <-- common operations, such as 'make publish' and 'make deploy'
│   ├── Dockerfile   <-- how we containerise this project
│   ├── README.md    <-- documentation about the example dashboard project
│   ├── k8s          <-- kubernetes files for deploying the dashboard in your k8s cluster
│   ├── src          <-- the source files
│   └── ...          <-- other stuff - the usual suspects
├── ibft2            <-- a copy of https://github.com/Consensys/quorum-kubernetes/tree/master/playground/kubectl/quorum-besu/ibft2
└── docs             <-- docs
</pre>


