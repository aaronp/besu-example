import { listAllBlocks } from '$lib';
import { json } from '@sveltejs/kit';
import { ethers } from 'ethers';

export async function GET({ url }) {
    const host = url.searchParams.get('host');
    if (!host) {
        return json({ error: 'Missing host parameter' }, { status: 400 });
    }
    let rpcUrl: string;
    if (/^https?:\/\//.test(host) || /:\d+$/.test(host)) {
        rpcUrl = host;
        console.log(`Using RPC URL directly from host >${host}<`);
    } else {
        rpcUrl = `http://${host}:8545`;
        console.log(`Using default RPC URL: ${rpcUrl} from host >${host}<`);
    }
    const initialOffset = parseInt(url.searchParams.get('offset') || '0', 10);
    const untilOffset = parseInt(url.searchParams.get('until') || '0', 10);
    const batchSize = parseInt(url.searchParams.get('batchSize') || '3000', 10);
    try {
        const response = await listAllBlocks(rpcUrl, initialOffset, untilOffset, batchSize);
        return json({ host, rpcUrl, blocks: response.blocks, fromBlock: response.fromBlock });
    } catch (e) {
        console.error(`Error fetching chain:`, e);
        return json({ error: String(e) }, { status: 500 });
    }
} 