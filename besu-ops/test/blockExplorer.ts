import { listAllBlocks, listBlocks } from '../src/lib/index';

// const blocks = await listAllBlocks('http://localhost:8545', 10000);
const blocks = await listAllBlocks('http://localhost:8545', 34155, 32155, 100);
console.log(`Fetched ${blocks.length} blocks`);
console.log(JSON.stringify(blocks, null, 2));
