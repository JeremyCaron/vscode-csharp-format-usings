# CSharpOrganizeUsings for Visual Studio Code
This extension helps to format C# using statements.
Forked from [CSharpSortUsings](https://marketplace.visualstudio.com/items?itemName=jongrant.csharpsortusings), **with bug fixes and new features**.
## Features
 * Sorts usings in alphabetical order. Doubles will be removed automatically. - *Comes from CSharpSortUsings*
 * Triggered via context menu or "Format Usings" command.
 * **New Features** - Remove unnecessary usings.
 * **New Features** - Allow specify the number of empty lines before using statements, such as between liences, authors info and usings statements.
 * **New Features** - Allow specify the number of empty lines between using statements and code blocks.

## Bug fixes:
* Fix the bug that an extra emtpy line would be inserted after last using statement when sorting in **Windows**.

## Extension Settings
* `sortOrder`: Put namespaces in proper order. Values should be splitted with space. "System" by default.
* `splitGroups`: Insert blank line between using blocks grouped by first part of namespace. True by default.
* `removeUnnecessaryUsings`: Remove unnecessary usings if true. True by default.
* `numEmptyLinesAfterUsings`: The number of empty lines would be preserved between using statements and code block
* `numEmptyLinesBeforeUsings`: The maximum number of empty lines before using statements if there are characters, like comments, before usings.

## Installation of release version
Use instructions from marketplace: [CSharp Format Usings](https://marketplace.visualstudio.com/items?itemName=gaoshan0621.csharp-format-usings)

## Installation from sources
1. Install node.js.
2. Run "npm install" from project folder.
3. Run "npm run package" from project folder. Please make sure `vsce` is installed: `npm install -g vsce`.
4. Install brand new packed *.vsix bundle through vscode plugins menu option "Install from VSIX".
