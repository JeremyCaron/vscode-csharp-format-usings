import * as vs from 'vscode';
import * as formatting from './formatting';

const getFormatOptions = (): formatting.IFormatOptions => {
    const cfg = vs.workspace.getConfiguration('csharpOrganizeUsings');

    return {
        sortOrder: cfg.get<string>('sortOrder', 'System Microsoft'),
        splitGroups: cfg.get<boolean>('splitGroups', true),
        removeUnnecessaryUsings: cfg.get<boolean>('removeUnnecessaryUsings', true),
        numEmptyLinesAfterUsings: cfg.get<number>('numEmptyLinesAfterUsings', 1),
        numEmptyLinesBeforeUsings: cfg.get<number>('numEmptyLinesBeforeUsings', 1),
    };
};

export async function getEdits(editor: vs.TextEditor, edit: vs.TextEditorEdit) {
    var options = getFormatOptions();

    try {
        var result = formatting.process(editor, options);
        if (result) {
            const range = new vs.Range(
                new vs.Position(0, 0), editor.document.lineAt(editor.document.lineCount - 1).range.end);
            edit.replace(range, result);
        }
    }
    catch (ex) {
        vs.window.showWarningMessage(ex);
    }
};