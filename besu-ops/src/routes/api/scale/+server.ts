import { getNamespaceTopology, getStatefulSetForService } from '$lib/k9s';
import type { RequestHandler } from '@sveltejs/kit';
import { exec } from 'child_process';

export const POST: RequestHandler = async ({ request }) => {
    const { statefulset, namespace, replicas } = await request.json();

    console.log('scaling', statefulset, namespace, replicas);
    if (!statefulset || !namespace || typeof replicas !== 'number') {
        return new Response(
            JSON.stringify({ error: 'Missing statefulset, namespace, or replicas' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // const cluster = await getNamespaceTopology(namespace);
    // if (!statefulSetName) {
    //     console.log('StatefulSet not found', serviceName, namespace);
    //     return new Response(
    //         JSON.stringify({ error: 'StatefulSet not found' }),
    //         { status: 400, headers: { 'Content-Type': 'application/json' } }
    //     );
    // }
    // Use kubectl to scale the deployment
    const scaleCommand = `kubectl scale statefulset ${statefulset} --replicas=${replicas} -n ${namespace}`;
    console.log('scaleCommand', scaleCommand);
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
        console.error('scaling result', result);
        return new Response(
            JSON.stringify({
                status: 'success',
                message: `Scaled ${statefulset} to ${replicas} replicas in namespace ${namespace}`,
                output: result.stdout.trim()
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (err: any) {
        console.error('error scaling', err);
        return new Response(
            JSON.stringify({
                status: 'error',
                message: err.stderr ? err.stderr.trim() : 'Unknown error',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}; 