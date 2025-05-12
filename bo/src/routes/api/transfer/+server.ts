import { json } from '@sveltejs/kit';
import { ethers } from 'ethers';

export async function POST({ request }) {
    try {
        const { to, value, privateKey, rpcUrl } = await request.json();
        if (!to || !value || !privateKey) {
            return json({ message: 'Missing required fields' }, { status: 400 });
        }
        if (!ethers.isAddress(to)) {
            return json({ message: 'Invalid Ethereum address' }, { status: 400 });
        }
        const url = rpcUrl || 'http://localhost:8545';
        const provider = new ethers.JsonRpcProvider(url);

        console.log('transferring', {
            url, to, value, privateKey
        })

        const wallet = new ethers.Wallet(privateKey, provider);
        console.log(`sending transaction to ${to} with value ${value}`);
        const etherValue = ethers.parseEther(String(value));
        console.log(`etherValue: ${etherValue}`);
        const tx = await wallet.sendTransaction({ to, value: etherValue });
        console.log(`tx: ${tx}`);
        await tx.wait();
        return json({ message: `Transaction sent: ${tx.hash}` });
    } catch (e) {
        console.error(e);
        return json({ message: e && typeof e === 'object' && 'message' in e ? e.message : String(e) }, { status: 500 });
    }
} 