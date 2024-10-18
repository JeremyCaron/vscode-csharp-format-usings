import * as vs from 'vscode';
import { logToOutputChannel } from "./logger";
import { IFormatOptions } from './interfaces/IFormatOptions';

// this regex had to get a lot more complicated; it now requires the line it matches to end in a semicolon,
// includes aliased usings and excludes things like comments that contain the word `using` and the using syntax for 
// disposables (both with and without parens - really unfortunate overloading of the using keyword there C#...)
export const USING_REGEX = /^(?!\/\/)(?!.*\/\*.*\*\/)\s*(using\s+(?!(\w+\s+)+\w+\s*=\s*)(\[.\w+\]|(\w+\s*=\s*)?\w+(\.\w+)*);\s*)+/gm;

export async function organizeUsingsInEditor(editor: vs.TextEditor, edit: vs.TextEditorEdit) 
{
    logToOutputChannel("`Organize C# Usings` command executed");
    var options = getDefaultFormatOptions();

    try 
    {
        var result = processEditorContent(editor, options);
        if (result) 
        {
            const range = new vs.Range(new vs.Position(0, 0), editor.document.lineAt(editor.document.lineCount - 1).range.end);
            edit.delete(range);
            edit.insert(new vs.Position(0, 0), result);
        }
    }
    catch (ex) 
    {
        let message = 'Unknown Error';
        if (ex instanceof Error) message = ex.message;
        vs.window.showWarningMessage(message);
    }
};

export function removeUnncessaryUsings(diagnostics: vs.Diagnostic[], usings: string[], firstUsingLine: number) 
{
    const unnecessaryUsingIndexs = diagnostics
        .filter(diagnostic =>
            (diagnostic.source === 'csharp' && 'CS8019' === diagnostic.code?.toString()) || // omnisharp style
            (typeof diagnostic.code === 'object' && diagnostic.code !== null && 'value' in diagnostic.code && (diagnostic.code?.value === 'IDE0005' || diagnostic.code?.value === 'CS8019'))) // roslyn style
        .map(diagnostic => diagnostic.range.start.line - firstUsingLine);

    if (unnecessaryUsingIndexs.length === 0) 
    {
        return;
    }

    for (let i = usings.length - 1; i >= 0; i--) 
    {
        if (unnecessaryUsingIndexs.includes(i)) 
        {
            usings.splice(i, 1);
        }
    }
}

export function sortUsings(usings: string[], options: IFormatOptions) 
{
    const trimSemiColon = /^\s+|;\s*$/;
    const aliasRegex = /^\s*using\s+(\w+\s*=\s*)?/;

    const aliases: string[] = [];
    const nonAliases: string[] = [];

    for (const statement of usings) 
    {
        const match = statement.match(aliasRegex);
        if (match && match[1]) 
        {
            aliases.push(statement);
        }
        else
        {
            nonAliases.push(statement);
        }
    }

    function sortUsingsHelper(a: string, b: string)
    {
        let res = 0;

        // because we keep lines with indentation and semicolons.
        a = a.replace(trimSemiColon, '');
        b = b.replace(trimSemiColon, '');

        if (options.sortOrder)
        {
            const ns = options.sortOrder.split(' ');
            res -= getNamespaceOrder(a.substring(6), ns); // skip 6 because "using "
            res += getNamespaceOrder(b.substring(6), ns);
            if (res !== 0)
            {
                return res;
            }
        }

        for (let i = 0; i < a.length; i++)
        {
            const lhs = a[i].toLowerCase();
            const rhs = b[i] ? b[i].toLowerCase() : b[i];
            if (lhs !== rhs)
            {
                res = lhs < rhs ? -1 : 1;
                break;
            }
            if (lhs !== a[i])
                res++;
            if (rhs !== b[i])
                res--;
            if (res !== 0)
                break;
        }

        return res === 0 && b.length > a.length ? -1 : res;
    }

    nonAliases.sort(sortUsingsHelper);
    aliases.sort(sortUsingsHelper);

    usings.length = 0;

    // Push the sorted nonAliases and aliases to the original usings array
    usings.push(...nonAliases, ...aliases);
    removeDuplicates(usings);
}

export function splitGroups(usings: string[]) 
{
    let i = usings.length - 1;
    const baseNS = /\s*using\s+(\w+).*/;
    const aliasNS = /\s*using\s+\w+\s*=/;

    if (usings.length > 1) 
    {
        let lastNS = usings[i--].replace(baseNS, '$1');
        let nextNS: string;

        for (; i >= 0; i--) 
        {
            if (aliasNS.test(usings[i])) 
            {
                continue;
            }

            nextNS = usings[i].replace(baseNS, '$1');
            if (nextNS !== lastNS) 
            {
                lastNS = nextNS;
                usings.splice(i + 1, 0, '');
            }
        }
    }
}

export function removeDuplicates(usings: string[]) 
{
    const uniqueUsings: string[] = [];  
    for (const using of usings)
    {
        if (!uniqueUsings.includes(using)) 
        {
            uniqueUsings.push(using);
        }
    }
    usings.length = 0;
    usings.push(...uniqueUsings);
}

function processEditorContent(editor: vs.TextEditor, options: IFormatOptions): string 
{
    const beforeContent = editor.document.getText();
    const endOfline = editor.document.eol === vs.EndOfLine.LF ? '\n' : '\r\n';    
    const diagnostics = vs.languages.getDiagnostics(editor.document.uri);

    return processSourceCode(beforeContent, endOfline, options, diagnostics);
}

function processSourceCode(sourceCodeText: string, endOfline: string, options: IFormatOptions, diagnostics: vs.Diagnostic[])
{
    var content = sourceCodeText;
    const firstUsing = content.search(/using\s+[.\w]+;/);
    const firstUsingLine = content.substring(0, firstUsing).split(endOfline).length - 1;

    content = replaceCode(content, rawBlock =>
    {
        const lines = rawBlock.split(endOfline).map(l => l?.trim() ?? ''); // remove heading and trailing whitespaces

        var usings = lines; // .filter(l => l.length > 0);

        if (options.removeUnnecessaryUsings)
        {
            removeUnncessaryUsings(diagnostics, usings, firstUsingLine);
        }

        usings = usings.filter(using => using.length > 0);

        if (usings.length > 0)
        {
            sortUsings(usings, options);

            if (options.splitGroups)
            {
                splitGroups(usings);
            }
        }

        // if there are characters, like comments, before usings
        if (content.substring(0, firstUsing).search(/./) >= 0)
        {
            // Keep numEmptyLinesBeforeUsings empty lines before usings if there are in the source
            for (var i = Math.min(options.numEmptyLinesBeforeUsings, lines.length - 1); i >= 0; i--)
            {
                if (lines[i].length === 0)
                {
                    usings.unshift('');
                }
            }
        }

        // if no using left, there is no need to insert extra empty lines
        if (usings.length > 0)
        {
            for (var i = 0; i <= options.numEmptyLinesAfterUsings; i++)
            {
                usings.push('');
            }
        }

        const result = usings.join(endOfline);
        return result;
    });

    // return nothing if the input wasn't changed, no reason to alter the text in the editor (code that calls this is 
    // seemingly smart enough to not wipe the entire contents of the editor window)
    return (content !== sourceCodeText) ? content : "";
}

function replaceCode(source: string, cb: Func<string, string>): string
{
    const flags = USING_REGEX.flags.replace(/[gm]/g, '');
    const regexp = new RegExp(USING_REGEX.source, `gm${flags}`);
    return source.replace(regexp, (s: string, ...args: string[]) =>
    {
        if (s[0] === '"' || s[0] === '\'' || (s[0] === '/' && (s[1] === '/' || s[1] === '*')))
        {
            return s;
        }
        return cb(s, ...args.slice(1));
    });
}

function getDefaultFormatOptions(): IFormatOptions
{
    const cfg = vs.workspace.getConfiguration('csharpOrganizeUsings');

    return {
        sortOrder: cfg.get<string>('sortOrder', 'System'),
        splitGroups: cfg.get<boolean>('splitGroups', true),
        removeUnnecessaryUsings: cfg.get<boolean>('removeUnnecessaryUsings', true),
        numEmptyLinesAfterUsings: cfg.get<number>('numEmptyLinesAfterUsings', 1),
        numEmptyLinesBeforeUsings: cfg.get<number>('numEmptyLinesBeforeUsings', 1),
    };
}

function getNamespaceOrder(ns: string, orderedNames: string[]): number
{
    for (let i = 0; i < orderedNames.length; i++)
    {
        const item = orderedNames[i];
        let nsTest = item.length < ns.length ? ns.substr(0, item.length) : ns;
        if (item === nsTest)
        {
            return orderedNames.length - i;
        }
    }
    return 0;
}

declare type Func<T, S> = (...args: S[]) => T;