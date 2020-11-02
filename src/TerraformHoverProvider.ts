import { 
    HoverProvider,
    TextDocument,
    Position,
    CancellationToken,
    Hover,
    MarkdownString,
    Range
} from "vscode";
import * as _ from "lodash";
import { TerraformApi } from "./TerraformApi";

const REGISTRY_LINK = "https://registry.terraform.io/modules/"
var sourceRegex = /source\s*=\s*\"([a-zA-Z0-9\/\-_]+)\"/

export class TerraformHoverProvider implements HoverProvider {
    public async provideHover (document: TextDocument, position: Position, token: CancellationToken): Promise<Hover|null> {
        const range = document.getWordRangeAtPosition(position, sourceRegex);
        const word = document.getText(range);
        console.log("provideDefinition called");
        if (range) {
            console.log("Determined source from hovered text");
            let moduleSource = word.match(sourceRegex);
            console.log(moduleSource);
            // Get module name from word
            let tfApi = new TerraformApi();
            let data = await tfApi.makeModuleRequest(moduleSource[1]);
            let registryLink = tfApi.determineRegistryUrlFromSource(moduleSource[1]);
            let header = `## ${data.id}\n`
            header += `Registry: [${registryLink.url}](${registryLink.url})\n`;
            console.log("Returning data for hover");
            console.log(data);
            return new Hover(new MarkdownString(header + data.root.readme.substring(data.root.readme.indexOf("\n") + 1)), range);
        }
        return null
    }
}