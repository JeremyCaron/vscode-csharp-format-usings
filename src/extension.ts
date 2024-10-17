import * as vs from "vscode";
import { outputChannel, log } from "./logger";
import * as formatting from "./formatting";
import { CodeActionProvider } from "./codeActionProvider";

export function activate(context: vs.ExtensionContext): void {
    // Register the CodeActionProvider for C# files
    const codeActionProvider = vs.languages.registerCodeActionsProvider(
        { language: "csharp", scheme: "file" },
        new CodeActionProvider(),
        {
            providedCodeActionKinds: [vs.CodeActionKind.SourceOrganizeImports],
        }
    );

    var command = vs.commands.registerTextEditorCommand(
        "csharpOrganizeUsings.organize",
        formatting.getEdits
    );

    log("Extension activated");

    context.subscriptions.push(command, codeActionProvider, outputChannel);
}
