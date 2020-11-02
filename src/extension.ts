import * as vscode from 'vscode';
import * as fs from 'fs';
import { TerraformCompletionProvider } from "./TerraformCompletionProvider";
import { TerraformDefinitionProvider } from "./TerraformDefinitionProvider";
import { TerraformHoverProvider } from "./TerraformHoverProvider";
import { TerraformApi } from "./TerraformApi";

const TF_MODE: vscode.DocumentFilter = { language: 'terraform', scheme: 'file' };
export var tfAutoCompleterContext;

export function activate(context: vscode.ExtensionContext) {
    console.log(context.globalStoragePath)
    console.log(vscode.extensions.getExtension('mgtrrz.terraform-completer').packageJSON.version)
    tfAutoCompleterContext = context;
    if (!fs.existsSync(context.globalStoragePath)){
        console.log("Creating extension directory")
        fs.mkdirSync(context.globalStoragePath);
    }

    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(TF_MODE, new TerraformCompletionProvider(), '.'));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(TF_MODE, new TerraformDefinitionProvider()));
    context.subscriptions.push(vscode.languages.registerHoverProvider(TF_MODE, new TerraformHoverProvider()));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(TF_MODE, {

		async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
            console.log("provideCompletionItems in extension.ts called!");
            let compProvider = new TerraformCompletionProvider();
            let moduleData = compProvider.getModuleSourceAndVersion(position, document);
            console.log(moduleData);
            
            if (moduleData.source) {
                console.log("Got moduleData source.. building required inputs")

                let tfApi = new TerraformApi();
                let data = await tfApi.makeModuleRequest(moduleData.source, moduleData.version);
                
                let requiredInputString = "";
                var tabstop = 1;
                console.log("EXPORTING INPUTS")
                console.log(data.root.inputs)
                for (let input of data.root.inputs) {
                    if (input.required) {
                        console.log("Found required input: " + input.name)
                        console.log(input)
                        requiredInputString += input.name + ' = "${'+ tabstop.toString() +'}"\n'
                        tabstop += 1
                    }
                }

                const snippetCompletion = new vscode.CompletionItem('Autofill required inputs');
                snippetCompletion.insertText = new vscode.SnippetString(requiredInputString);
                snippetCompletion.documentation = new vscode.MarkdownString("Automatically fills in required inputs for the module.");

                return [
                    snippetCompletion,
                ];
            } 
            return [];
		}
    }));
}
