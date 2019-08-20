import io = require('@actions/io');
import fs = require('fs');
import os = require('os');
import path = require('path');

const toolDir = path.join(__dirname, 'runner', 'tools');
const tempDir = path.join(__dirname, 'runner', 'temp');

process.env['RUNNER_TOOL_CACHE'] = toolDir;
process.env['RUNNER_TEMP'] = tempDir;
import * as installer from '../src/installer';

describe('installer tests', () => {
  beforeAll(async () => {
    await io.rmRF(toolDir);
    await io.rmRF(tempDir);
  }, 100000);

  // afterAll(async () => {
  //   try {
  //     await io.rmRF(toolDir);
  //     await io.rmRF(tempDir);
  //   } catch {
  //     console.log('Failed to remove test directories');
  //   }
  // }, 100000);

  it('Acquires version of minikube if no matching version is installed', async () => {
    await installer.getMinikube('v1.3.0');
    const minikubeDir = path.join(toolDir, 'minikube', '1.3.0', os.arch());

    expect(fs.existsSync(`${minikubeDir}.complete`)).toBe(true);
    expect(fs.existsSync(path.join(minikubeDir, 'minikube'))).toBe(true);
  }, 100000);

  it('Throws if no location contains correct minikube version', async () => {
    let thrown = false;
    try {
      await installer.getMinikube('1000.0');
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(true);
  });

  it('Uses version of minikube installed in cache', async () => {
    const minikubeDir: string = path.join(toolDir, 'minikube', '250.0.0', os.arch());
    await io.mkdirP(minikubeDir);
    fs.writeFileSync(`${minikubeDir}.complete`, 'dummy content');
    // This will throw if it doesn't find it in the cache (because no such version exists)
    await installer.getMinikube('250.0');
    return;
  });

  it('Doesnt use version of minikube that was only partially installed in cache', async () => {
    const minikubeDir: string = path.join(toolDir, 'minikube', '0.0.1', os.arch());
    await io.mkdirP(minikubeDir);
    let thrown = false;
    try {
      // This will throw if it doesn't find it in the cache (because no such version exists)
      await installer.getMinikube('v0.0.1');
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(true);
    return;
  });
});
