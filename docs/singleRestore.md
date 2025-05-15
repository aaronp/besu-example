# Single Restore

The previous backup/restore demonstrated that we could reset a whole cluster to a single point in time by backing up each node.

This scenario demonstrates backing up a single node and then restoring the rest of the cluster from that one node.

We test that by:

1. creating an initial transaction
2. backing up one node (scale down, take backup)
3. clearing out the cluster (spinning down / deleting the data on the rest of the cluster)
4. restoring (brining up) the fresh nodes 