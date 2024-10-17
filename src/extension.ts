import * as vs from "vscode";
import { outputChannel, log } from "./logger";
import * as provider from "./provider";
import { OrganizeUsingsProvider } from "./organizeUsingsProvider";

export function activate(context: vs.ExtensionContext): void {
    // Register the CodeActionProvider for C# files
    const organizeUsingsProvider = vs.languages.registerCodeActionsProvider(
        { language: "csharp", scheme: "file" },
        new OrganizeUsingsProvider(),
        {
            providedCodeActionKinds: [vs.CodeActionKind.SourceOrganizeImports],
        }
    );

    var command = vs.commands.registerTextEditorCommand(
        "csharpOrganizeUsings.organize",
        provider.getEdits
    );

    log("Extension activated");

    context.subscriptions.push(command, organizeUsingsProvider, outputChannel);
}
