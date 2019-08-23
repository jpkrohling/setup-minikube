import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as os from 'os';
import * as fs from 'fs';

const osPlat: string = os.platform();

export async function get(version: string) {
  // tries to get the binary from the cache
  let minikubePath = tc.find('minikube', version);
  if (!minikubePath) {
    // not in the cache, download and put it in the cache
    minikubePath = await acquire(version);
    core.debug('minikube is cached under ' + minikubePath);
  }

  core.addPath(minikubePath);
}

async function acquire(version: string): Promise<string> {
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
  return `https://github.com/kubernetes/minikube/releases/download/${version}/${filename}`
}
