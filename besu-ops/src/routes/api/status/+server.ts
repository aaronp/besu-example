import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {



    // Mock status data
    return new Response(
        JSON.stringify({
            status: 'up', // could be 'up', 'down', 'starting', 'stopping'
            details: 'Node is running',
        }),
        {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        }
    );
};

export const POST: RequestHandler = async ({ request }) => {
    const { podName } = await request.json();
    if (!podName) {
        return new Response(JSON.stringify({ error: 'Missing podName' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    const exec = (await import('child_process')).exec;
    function run(cmd: string) {
        return new Promise<string>((resolve, reject) => {
            exec(cmd, (err, stdout, stderr) => {
                if (err) reject(stderr || err.message);
                else resolve(stdout);
            });
        });
    }
    try {
        const status = await run(`kubectl get pod ${podName} -o json`);
        const logs = await run(`kubectl logs ${podName}`);
        return new Response(
            JSON.stringify({ status: JSON.parse(status), logs }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.toString() }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}; 