import { 
    DefinitionProvider,
    TextDocument,
    Position,
    CancellationToken,
    Definition
} from "vscode";
import * as _ from "lodash";

export class TerraformDefinitionProvider implements DefinitionProvider {
    public provideDefinition (document: TextDocument, position: Position, token: CancellationToken): Definition {
        console.log("provideDefinition called")
        var word = document.getWordRangeAtPosition(position);
        var words = document.getText(word);
        return null;
    }
}
