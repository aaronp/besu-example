import { getNamespaceTopology } from '$lib/k9s';
import type { RequestHandler } from '@sveltejs/kit';


export const POST: RequestHandler = async ({ request }) => {

    const { statefulset, namespace } = await request.json();
    if (!statefulset || !namespace) {
        return new Response(JSON.stringify({ error: 'Missing statefulset or namespace' }), {
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
    console.log('getting status for', statefulset, "in", namespace);

    const cluster = await getNamespaceTopology(namespace);
    const statefulSet = cluster.find((item) => item.statefulSet === statefulset);
    if (!statefulSet) {
        console.log('StatefulSet not found', statefulset, namespace);
        return new Response(JSON.stringify({ error: 'StatefulSet not found' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const pods = statefulSet.services.flatMap((service) => service.pods);
    if (pods.length != 1) {
        console.log(pods.length, 'found for', statefulset, namespace);
        return new Response(
            JSON.stringify({ status: "Not  Found" }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    }
    const podName = pods[0];
    console.log('podName', podName);
    // podName is actually the service name, e.g. besu-validator1
    const listPodsByService = `kubectl get pod ${podName} -n ${namespace} -o jsonpath='{.status.phase}'`

    try {
        console.log(listPodsByService)
        const status = await run(listPodsByService);

        return new Response(
            JSON.stringify({ status }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (e: any) {
        console.error('error getting status', e);
        return new Response(JSON.stringify({ error: e.toString() }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}; 