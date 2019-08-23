import * as core from '@actions/core';
import * as minikube from './minikube';
import * as kubeadm from './kubeadm';
import * as kubelet from './kubelet';

export async function get(version: string, kubernetesVersion: string) {
  await Promise.all([
    minikube.get(version).catch((e) => {
      core.error(`failed to get minikube: ${e}`);
    }),
    kubeadm.get(kubernetesVersion).catch((e) => {
      core.error(`failed to get kubeadm: ${e}`);
    }),
    kubelet.get(kubernetesVersion).catch((e) => {
      core.error(`failed to get kubelet: ${e}`);
    })
  ]);
}
