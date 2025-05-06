.PHONY: takeBackup restoreBackup

# Take a backup of a Besu node
takeBackup:
	./scripts/backup-all.sh

# Restore a backup to a Besu node
restoreBackup:
	./scripts/restore-all.sh
