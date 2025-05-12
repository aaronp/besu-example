// place files you want to import through the `$lib` alias in this folder.

import { ethers } from "ethers";

function withTimeout(promise: Promise<any>, ms: number) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Timed out')), ms);
        promise.then((value) => {
            clearTimeout(timer);
            resolve(value);
        }, (err) => {
            clearTimeout(timer);
            reject(err);
        });
    });
}

/**
 * 
 * @param rpcUrl 
 * @param initialOffset if 0, the latest block is used
 * @param untilBlock the minimum block to read to (inclusive)
 * @param batchSize the number of blocks to read in each batch
 * @returns all the non-empty blocks from the initial offset to the until block (inclusive)
 */
export async function listAllBlocks(rpcUrl: string, initialOffset: number = 0, untilBlock: number = 0, batchSize: number = 3000) {

    const timeout = 3000;
    const provider = new ethers.JsonRpcProvider(rpcUrl);



    let blocks: any[] = [];
    let currentOffset = initialOffset > 0 ? initialOffset : await withTimeout(provider.getBlockNumber(), timeout) as number;

    const startBlock = currentOffset;
    let currentDepth = currentOffset;

    while (currentOffset > 0 && currentDepth >= untilBlock) {
        const count = Math.min(batchSize, currentDepth > untilBlock ? currentDepth - untilBlock : currentDepth);
        currentDepth -= count;
        console.log(`Fetching ${count} blocks from ${currentOffset}`);
        const batch = await listBlocks(provider, count, timeout, currentOffset);
        blocks = blocks.concat(batch);
        currentOffset -= count;
        console.log(`\tFetched ${batch.length} new block(s), ${blocks.length} total from ${currentOffset} to ${currentOffset + count}`);
    }
    return {
        fromBlock: startBlock,
        blocks
    }
}

export async function listBlocks(provider: ethers.JsonRpcProvider, maxCount: number, timeout: number, offset: number = 0) {

    const count = Math.min(maxCount, offset);
    const firstBlock = offset;

    const blocks = await Promise.all(
        Array.from({ length: count }, (_, i) => firstBlock - i)
            .flatMap(async (blockNumber) => {
                try {
                    const block = await withTimeout(provider.getBlock(blockNumber, true), timeout) as any;
                    if (!block) return [];
                    const txs = Array.isArray(block.transactions) && typeof block.transactions[0] === 'object'
                        ? (block.transactions as any[])
                            .filter((tx) => tx && (tx.from || tx.to))
                            .map((tx) => ({
                                hash: tx.hash,
                                from: tx.from,
                                to: tx.to,
                                value: tx.value?.toString(),
                                timestamp: block.timestamp
                            }))
                        : (block.transactions as string[])
                            .filter((hash) => !!hash)
                            .map((hash) => ({ hash, timestamp: block.timestamp }));
                    if (txs.length > 0) {
                        return [{ number: block.number, transactions: txs }];
                    } else {
                        return [];
                    }
                } catch (e) {
                    console.error(`Error fetching block ${blockNumber}`);
                    return [];
                }
            })
    );
    // Flatten the array (since flatMap returns arrays)
    return blocks.flat();
}