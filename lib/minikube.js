"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const tc = __importStar(require("@actions/tool-cache"));
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
const osPlat = os.platform();
function get(version) {
    return __awaiter(this, void 0, void 0, function* () {
        // tries to get the binary from the cache
        let minikubePath = tc.find('minikube', version);
        if (!minikubePath) {
            // not in the cache, download and put it in the cache
            minikubePath = yield acquire(version);
            core.debug('minikube is cached under ' + minikubePath);
        }
        core.addPath(minikubePath);
    });
}
exports.get = get;
function acquire(version) {
    return __awaiter(this, void 0, void 0, function* () {
        //
        // Download - a tool installer intimately knows how to get the tool (and construct urls)
        //
        let fileName = getFileName();
        let downloadUrl = getDownloadUrl(version, fileName);
        let downloadPath = null;
        try {
            downloadPath = yield tc.downloadTool(downloadUrl);
        }
        catch (error) {
            core.debug(error);
            throw `failed to download minikube version ${version}: ${error}`;
        }
        fs.chmodSync(downloadPath, '755');
        return yield tc.cacheFile(downloadPath, 'minikube', 'minikube', version);
    });
}
function getFileName() {
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
function getDownloadUrl(version, filename) {
    return `https://github.com/kubernetes/minikube/releases/download/${version}/${filename}`;
}
