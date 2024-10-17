import * as vscode from "vscode";

export class OrganizeUsingsProvider implements vscode.CodeActionProvider {
    public provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.CodeAction[]> {
        const codeActions: vscode.CodeAction[] = [];

        // Create a code action to organize usings
        const organizeUsingsAction = new vscode.CodeAction(
            "Organize Usings",
            vscode.CodeActionKind.SourceOrganizeImports
        );

        // Attach a command to the action that your extension will implement
        organizeUsingsAction.command = {
            command: "csharpOrganizeUsings.organize",
            title: "Organize Usings",
            tooltip: "Removes unused using statements",
        };

        codeActions.push(organizeUsingsAction);
        return codeActions;
    }
}
