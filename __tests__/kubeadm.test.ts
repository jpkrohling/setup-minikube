import io = require('@actions/io');
import fs = require('fs');
import os = require('os');
import path = require('path');

const toolDir = path.join(__dirname, 'runner', 'tools', 'kubeadm');
const tempDir = path.join(__dirname, 'runner', 'temp', 'kubeadm');

process.env['RUNNER_TOOL_CACHE'] = toolDir;
process.env['RUNNER_TEMP'] = tempDir;
import * as kubeadm from '../src/kubeadm';

describe('kubeadm tests', () => {
  beforeAll(async () => {
    await io.rmRF(toolDir);
    await io.rmRF(tempDir);
  }, 100000);

  afterAll(async () => {
    try {
      await io.rmRF(toolDir);
      await io.rmRF(tempDir);
    } catch {
      console.log('Failed to remove test directories');
    }
  }, 100000);

  it('Acquires version of kubeadm if no matching version is installed', async () => {
    await kubeadm.get('v1.15.0');
    const kubeadmDir = path.join(toolDir, 'kubeadm', '1.15.0', os.arch());

    expect(fs.existsSync(`${kubeadmDir}.complete`)).toBe(true);
    expect(fs.existsSync(path.join(kubeadmDir, 'kubeadm'))).toBe(true);
  }, 100000);

  it('Throws if no location contains correct kubeadm version', async () => {
    let thrown = false;
    try {
      await kubeadm.get('1000.0');
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(true);
  });

  it('Uses version of kubeadm installed in cache', async () => {
    const kubeadmDir: string = path.join(toolDir, 'kubeadm', '250.0.0', os.arch());
    await io.mkdirP(kubeadmDir);
    fs.writeFileSync(`${kubeadmDir}.complete`, 'dummy content');
    // This will throw if it doesn't find it in the cache (because no such version exists)
    await kubeadm.get('250.0');
    return;
  });

  it('Doesnt use version of kubeadm that was only partially installed in cache', async () => {
    const kubeadmDir: string = path.join(toolDir, 'kubeadm', '0.0.1', os.arch());
    await io.mkdirP(kubeadmDir);
    let thrown = false;
    try {
      // This will throw if it doesn't find it in the cache (because no such version exists)
      await kubeadm.get('v0.0.1');
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(true);
    return;
  });
});
