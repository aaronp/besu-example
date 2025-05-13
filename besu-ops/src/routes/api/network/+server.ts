import { getNamespaceTopology, type K8SService, type StatefulSet } from '$lib/k9s';
import { json } from '@sveltejs/kit';
import { execSync } from 'child_process';

export type ClusterService = {
    name: string;
    ip?: string;
    ports: number[];
    pods: string[];
}
export type StatefulSetResponse = {
    statefulSet: string;
    services: ClusterService[];
};

export async function GET({ url }: { url: URL }) {
    try {
        const namespace = url.searchParams.get('namespace') || 'besu';
        console.log('Getting nodes');
        const output = execSync(`kubectl get svc -n ${namespace} -o json`).toString();
        const data = JSON.parse(output);
        const nodes = data.items.map((svc: any) => ({
            name: svc.metadata.name,
            ip: svc.spec.clusterIP,
            ports: svc.spec.ports.map((p: any) => p.port)
        }));

        const network = await getNamespaceTopology(namespace);

        const ipByService = nodes.reduce((acc: any, node: any) => {
            acc[node.name] = {
                ip: node.ip,
                ports: node.ports
            };
            return acc;
        }, {});

        const enriched = network.map((item: StatefulSet) => {
            const services = item.services.map((service: K8SService) => {
                const name = service.name
                if (ipByService[name]) {
                    const { ip, ports } = ipByService[name]

                    return {
                        ...service,
                        ip, ports
                    }
                } else {
                    return service
                }
            });

            return {
                statefulSet: item.statefulSet,
                services
            }
        });

        return json({ cluster: enriched });
    } catch (e) {
        return json({ nodes: [], error: String(e) }, { status: 500 });
    }
} 