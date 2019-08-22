// Load tempDirectory before it gets wiped by tool-cache
let tempDirectory = process.env['RUNNER_TEMPDIRECTORY'] || '';
import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as os from 'os';
import * as fs from 'fs';
import * as util from 'util';

const osPlat: string = os.platform();

export async function getMinikube(version: string) {
  // check cache
  let toolPath: string;
  toolPath = tc.find('minikube', version);

  if (!toolPath) {
    // download, extract, cache
    toolPath = await acquireMinikube(version);
    core.debug('minikube is cached under ' + toolPath);
  }

  core.addPath(toolPath);
}

async function acquireMinikube(version: string): Promise<string> {
  //
  // Download - a tool installer intimately knows how to get the tool (and construct urls)
  //
  let fileName: string = getFileName();
  let downloadUrl: string = getDownloadUrl(version, fileName);
  let downloadPath: string | null = null;
  try {
    downloadPath = await tc.downloadTool(downloadUrl);
  } catch (error) {
    core.debug(error);
    throw `Failed to download version ${version}: ${error}`;
  }

  fs.chmodSync(downloadPath, '755');

  return await tc.cacheFile(downloadPath, 'minikube', 'minikube', version);
}

function getFileName(): string {
  switch (osPlat) {
        case "linux":
            return "minikube-linux-amd64";
        case "win32":
            return "minikube-windows-amd64.exe";
        case "darwin":
            return "minikube-darwin-amd64";
        default:
            throw `Unknown platform: ${osPlat}`;
  }
}

function getDownloadUrl(version: string, filename: string): string {
  return util.format('https://github.com/kubernetes/minikube/releases/download/%s/%s', version, filename);
}
