import { 
    DefinitionProvider,
    TextDocument,
    Position,
    CancellationToken,
    Definition,
    workspace,
} from "vscode";
import * as _ from "lodash";
import * as open from "open";
import * as request from 'request'; 
import * as fs from 'fs';
var urls = require("../../aws-urls.json");
console.log(urls)

const HOME_DIR = require('os').homedir();

export class TerraformApi {
    public apiTokenExists (): boolean {
        console.log(`apiTokenExists called`);
        console.log(workspace.getConfiguration('terraform').get('terraformrc_file_path'));

        const tfrcFile = HOME_DIR +'/.terraformrc'

        console.log(tfrcFile)
        if (fs.existsSync(tfrcFile)) {
            // File exists in path
            console.log("File exists")
            let res = fs.readFileSync(tfrcFile,'utf8');
            console.log(res)
        }


        return false;
    }
}