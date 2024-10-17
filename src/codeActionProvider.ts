import * as vscode from "vscode";
import { log } from "./logger"

export class CodeActionProvider implements vscode.CodeActionProvider {
    public provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.CodeAction[]> {
        log('provideCodeActions called for ' + document.uri.fsPath);
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
