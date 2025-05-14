import * as path from "path";
import * as crypto from "crypto";
import {
    lstat,
    readdir,
    readlink
} from "fs/promises";
import * as fs from "fs";

export interface SnapshotEntry {
    path: string;
    type: "file" | "directory" | "symlink" | "other";
    hash?: string;
    owner: { uid: number; gid: number };
    permissions: string;
    target?: string; // for symlinks
}

/**
 * Captures the metadata of a directory tree.
 * @param dirPath 
 * @returns 
 */
export async function snapshot(dirPath: string): Promise<SnapshotEntry[]> {
    const entries: SnapshotEntry[] = [];

    async function walk(currentPath: string) {
        const stats = await lstat(currentPath);
        const relative = path.relative(dirPath, currentPath) || ".";

        const entry: SnapshotEntry = {
            path: relative,
            type: stats.isDirectory() ? "directory" :
                stats.isFile() ? "file" :
                    stats.isSymbolicLink() ? "symlink" : "other",
            owner: { uid: stats.uid, gid: stats.gid },
            permissions: (stats.mode & 0o777).toString(8)
        };

        if (stats.isFile()) {
            entry.hash = await hashFile(currentPath);
        } else if (stats.isSymbolicLink()) {
            entry.target = await readlink(currentPath);
        }

        entries.push(entry);

        if (stats.isDirectory()) {
            const children = await readdir(currentPath);
            for (const child of children.sort()) {
                await walk(path.join(currentPath, child));
            }
        }
    }

    await walk(path.resolve(dirPath));
    return entries;
}

async function hashFile(filePath: string): Promise<string> {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    return new Promise((resolve, reject) => {
        stream.on("error", reject);
        stream.on("data", chunk => hash.update(chunk));
        stream.on("end", () => resolve(hash.digest("hex")));
    });
}


export type SnapshotDelta =
    | { type: "added"; path: string; newEntry: SnapshotEntry }
    | { type: "removed"; path: string; oldEntry: SnapshotEntry }
    | { type: "modified"; path: string; oldEntry: SnapshotEntry; newEntry: SnapshotEntry; changes: string[] };

export function diffSnapshot(
    oldSnapshot: SnapshotEntry[],
    newSnapshot: SnapshotEntry[]
): SnapshotDelta[] {
    const deltas: SnapshotDelta[] = [];

    const oldMap = new Map(oldSnapshot.map(e => [e.path, e]));
    const newMap = new Map(newSnapshot.map(e => [e.path, e]));

    const allPaths = new Set([...oldMap.keys(), ...newMap.keys()]);

    for (const path of Array.from(allPaths).sort()) {
        const oldEntry = oldMap.get(path);
        const newEntry = newMap.get(path);

        if (!oldEntry && newEntry) {
            deltas.push({ type: "added", path, newEntry });
        } else if (oldEntry && !newEntry) {
            deltas.push({ type: "removed", path, oldEntry });
        } else if (oldEntry && newEntry) {
            const changes: string[] = [];

            if (oldEntry.type !== newEntry.type) changes.push("type");
            if (oldEntry.hash !== newEntry.hash) changes.push("hash");
            if (oldEntry.permissions !== newEntry.permissions) changes.push("permissions");
            if (oldEntry.owner.uid !== newEntry.owner.uid || oldEntry.owner.gid !== newEntry.owner.gid) changes.push("owner");
            if (oldEntry.target !== newEntry.target) changes.push("target");

            if (changes.length > 0) {
                deltas.push({
                    type: "modified",
                    path,
                    oldEntry,
                    newEntry,
                    changes
                });
            }
        }
    }

    return deltas;
}
