import * as core from '@actions/core';
import * as installer from './installer';

async function run() {
  try {
    const version = core.getInput('minikube-version');
    await installer.get(version);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
