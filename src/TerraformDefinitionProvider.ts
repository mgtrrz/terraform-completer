import { 
    DefinitionProvider,
    TextDocument,
    Position,
    CancellationToken,
    Definition
} from "vscode";
import * as _ from "lodash";
import * as open from "open";
var urls = require("../../aws-urls.json");
console.log(urls)

export class TerraformDefinitionProvider implements DefinitionProvider {
    public provideDefinition (document: TextDocument, position: Position, token: CancellationToken): Definition {
        var word = document.getWordRangeAtPosition(position);
        var words = document.getText(word);
        var found = _.get(urls, words);
        if (found) {
            open(found);
        }
        return null;
    }
}