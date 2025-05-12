import { json } from '@sveltejs/kit';
import { execSync } from 'child_process';

export async function GET() {
    try {
        console.log('Getting nodes');
        const output = execSync('kubectl get svc -n besu -o json').toString();
        const data = JSON.parse(output);
        const nodes = data.items.map((svc: any) => ({
            name: svc.metadata.name,
            ip: svc.spec.clusterIP,
            ports: svc.spec.ports.map((p: any) => p.port)
        }));
        return json({ nodes });
    } catch (e) {
        return json({ nodes: [], error: String(e) }, { status: 500 });
    }
} 