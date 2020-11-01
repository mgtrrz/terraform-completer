# Terraform-Completer

This extension provides basic autocomplete for Terraform modules. It is a fork of [erd0s' terraform-autocomplete](https://github.com/erd0s/terraform-autocomplete) extension and updates some of the code to work with Terraform >0.12.

Much like the original Terraform Autocomplete, this extension is **very beta** and may end up becoming obsolete by the time Terraform's official [VS Code extension](https://github.com/hashicorp/vscode-terraform) matures. However, it may help to provide a solution while we wait for better Terraform support in VS Code.

### Companion extensions

Pair this extension with the [official Terraform VS Code extension]((https://github.com/hashicorp/vscode-terraform)) to provide syntax highlighting and some autocomplete for resources.

## Features

The extension for the time being **only works** for modules hosted in the [Terraform registry](https://registry.terraform.io/). There is support for public and private modules by utilizing the APIs provided by Hashicorp. To take advantage of modules hosted in private registries, log in to your account by running `terraform login`. The extension will automatically grab the token saved in the `~/.terraformrc` file and include in the Authorization headers to the registry API (https://registry.terraform.io or https://app.terraform.io/api/registry).
