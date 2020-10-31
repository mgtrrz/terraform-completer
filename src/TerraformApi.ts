import * as vscode from "vscode";
import * as _ from "lodash";
import * as open from "open";
import Axios, * as ax from 'axios';
import * as fs from 'fs';
import { tfAutoCompleterContext } from "./extension";
var urls = require("../../aws-urls.json");
console.log(urls)

const HOME_DIR = require('os').homedir();
const TOKEN_REGEX = /^\s*token = "([a-zA-Z0-9.]+)"$/;
const REGISTRY_URL = 'https://registry.terraform.io';
const PRIVATE_REGISTRY_DOM = 'app.terraform.io'
const PRIVATE_REGISTRY_API = 'https://app.terraform.io/api/registry';
const REGISTRY_MODULES_PATH = '/v1/modules/'

export class TerraformApi {
    public apiTokenExists (): string {
        console.log(`apiTokenExists called`);
        console.log(vscode.workspace.getConfiguration('terraform').get('terraformrc_file_path'));

        const tfrcFile = HOME_DIR + '/.terraformrc';
        console.log(tfrcFile);

        if (fs.existsSync(tfrcFile)) {
            let tfrcContents = fs.readFileSync(tfrcFile, 'utf8');
            for (let line of tfrcContents.split("\n")) {
                if (TOKEN_REGEX.test(line)) {
                    console.log("Successfully found token using regex: ");
                    const token = TOKEN_REGEX.exec(line)[1];
                    console.log(token);
                    return token;
                }
            }
        }

        return "";
    }

    private async makeApiGet(url: string, bearer: string = null) {
        console.log(`makeApiGet`)
        var response;

        const thisExtVersion = vscode.extensions.getExtension('mgtrrz.terraform-completer').packageJSON.version

        let options = {
            'headers': {
                'User-Agent': 'Terraform-Completer/v' + thisExtVersion + ' ext VisualStudioCode/' + vscode.version,
            },
            json: true
        }
        if (bearer) {
            options["headers"]["Authorization"] = 'Bearer ' + bearer
        }

        return await Axios.get(url, options);

    }

    private putCachedResponse(key: string, value) {
        console.log(`Writing cache file: ${key}`);
        fs.writeFileSync(key, JSON.stringify(value), 'utf8');
    }

    private getCachedResponse(key: string) {
        if (this.cacheKeyExists(key)) {
            console.log(`Cache file exists! Grabbing contents of ${key}`);
            let contents = fs.readFileSync(key, 'utf8')
            let obj = JSON.parse(contents)
            console.log(obj)
            return obj;
        }
    }

    private cacheKeyExists(key: string) {
        return fs.existsSync(key)
    }

    public makeModuleRequest(module: string, version: string = "") {
        console.log("makeModuleRequest called")
        // Check to see if the cached module exists
        const moduleCacheString = module.replace(/\//g, "-") + "-" + version.replace(/\./g, "-");
        var moduleCacheKey = tfAutoCompleterContext.globalStorageUri.path + "/" + moduleCacheString
        if (this.cacheKeyExists(moduleCacheKey)) {
            // let contents = this.getCachedResponse(moduleCacheKey)
            // console.log(contents)
            return Promise.resolve(this.getCachedResponse(moduleCacheKey));
        }

        console.log("Continuing..")
        if (module.includes(PRIVATE_REGISTRY_DOM)) {
            var base_registry_url = PRIVATE_REGISTRY_API;
            module = module.replace(PRIVATE_REGISTRY_DOM + "/", "");
        } else {
            var base_registry_url = REGISTRY_URL;
        }

        console.log("Making request..")
        if (version !== "") {
            version = "/" + version
        }
        let url = base_registry_url + REGISTRY_MODULES_PATH + module + version
        console.log(url)
        return this.makeApiGet(url, this.apiTokenExists()).then(resp => {
            console.log("Did we get a response back?")
            console.log(resp);
            // Cache this response
            this.putCachedResponse(moduleCacheKey, resp.data);

            return resp.data;
        }, failure => {
            // Something happened on the original request
            return false;
        });
    }

}
