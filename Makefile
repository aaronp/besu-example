.PHONY: takeBackup restoreBackup createTransaction reportNodes

# Create a new transaction in the Besu network
createTransaction:
	./scripts/create-transaction.sh

reportNodes:
	./scripts/report-nodes.sh


# Take a backup of a Besu node
takeBackup:
	./scripts/backup-all.sh

# Restore a backup to a Besu node
restoreBackup:
	./scripts/restore-all.sh
