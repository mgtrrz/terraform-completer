import * as vscode from 'vscode';
import * as fs from 'fs';
import { TerraformCompletionProvider } from "./TerraformCompletionProvider";
import { TerraformDefinitionProvider } from "./TerraformDefinitionProvider";
import { TerraformApi } from "./TerraformApi";

const TF_MODE: vscode.DocumentFilter = { language: 'terraform', scheme: 'file' };
export var tfAutoCompleterContext;

export function activate(context: vscode.ExtensionContext) {
    console.log(context.globalStorageUri.path)
    console.log(vscode.extensions.getExtension('mgtrrz.terraform-completer').packageJSON.version)
    tfAutoCompleterContext = context;
    if (!fs.existsSync(context.globalStorageUri.path)){
        console.log("Creating extension directory")
        fs.mkdirSync(context.globalStorageUri.path);
    }

    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(TF_MODE, new TerraformCompletionProvider(), '.'));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(TF_MODE, new TerraformDefinitionProvider()));

    var tfapi = new TerraformApi();
    //tfapi.makeModuleRequest("app.terraform.io/wave/rds-mysql/aws", "2.3.0")
    var mything = tfapi.makeModuleRequest("terraform-aws-modules/alb/aws", "5.9.0").then(resp => {
        console.log("logging resp") 
        console.log(resp)
    });
}
