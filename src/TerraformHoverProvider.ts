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

var sourceRegex = /source\s*=\s*\"([a-zA-Z0-9\/\-_\.]+)\"/
var moduleInputRegex = /\s*([a-zA-Z0-9\/\-_\.]+)\s*=/
const metaArguments = ["count", "for_each", "providers", "depends_on", "version"]

export class TerraformHoverProvider implements HoverProvider {
    public async provideHover (document: TextDocument, position: Position, token: CancellationToken): Promise<Hover|null> {

        const moduleSourceRange = document.getWordRangeAtPosition(position, sourceRegex)
        if (moduleSourceRange) {
            return this.getModuleReadme(document, moduleSourceRange)
        }

        const moduleInputRange = document.getWordRangeAtPosition(position, moduleInputRegex)
        if (moduleInputRange) {
            return this.getModuleInputData(document, moduleInputRange)
        }

        return null
    }

    async getModuleInputData(document: TextDocument, range: Range): Promise<Hover>  {
        console.log("...getModuleInputData()")
        const word = document.getText(range);
        let moduleInput = word.match(moduleInputRegex)[1]
        let moduleSource = word.match(sourceRegex)[1];
        // Don't do anything with meta arguments for now.
        if (metaArguments.indexOf(moduleInput) > -1) {
            return null
        }

        let tfApi = new TerraformApi();
        let data = await tfApi.makeModuleRequest(moduleSource);

        return new Hover(new MarkdownString("test test"), range);
    }

    async getModuleReadme(document: TextDocument, range: Range): Promise<Hover>  {
        console.log("...getModuleReadme()")

        const word = document.getText(range);
        console.log("provideDefinition called");
        
        console.log("Determined source from hovered text");
        let moduleSource = word.match(sourceRegex)[1];
        // Get module name from word
        let tfApi = new TerraformApi();
        let data = await tfApi.makeModuleRequest(moduleSource);
        let registryLink = tfApi.determineRegistryUrlFromSource(moduleSource);
        let header = `## ${data.id}\n`
        header += `Registry: [${registryLink.url}](${registryLink.url})\n`;
        console.log("Returning data for hover");
        console.log(data);
        return new Hover(new MarkdownString(header + data.root.readme.substring(data.root.readme.indexOf("\n") + 1)), range);

    }
}
