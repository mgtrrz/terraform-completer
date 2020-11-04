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
}
