# Backup and Restore Test Evidence

## Test Overview
This document records the evidence of testing the backup and restore functionality of the Quorum cluster. The test involves:
1. Creating an initial transaction
2. Verifying transaction across all nodes
3. Taking a backup of all nodes
4. Creating a second transaction
5. Restoring from backup
6. Verifying the rollback of the second transaction

## Step 1: Initial Transaction Creation
Transaction created successfully:
- Transaction Hash: `0xe068fd42c6dcbe139558dd03a0aa3fef1f7ced57da12604dce972e31e69c02ac`
- Block Number: 424
- Gas Used: 21000
- From/To: `0x883C7F48489ce8313f6d33631919545B622365c1`
- Value: 1 ETH (1000000000000000000 wei)

## Step 2: Initial Transaction Verification
All nodes (member1, member2, member3) show the transaction in block 424:
- Block Hash: `0x660bb37fe7fc501d0b155d7d6b142966f3227be925522be65ba3a2207c270d24`
- Timestamp: 2025-05-02T15:15:59
- Transaction Hash: `0xe068fd42c6dcbe139558dd03a0aa3fef1f7ced57da12604dce972e31e69c02ac`

All nodes are in sync and show the same block and transaction information.

## Step 3: Backup Creation
Backup completed successfully for all member nodes:
- member1: `backups/member1/20250502-161039.tar.gz`
- member2: `backups/member2/20250502-161150.tar.gz`
- member3: `backups/member3/20250502-161300.tar.gz`

All nodes were scaled down before backup to ensure consistency. Each backup process:
1. Scaled down the node
2. Created a backup pod
3. Created a tar archive of the data directory
4. Scaled the node back up
5. Verified the node was running

## Step 4: Second Transaction Creation
Second transaction created successfully:
- Transaction Hash: `0xae15212c0f8cf56ae9e83ab07080e6e25b649e5d25c76e30f1bccd5116f42a25`
- Block Number: 1357
- Gas Used: 21000
- From/To: `0x883C7F48489ce8313f6d33631919545B622365c1`
- Value: 1 ETH (1000000000000000000 wei)
- Nonce: 2

## Step 5: Restore Operation
Restore completed successfully for all member nodes:
- member1: Restored from `backups/member1/20250502-161039.tar.gz`
- member2: Restored from `backups/member2/20250502-161150.tar.gz`
- member3: Restored from `backups/member3/20250502-161300.tar.gz`

Restore process for each node:
1. Scaled down the node
2. Created a restore pod
3. Cleaned the data directory
4. Restored from backup archive
5. Scaled the node back up
6. Verified the node was running

All nodes were successfully restored to their state at the time of backup.

## Step 6: Transaction Rollback Verification
Verification Results:
- All nodes (member1, member2, member3) still show block 1357 with the second transaction
- Block Hash: `0x0c9390a914ba2a28e27f90cc8cc4c8ef010d87e5a5354ec241daceb4a9505296`
- Transaction Hash: `0xae15212c0f8cf56ae9e83ab07080e6e25b649e5d25c76e30f1bccd5116f42a25`
- Timestamp: 2025-05-02T16:33:44

The second transaction was not rolled back as expected. This indicates that the restore operation might not have been completely successful in restoring the blockchain state to the point before the second transaction.

## Test Results Summary
The backup and restore test revealed the following:

1. Initial Setup:
   - Successfully created and verified the first transaction
   - All nodes were in sync and showed consistent state

2. Backup Process:
   - Successfully created backups for all member nodes
   - Backup process properly scaled down nodes and created backup archives

3. Second Transaction:
   - Successfully created and verified the second transaction
   - All nodes remained in sync

4. Restore Process:
   - Restore operation completed without errors
   - All nodes were successfully scaled down and up
   - However, the blockchain state was not properly rolled back

5. Issues Identified:
   - The restore operation did not effectively roll back the blockchain state
   - The second transaction (block 1357) remained in the chain after restore
   - This suggests that the current backup/restore process might not be capturing all necessary blockchain state data

6. Recommendations:
   - Review the backup process to ensure it captures all necessary blockchain state
   - Consider implementing additional verification steps in the restore process
   - Investigate if additional data needs to be backed up to ensure proper state restoration
   - Consider implementing a more comprehensive blockchain state backup solution 