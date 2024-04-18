# C# Organize Usings for Visual Studio Code

This extension helps organize C# using statements.

Forked from [CSharpFormatUsings](https://marketplace.visualstudio.com/items?itemName=gaoshan0621.csharp-format-usings) (last modified Aug 22, 2020), which was forked from [CSharpSortUsings](https://marketplace.visualstudio.com/items?itemName=jongrant.csharpsortusings).  Updated with bug fixes for 2024.

## Features

* Sorts usings in alphabetical order. Doubles will be removed automatically. - *Comes from CSharpSortUsings*
* Triggered via context menu or "Format Usings" command.
* Remove unnecessary usings.
* Specify the number of empty lines before using statements, such as between licenses, authors info and usings statements.
* Specify the number of empty lines between using statements and code blocks.

## Bug fixes:

* Now correctly removes unused usings when ALL of a classes usings are unnecessary
* Now correctly removes unused usings when there are extra blank lines between namespace groups (this was previously causing the wrong lines to be removed from the source file)

## Extension Settings

* `sortOrder`: Put namespaces in proper order. Values should be splitted with space. "System" by default.
* `splitGroups`: Insert blank line between using blocks grouped by first part of namespace. True by default.
* `removeUnnecessaryUsings`: Remove unnecessary usings if true. True by default.
* `numEmptyLinesAfterUsings`: The number of empty lines would be preserved between using statements and code block
* `numEmptyLinesBeforeUsings`: The maximum number of empty lines before using statements if there are characters, like comments, before usings.

## Installation of release version

Use instructions from marketplace: [CSharp Organize Usings](https://marketplace.visualstudio.com/items?itemName=jeremycaron.csharp-organize-usings)

## Installation from sources

1. Install node.js.
2. Run "npm install" from project folder.
3. Run "npm run package" from project folder. Please make sure `vsce` is installed: `npm install -g vsce`.
4. Install brand new packed *.vsix bundle through vscode plugins menu option "Install from VSIX".
