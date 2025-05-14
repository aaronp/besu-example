# How this Works

You can [install](./installation.md) the besu cluster and operations locally and test out [backup and restore](./backupRestore.md).

The key elements of this demonstration which enable this functionality is:

# kubectl access

The Besu Ops dashboard has been given cluster role permissions in [role-pod-reader.yaml](../besu-ops/k8s/role-pod-reader.yaml) and [rolebinding-pod-reader](../besu-ops/k8s/rolebinding-pod-reader.yaml) to allow it to execute kubectl commands within the namespace. 

It uses `kubectl` to provide the data for the dashboard, and to
