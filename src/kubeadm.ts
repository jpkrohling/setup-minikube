import * as kube from './kube';

export async function get(version: string) {
  await kube.get('kubeadm', version)
}
