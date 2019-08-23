import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as os from 'os';
import * as fs from 'fs';

const osPlat: string = os.platform();

export async function get(binName: string, version: string) {
  // tries to get the binary from the cache
  let path = tc.find(binName, version);
  if (!path) {
    // not in the cache, download and put it in the cache
    path = await acquire(binName, version);
    core.debug(`${binName} is cached under ${path}`);
  }

  core.addPath(path);
}

async function acquire(binName: string, version: string): Promise<string> {
  //
  // Download - a tool installer intimately knows how to get the tool (and construct urls)
  //
  let downloadUrl: string = getDownloadUrl(binName, version);
  let downloadPath: string | null = null;
  try {
    downloadPath = await tc.downloadTool(downloadUrl);
  } catch (error) {
    core.debug(error);
    throw `Failed to download version ${version}: ${error}`;
  }

  fs.chmodSync(downloadPath, '755');

  // copy the resulting file to the local user's cache, which is the expected location by minikube
  let localUserCacheDir = `${os.homedir()}/.minikube/cache/${version}`;
  if (!fs.existsSync(localUserCacheDir)) {
    fs.mkdirSync(localUserCacheDir);
  }
  fs.copyFileSync(downloadPath, `${localUserCacheDir}/${binName}`)

  return await tc.cacheFile(downloadPath, binName, binName, version);
}

function getDownloadUrl(binName: string, version: string): string {
  if (osPlat != "linux") {
    throw `Unsupported platform: ${osPlat}`;
  }

  return `https://storage.googleapis.com/kubernetes-release/release/${version}/bin/${osPlat}/amd64/${binName}`
}
