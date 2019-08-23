import io = require('@actions/io');
import fs = require('fs');
import os = require('os');
import path = require('path');

const toolDir = path.join(__dirname, 'runner', 'tools', 'kubelet');
const tempDir = path.join(__dirname, 'runner', 'temp', 'kubelet');

process.env['RUNNER_TOOL_CACHE'] = toolDir;
process.env['RUNNER_TEMP'] = tempDir;
import * as kubelet from '../src/kubelet';

describe('kubelet tests', () => {
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

  it('Acquires version of kubelet if no matching version is installed', async () => {
    await kubelet.get('v1.15.0');
    const kubeletDir = path.join(toolDir, 'kubelet', '1.15.0', os.arch());

    expect(fs.existsSync(`${kubeletDir}.complete`)).toBe(true);
    expect(fs.existsSync(path.join(kubeletDir, 'kubelet'))).toBe(true);
  }, 100000);

  it('Throws if no location contains correct kubelet version', async () => {
    let thrown = false;
    try {
      await kubelet.get('1000.0');
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(true);
  });

  it('Uses version of kubelet installed in cache', async () => {
    const kubeletDir: string = path.join(toolDir, 'kubelet', '250.0.0', os.arch());
    await io.mkdirP(kubeletDir);
    fs.writeFileSync(`${kubeletDir}.complete`, 'dummy content');
    // This will throw if it doesn't find it in the cache (because no such version exists)
    await kubelet.get('250.0');
    return;
  });

  it('Doesnt use version of kubelet that was only partially installed in cache', async () => {
    const kubeletDir: string = path.join(toolDir, 'kubelet', '0.0.1', os.arch());
    await io.mkdirP(kubeletDir);
    let thrown = false;
    try {
      // This will throw if it doesn't find it in the cache (because no such version exists)
      await kubelet.get('v0.0.1');
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(true);
    return;
  });
});
