import * as minikube from './minikube';
import * as kubeadm from './kubeadm';
import * as kubelet from './kubelet';

export async function get(version: string, kubernetesVersion: string) {
  await Promise.all([
    minikube.get(version),
    kubeadm.get(kubernetesVersion),
    kubelet.get(kubernetesVersion)
  ]);
}
