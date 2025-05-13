import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export type K8SService = {
    name: string;
    pods: string[];
}
export type StatefulSet = {
    statefulSet: string;
    services: K8SService[];
};

export async function getNamespaceTopology(namespace: string): Promise<StatefulSet[]> {
    try {
        // Step 1: Get all StatefulSets
        const { stdout: stsRaw } = await execAsync(`kubectl get statefulset -n ${namespace} -o json`);
        const statefulSets = JSON.parse(stsRaw).items;

        // Step 2: Get all Services
        const { stdout: svcRaw } = await execAsync(`kubectl get svc -n ${namespace} -o json`);
        const services = JSON.parse(svcRaw).items;

        // Step 3: Prepare topology
        const topology: StatefulSet[] = [];

        for (const sts of statefulSets) {
            const stsName = sts.metadata.name;
            const matchLabels = sts.spec.selector.matchLabels;

            if (!matchLabels || Object.keys(matchLabels).length === 0) continue;

            const labelSelector = Object.entries(matchLabels).map(([k, v]) => `${k}=${v}`).join(',');

            // Step 4: Find matching services
            const matchedServices = services.filter((svc: any) => {
                const svcSelector = svc.spec.selector;
                if (!svcSelector) return false;
                return Object.entries(matchLabels).every(
                    ([k, v]) => svcSelector[k] === v
                );
            });

            // Step 5: Get pods matching the label selector
            const { stdout: podRaw } = await execAsync(`kubectl get pods -n ${namespace} -l ${labelSelector} -o json`);
            const pods = JSON.parse(podRaw).items.map((pod: any) => pod.metadata.name);

            // Step 6: Build service->pods mapping
            const serviceBlocks = matchedServices.map((svc: any) => ({
                name: svc.metadata.name,
                pods
            }));

            topology.push({
                statefulSet: stsName,
                services: serviceBlocks
            });
        }

        return topology;
    } catch (error: any) {
        console.error('Failed to get topology:', error.message);
        return [];
    }
}


/**
 * Returns the name of the StatefulSet backing the given service in a Kubernetes namespace.
 */
export async function getStatefulSetForService(namespace: string, service: string): Promise<string | null> {
    try {
        // Step 1: Get service selector labels
        const { stdout: svcYaml } = await execAsync(`kubectl get service ${service} -n ${namespace} -o json`);
        const svc = JSON.parse(svcYaml);
        const selectors = svc.spec.selector;
        if (!selectors || Object.keys(selectors).length === 0) {
            throw new Error(`Service '${service}' in namespace '${namespace}' has no selector.`);
        }

        // Format label selector for kubectl (e.g., "app=besu,role=validator")
        const labelSelector = Object.entries(selectors).map(([k, v]) => `${k}=${v}`).join(',');

        // Step 2: Get one matching pod name
        const { stdout: podListJson } = await execAsync(`kubectl get pods -l ${labelSelector} -n ${namespace} -o json`);
        const podList = JSON.parse(podListJson);
        if (!podList.items || podList.items.length === 0) {
            throw new Error(`No pods found for selector '${labelSelector}' in namespace '${namespace}'.`);
        }
        const pod = podList.items[0];

        // Step 3: Get owner reference (StatefulSet)
        const owner = pod.metadata.ownerReferences?.find((ref: any) => ref.kind === 'StatefulSet');
        if (!owner) {
            throw new Error(`No StatefulSet owner found for pod '${pod.metadata.name}'.`);
        }

        return owner.name;
    } catch (error: any) {
        console.error(`Failed to get StatefulSet for service '${service}':`, error.message);
        return null;
    }
}
