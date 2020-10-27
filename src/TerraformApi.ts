import { 
    DefinitionProvider,
    TextDocument,
    Position,
    CancellationToken,
    Definition,
    workspace,
    version,
    extensions
} from "vscode";
import * as _ from "lodash";
import * as open from "open";
import * as request from 'request'; 
import * as fs from 'fs';
var urls = require("../../aws-urls.json");
console.log(urls)

const HOME_DIR = require('os').homedir();
const TOKEN_REGEX = /^\s*token = "([a-zA-Z0-9.]+)"$/;
const REGISTRY_URL = 'https://registry.terraform.io';
const REGISTRY_MODULES_PATH = '/v1/modules/'

export class TerraformApi {
    public apiTokenExists (): boolean {
        console.log(`apiTokenExists called`);
        console.log(workspace.getConfiguration('terraform').get('terraformrc_file_path'));

        const tfrcFile = HOME_DIR + '/.terraformrc';
        console.log(tfrcFile);

        if (fs.existsSync(tfrcFile)) {
            let tfrcContents = fs.readFileSync(tfrcFile, 'utf8');
            for (let line of tfrcContents.split("\n")) {
                if (TOKEN_REGEX.test(line)) {
                    console.log("Successfully found token using regex: ");
                    const token = TOKEN_REGEX.exec(line)[1];
                    console.log(token);
                }
            }
        }

        return false;
    }

    private makeApiGet(url: string, bearer: string = null) {
        console.log(`makeApiGet`)
        var response;

        const thisExtVersion = extensions.getExtension('mgtrrz.terraform-completer').packageJSON.version

        let options = {
            'url': url,
            'headers': {
                'User-Agent': 'Terraform-Completer/v' + thisExtVersion + ' ext VisualStudioCode/' + version
            },
            json: true
        }
        if (bearer) {
            options["auth"] = {'bearer': bearer}
        }
        
        
        return new Promise(function (resolve, reject) {
                request(options, (err, res, body) => {
                if (err) {
                    console.log("Error from server")
                    console.log(err); 
                    reject(err)
                }
                console.log("Got request! Logging body..")
                console.log(body);
                response = body;
                resolve(response)
            });
        });

    }

    public async makeModuleRequest(module: string, version: string = "") {
        console.log("Making request..")
        
        let url = REGISTRY_URL + REGISTRY_MODULES_PATH + module + version
        
        var resp = await this.makeApiGet(url)
        console.log("Did we get a response back?")
        console.log(resp)
        return resp
    }

    public getModuleFromApi() {
        console.log(`getModule called`);

        return new Promise(function (resolve, reject) {
            console.log("Making request..")
            request(url, { json: true }, (err, res, body) => {
                if (err) { reject(console.log(err)); }
                console.log("Got request! Logging body..")
                console.log(body);
                let response = body;

                args = response["root"]["inputs"];
                console.log(args)

                resolve(_.map(args, o => {
                    let c = new CompletionItem(`${o.name} (${module})`, CompletionItemKind.Property);
                    c.kind = CompletionItemKind.Variable;
                    let def = "";
                    if (o.required) {
                        def = "Required - "
                    } else {
                        def = `Optional (Default: ${o.default}) - `
                    }
                    c.detail = def + o.description;
                    c.insertText = o.name;
                    return c;
                }));

            });
        });
    }
}
