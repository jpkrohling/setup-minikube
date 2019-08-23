import * as core from '@actions/core';
import * as minikube from './minikube';

export async function get(version: string) {
  await minikube.get(version).catch((e) => {
    core.error(`failed to get minikube: ${e}`);
  });
}
