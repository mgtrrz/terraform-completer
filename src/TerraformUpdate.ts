import { 
    DefinitionProvider,
    TextDocument,
    Position,
    CancellationToken,
    Definition
} from "vscode";
import * as _ from "lodash";
import * as open from "open";
import * as request from 'request'; 
var urls = require("../../aws-urls.json");
console.log(urls)

export class TerraformUpdater {
    public updateResources () {
        
    }
}