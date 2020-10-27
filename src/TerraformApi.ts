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
const TOKEN_REGEX = /^\s*token = "([a-zA-Z0-9.]+)"$/

export class TerraformApi {
    public apiTokenExists (): boolean {
        console.log(`apiTokenExists called`);
        console.log(workspace.getConfiguration('terraform').get('terraformrc_file_path'));

        const tfrcFile = HOME_DIR + '/.terraformrc'
        console.log(tfrcFile)

        if (fs.existsSync(tfrcFile)) {
            let tfrcContents = fs.readFileSync(tfrcFile, 'utf8');
            for (let line of tfrcContents.split("\n")) {
                if (TOKEN_REGEX.test(line)) {
                    console.log("Successfully found token using regex: ");
                    const token = TOKEN_REGEX.exec(line)[1];
                    console.log(token)
                }
            }
        }

        return false;
    }
}