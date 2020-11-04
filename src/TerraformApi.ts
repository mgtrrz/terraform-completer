import * as vscode from "vscode";
import * as _ from "lodash";
import Axios, * as ax from 'axios';
import * as fs from 'fs';
import { tfAutoCompleterContext } from "./extension";
import { fail } from "assert";

const HOME_DIR:string = require('os').homedir();
const TOKEN_REGEX = /^\s*token = "([a-zA-Z0-9.]+)"$/;

const REGISTRY_MODULES_PATH = '/v1/modules/'

// private source looks like: app.terraform.io/<org>/<mod-name>/<provider>
// private registry links: app.terraform.io/app/<org>/modules/view/<mod-name>/<provider>
const PRIVATE_REGISTRY_DOM = 'app.terraform.io'
const PRIVATE_REGISTRY_API = `https://${PRIVATE_REGISTRY_DOM}/api/registry`;
const PRIVATE_REGISTRY_URL = `https://${PRIVATE_REGISTRY_DOM}/app/`
const PRIVATE_REGISTRY_MOD_PATH = "/modules/view/"


const REGISTRY_LINK = "https://registry.terraform.io/modules/"
const REGISTRY_URL = 'https://registry.terraform.io';


export class TerraformApi {

    private defaultTerraformRcLocations = [
        {
            path: HOME_DIR + '/.terraformrc',
            type: "plaintext"
        },
        {
            path: HOME_DIR + '/.terraform.d/credentials.tfrc.json',
            type: "json"
        }
    ]

    constructor() {
        // if (vscode.workspace.getConfiguration('terraform').get('terraformrc_file_path')) {
        //     this.defaultTerraformRcLocations.push({
        //         path: vscode.workspace.getConfiguration('terraform').get('terraformrc_file_path')
        //     })
        // }
    }

    public getApiToken (): string {
        console.log(`getApiToken called`);
        console.log(vscode.workspace.getConfiguration('terraform').get('terraformrc_file_path'));

        for (let location of this.defaultTerraformRcLocations) {
            console.log(location)
            console.log(location.path)
        
            if (fs.existsSync(location.path)) {
                let tfrcContents = fs.readFileSync(location.path, 'utf8')

                if (location.type === "plaintext") {
                    for (let line of tfrcContents.split("\n")) {
                        if (TOKEN_REGEX.test(line)) {
                            console.log("Successfully found token using regex");
                            const token = TOKEN_REGEX.exec(line)[1];
                            return token;
                        }
                    }
                } else if (location.type === "json") {
                    let obj = JSON.parse(tfrcContents)
                    if (obj.credentials["app.terraform.io"].token) {
                        console.log("Successfully found token using regex");
                        return obj.credentials["app.terraform.io"].token
                    }
                }
            }
        }

        return "";
    }

    public determineRegistryUrlFromSource(moduleSource: string) {
        var moduleUrls = {
            api: "",
            url: "",
        };
        if (moduleSource.includes(PRIVATE_REGISTRY_DOM)) {
            let modSplit = moduleSource.split("/");
            let org = modSplit[1]
            let modSrc = modSplit[2] + "/" + modSplit[3]

            moduleUrls.api = PRIVATE_REGISTRY_API + REGISTRY_MODULES_PATH + moduleSource.replace(PRIVATE_REGISTRY_DOM + "/", "");
            moduleUrls.url = PRIVATE_REGISTRY_URL + org + PRIVATE_REGISTRY_MOD_PATH + modSrc;
        } else {
            moduleUrls.api = REGISTRY_URL + REGISTRY_MODULES_PATH + moduleSource;
            moduleUrls.url = REGISTRY_LINK + moduleSource;
        }

        return moduleUrls;
    }

    private async makeApiGet(url: string, bearer: string = null) {
        console.log(`makeApiGet`)
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
        var moduleCacheKey = tfAutoCompleterContext.globalStoragePath + "/" + moduleCacheString
        if (this.cacheKeyExists(moduleCacheKey)) {
            // let contents = this.getCachedResponse(moduleCacheKey)
            // console.log(contents)
            return Promise.resolve(this.getCachedResponse(moduleCacheKey));
        }

        console.log("Making request..")
        if (version !== "") {
            version = "/" + version
        }
        let url = this.determineRegistryUrlFromSource(module).api + version
        console.log(url)
        return this.makeApiGet(url, this.getApiToken()).then(resp => {
            console.log("Did we get a response back?")
            console.log(resp);
            // Cache this response
            this.putCachedResponse(moduleCacheKey, resp.data);

            return resp.data;
        }, failure => {
            // Something happened on the original request
            console.log("Made it to failure condition");
            console.log(failure)
            return false;
        });
    }

}
