import * as core from '@actions/core';
import * as installer from './installer';

async function run() {
  try {
    const version = core.getInput('minikube-version');
    const kubernetesVersion = core.getInput('kubernetes-version');
    await installer.get(version, kubernetesVersion);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
