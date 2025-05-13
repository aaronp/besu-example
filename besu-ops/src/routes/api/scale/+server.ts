import type { RequestHandler } from '@sveltejs/kit';
import { exec } from 'child_process';

export const POST: RequestHandler = async ({ request }) => {
    const { podName, namespace, replicas } = await request.json();

    if (!podName || !namespace || typeof replicas !== 'number') {
        return new Response(
            JSON.stringify({ error: 'Missing podName, namespace, or replicas' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // Use kubectl to scale the deployment
    const scaleCommand = `kubectl scale deployment/${podName} --replicas=${replicas} -n ${namespace}`;
    try {
        const result = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
            exec(scaleCommand, (error, stdout, stderr) => {
                if (error) {
                    reject({ stdout, stderr });
                } else {
                    resolve({ stdout, stderr });
                }
            });
        });
        return new Response(
            JSON.stringify({
                status: 'success',
                message: `Scaled ${podName} to ${replicas} replicas in namespace ${namespace}`,
                output: result.stdout.trim()
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (err: any) {
        return new Response(
            JSON.stringify({
                status: 'error',
                message: err.stderr ? err.stderr.trim() : 'Unknown error',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}; 