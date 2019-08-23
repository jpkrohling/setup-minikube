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
function get(binName, version) {
    return __awaiter(this, void 0, void 0, function* () {
        // tries to get the binary from the cache
        let path = tc.find(binName, version);
        if (!path) {
            // not in the cache, download and put it in the cache
            path = yield acquire(binName, version);
            core.debug(`${binName} is cached under ${path}`);
        }
        core.addPath(path);
    });
}
exports.get = get;
function acquire(binName, version) {
    return __awaiter(this, void 0, void 0, function* () {
        //
        // Download - a tool installer intimately knows how to get the tool (and construct urls)
        //
        let downloadUrl = getDownloadUrl(binName, version);
        let downloadPath = null;
        try {
            downloadPath = yield tc.downloadTool(downloadUrl);
        }
        catch (error) {
            core.debug(error);
            throw `failed to download ${binName} version ${version}: ${error}`;
        }
        fs.chmodSync(downloadPath, '755');
        // copy the resulting file to the local user's cache, which is the expected location by minikube
        let localUserCacheDir = `${os.homedir()}/.minikube/cache/${version}`;
        if (!fs.existsSync(localUserCacheDir)) {
            fs.mkdirSync(localUserCacheDir, { recursive: true });
        }
        fs.copyFileSync(downloadPath, `${localUserCacheDir}/${binName}`);
        return yield tc.cacheFile(downloadPath, binName, binName, version);
    });
}
function getDownloadUrl(binName, version) {
    if (osPlat != "linux") {
        throw `Unsupported platform: ${osPlat}`;
    }
    return `https://storage.googleapis.com/kubernetes-release/release/${version}/bin/${osPlat}/amd64/${binName}`;
}
