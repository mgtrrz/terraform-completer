# Change Log
All notable changes to the "terraform-completer" extension will be documented in this file.

## [0.2.0] - 2022-04-07
### Added
- Now successfully provides autocompletion for modules from other Terraform files (.tf) in the same directory.

## [0.1.1] - 2020-11-08
### Added
- The extension will now autocomplete module names that exist within your document when referencing it as variable.

## [0.1.0] - 2020-11-02
### Changed
- Extension was forked from [erd0s' terraform-autocomplete](https://github.com/erd0s/terraform-autocomplete) 

### Added
- Modules autocomplete inputs when provided a source by querying the module registry API.
- Autocomplete outputs when referencing the module in other parts of code.
- Readme displays on hover over module source.
- Snippet for auto adding required inputs for modules.

### Removed
- Extension no longer provides autocomplete for resources, instead relying on the official Terraform language server in the Terraform [official extension](https://github.com/hashicorp/vscode-terraform)

## [0.0.7] - 2017-11-24
- Updated to the most recent AWS provider docs
- Changed the structure a bit to use json instead of ts for storing definitions

## [0.0.4] - 2017-10-17
- Added "Go to definition functionality for AWS"

## [0.0.1] - 2017-10-11
- Initial release
