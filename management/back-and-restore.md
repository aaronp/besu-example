# Quorum Node Backup and Restore Process

This document describes the backup and restore process for Quorum nodes in a Kubernetes cluster.

## Components

### 1. Scripts
- `backup-member.sh`: Backs up a single member node
- `restore-member.sh`: Restores a single member node
- `backup-all.sh`: Backs up all member nodes
- `restore-all.sh`: Restores all member nodes

### 2. Storage
- Persistent Volume Claims (PVCs) for each member node
- Backup storage location (configurable via `BACKUP_DIR`)

### 3. Kubernetes Resources
- ConfigMap: Contains all backup/restore scripts
- ServiceAccount: Provides necessary permissions
- Role: Defines permissions for backup/restore operations
- RoleBinding: Binds the Role to the ServiceAccount

## Process Flow

### Backup Process
1. **Scale Down**
   - Scale down the target member node to 0 replicas
   - Wait for the pod to terminate completely

2. **Create Backup Pod**
   - Create a temporary pod with access to the member's PVC
   - Mount the PVC at `/data`

3. **Create Backup**
   - Create a tar archive of the data directory
   - Save to `$BACKUP_DIR/member<N>/<timestamp>.tar.gz`
   - Verify backup file is created and not empty

4. **Cleanup**
   - Delete the temporary backup pod
   - Scale the member node back up to 1 replica
   - Wait for the pod to be ready (2/2 containers running)

### Restore Process
1. **Find Latest Backup**
   - Locate the most recent backup for the target member
   - Verify the backup file exists and is not empty

2. **Scale Down**
   - Scale down the target member node to 0 replicas
   - Wait for the pod to terminate completely

3. **Create Restore Pod**
   - Create a temporary pod with access to the member's PVC
   - Mount the PVC at `/data`

4. **Restore Data**
   - Clean the data directory
   - Extract the backup archive to the data directory
   - Verify the restore operation completed successfully

5. **Cleanup**
   - Delete the temporary restore pod
   - Scale the member node back up to 1 replica
   - Wait for the pod to be ready (2/2 containers running)

## Usage

### Individual Node Operations
```bash
# Backup a single node
./backup-member.sh <member_number>

# Restore a single node
./restore-member.sh <member_number>
```

### All Nodes Operations
```bash
# Backup all nodes
./backup-all.sh

# Restore all nodes
./restore-all.sh
```

## Configuration

### Environment Variables
- `BACKUP_DIR`: Base directory for backups (default: `/backups`)
- `NAMESPACE`: Kubernetes namespace (default: `quorum`)

### Timeouts
- Pod termination: No fixed timeout, waits until complete
- Pod startup: 5 minutes (300 seconds)
- Backup/restore operations: No fixed timeout

## Error Handling

The scripts include comprehensive error handling:
1. Verify all required parameters are provided
2. Check for existence of backup files
3. Verify backup files are not empty
4. Monitor pod status and provide detailed error information
5. Clean up resources on failure
6. Scale nodes back up if operations fail

## Security Considerations

1. **RBAC Permissions**
   - Pod management (create, delete)
   - PVC access
   - StatefulSet scaling

2. **Data Protection**
   - Backups are stored in member-specific directories
   - Each backup is timestamped
   - Empty or corrupted backups are detected and rejected

## Monitoring and Logging

The scripts provide detailed progress information:
- Current operation being performed
- Elapsed time for long-running operations
- Pod status and events on failure
- Backup/restore file paths and sizes

## Best Practices

1. **Backup Frequency**
   - Regular backups recommended
   - Consider automated scheduling

2. **Storage Management**
   - Monitor backup storage usage
   - Implement retention policies

3. **Testing**
   - Test restore process regularly
   - Verify node functionality after restore

4. **Documentation**
   - Document backup locations
   - Keep track of successful restores 