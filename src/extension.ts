import * as vscode from 'vscode';
import { TerraformCompletionProvider } from "./TerraformCompletionProvider";
import { TerraformDefinitionProvider } from "./TerraformDefinitionProvider";
import { TerraformApi } from "./TerraformApi";

const TF_MODE: vscode.DocumentFilter = { language: 'terraform', scheme: 'file' };

export function activate(context: vscode.ExtensionContext) {
    console.log()
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(TF_MODE, new TerraformCompletionProvider(), '.'));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(TF_MODE, new TerraformDefinitionProvider()));
    var tfapi = new TerraformApi();
    tfapi.apiTokenExists();
}