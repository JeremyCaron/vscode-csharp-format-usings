# C# Organize Usings for Visual Studio Code

This extension helps organize C# `using` statements and is meant to replicate the sorting and cleanup behavior you may be familiar with from Visual Studio. It is an actively-supported, forked version of the abandoned [CSharpFormatUsings](https://marketplace.visualstudio.com/items?itemName=gaoshan0621.csharp-format-usings) extension, featuring bug fixes and new functionality. It works with either OmniSharp or Roslyn as the backend for the C# extension.

## Features

- Removes unnecessary `using` directives (enabled by default but can be disabled) and duplicates.
- Sorts `using` directives in alphabetical order and into groups by the first level of the namespace.
- Can be triggered on save, via the right-click menu in the editor, or with the `Organize C# Usings` command in the Command Palette (can also be setup as a keyboard shortcut).
- Inserts a configurable number of empty lines between sets of sorted using statements.
- Offers multiple configurable settings for formatting the `using` section (see "Extension Settings" below).

## Version History

- **1.0.5**: Adds support for running natively on save, improved handling of duplicate removal during cleanup, an output panel channel for debug output, and various improvements in source code.
- **1.0.4**: Handles IDE0005 diagnostics for unused usings from Roslyn, enabling compatibility with the C# extension when OmniSharp is disabled.
- **1.0.3**: Properly handles aliased `using` directives without breaking syntax such as `using [type] [variableName] = whatever`. Adds basic unit test coverage.
- **1.0.2**: Fixes editor jumpiness based on [Microsoft's recommendation](https://github.com/microsoft/vscode/issues/32058#issuecomment-322162175) to use `TextEditorEdit.delete/insert` instead of `repace`.
- **1.0.1**: Fixed editor jumpiness when running "Organize Usings" on files that require no changes.
- **1.0.0**: Correctly removes unused usings when **all** of a class's usings are unnecessary, and resolves issues caused by extra blank lines between namespace groups.

## Extension Settings

- `sortOrder`: Sets the order of namespaces. Values should be space-separated. "System" by default.
- `splitGroups`: Inserts a blank line between using blocks grouped by the first part of the namespace. Enabled by default.
- `removeUnnecessaryUsings`: Removes unnecessary `using` statements if true. Enabled by default.
- `numEmptyLinesAfterUsings`: The number of empty lines preserved between the `using` directives and the code block.
- `numEmptyLinesBeforeUsings`: The maximum number of empty lines before the `using` directives if there are characters (like comments) before them.

## Execution "On Save"

To auto-organize on saving a C# file, add the following to your `settings.json` file:

`"[csharp]": {
    "editor.codeActionsOnSave": [
        "source.organizeImports"
    ]
}`

## Installation from Sources

1. Install node.js.
2. Run `npm install` from project folder.
3. Run `vsce package` from project folder. Please make sure `vsce` is installed: `npm install -g vsce`.
4. Install brand new packed *.vsix bundle through vscode plugins menu option "Install from VSIX".

## History

Forked from [CSharpFormatUsings](https://marketplace.visualstudio.com/items?itemName=gaoshan0621.csharp-format-usings) (an abandoned extension that was last modified on Aug 22, 2020) in 2024, which was forked from [CSharpSortUsings](https://marketplace.visualstudio.com/items?itemName=jongrant.csharpsortusings), which was forked from [CSharpFixFormat](https://github.com/umutozel/vscode-csharpfixformat).
