import * as vs from 'vscode';
import { logToOutputChannel } from "./logger";
import { IFormatOptions } from './interfaces/IFormatOptions';

// this regex had to get a lot more complicated; it now requires the line it matches to end in a semicolon,
// includes aliased usings and excludes things like comments that contain the word `using` and the using syntax for 
// disposables (both with and without parens - really unfortunate overloading of the using keyword there C#...)
export const USING_REGEX = /^(?:(?:[\n]|[\r\n])*(?:#(?:if|else|elif|endif).*(?:[\n]|[\r\n])*|\/\/.*(?:[\n]|[\r\n])*|using\s+(?!.*\s+=\s+)(?:\[.*?\]|\w+(?:\.\w+)*);|using\s+\w+\s*=\s*[\w.]+;)(?:[\n]|[\r\n])*)+/gm;
// /^(?:(?:#(?:if|else|elif|endif).*[\n]*|using\s+(?!.*\s+=\s+)(?:\[.*?\]|\w+(?:\.\w+)*);[\r\n]*)+)+/gm; 
// /^(?:(?!\/\/)(?!.*\/\*.*\*\/)(?:#(?:if|else|elif|endif)\s+[^\n]*\n|using\s+(?!(?:\w+\s+)+\w+\s*=\s*)(?:\[.\w+\]|(?:\w+\s*=\s*)?\w+(?:\.\w+)*);[\s\r\n]+))+/gm;

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

    content = replaceCode(content, rawBlock =>
    {
        // remove leading and trailing whitespace
        const lines = rawBlock.split(endOfline).map(l => l?.trim() ?? '');

        const firstUsing = lines[0];
        const firstUsingLineNumInFile = content.split(endOfline).findIndex(line => line.trim() === firstUsing);
        const firstUsingIndexInContent = content.substring(0, content.indexOf(firstUsing)).split(endOfline).length - 1;

        var usings = lines;

        if (options.removeUnnecessaryUsings)
        {
            removeUnnecessaryUsings(diagnostics, usings, firstUsingLineNumInFile, options.processUsingsInPreprocessorDirectives);
        }

        usings = usings.filter(using => using.length > 0);

        // sort and split
        if (usings.length > 0)
        {
            var directives = findPreprocessorRanges(usings);
            if (!directives || directives.length == 0)
            {
                sortUsings(usings, options);
            }
            else if (directives && directives.length > 0)
            {
                // Extract directive blocks and non-directive usings
                const { directiveBlocks, remainingUsings } = separateDirectivesFromUsings(usings);

                // Sort the remaining usings
                sortUsings(remainingUsings, options);

                // Recombine the sorted usings and directive blocks
                const sortedUsings = [
                    ...remainingUsings,
                    // ...Array(options.numEmptyLinesAfterUsings).fill(endOfline),
                    ...directiveBlocks.flatMap(block => [
                        ...block,
                        ...Array(options.numEmptyLinesAfterUsings).fill('')
                    ])
                ];

                // Remove any trailing empty lines to ensure a clean output
                while (sortedUsings.length > 0 && sortedUsings[sortedUsings.length - 1] === "") {
                    sortedUsings.pop();
                }

                usings = sortedUsings;
            }            

            if (options.splitGroups)
            {
                splitGroups(usings);
            }

            function separateDirectivesFromUsings(usings: string[]): { directiveBlocks: string[][], remainingUsings: string[] } {
                const directiveBlocks: string[][] = [];
                const remainingUsings: string[] = [];
                let currentDirectiveBlock: string[] | null = null;
            
                usings.forEach(using => {
                    // Check if the line starts with a preprocessor directive
                    if (/^\s*#(if|endif|region|endregion|define|undef|pragma|error|warning|line|nullable)\b/.test(using)) {
                        // If we're in a directive block, add to it
                        if (currentDirectiveBlock) {
                            currentDirectiveBlock.push(using);
                        } else {
                            // Start a new directive block
                            currentDirectiveBlock = [using];
                        }
            
                        // If it's an ending directive (#endif or #endregion), finalize the block
                        if (/^\s*#(endif|endregion)\b/.test(using) && currentDirectiveBlock) {
                            directiveBlocks.push(currentDirectiveBlock);
                            currentDirectiveBlock = null;
                        }
                    } else {
                        // If we're currently in a directive block, add the line to it
                        if (currentDirectiveBlock) {
                            currentDirectiveBlock.push(using);
                        } else {
                            // Otherwise, treat it as a normal using statement
                            remainingUsings.push(using);
                        }
                    }
                });
            
                // Handle any unterminated directive block (optional, based on how strict you want to be)
                if (currentDirectiveBlock) {
                    directiveBlocks.push(currentDirectiveBlock);
                }
            
                return { directiveBlocks, remainingUsings };
            }
                   
        }

        // if there are characters, like comments, before usings
        if (content.substring(0, firstUsingIndexInContent).search(/./) >= 0)
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

export function removeUnnecessaryUsings(diagnostics: vs.Diagnostic[], usings: string[], offsetFromFileStart: number, processUsingsInPreprocessorDirectives: boolean = false) 
{
    var unnecessaryUsingIndexes = new Set(
        diagnostics.filter(diagnostic => isOmniSharpUnnecessaryUsing(diagnostic) || isRoslynUnnecessaryUsing(diagnostic))
            .flatMap(diagnostic => getLineNumbersFromDiagnostic(diagnostic)));

    if (unnecessaryUsingIndexes.size === 0)
    {
        return;
    }

    if (!processUsingsInPreprocessorDirectives)
    {
        var preprocessorRanges = findPreprocessorRanges(usings);
        // if we aren't supposed to process usings within preprocessor directives, remove those 
        // from the list of unnecessaryUsingIndexes.
        unnecessaryUsingIndexes = 
            new Set(Array.from(unnecessaryUsingIndexes).filter((index) => !indexIsContainedByPreprocessorDirective(index, preprocessorRanges)));
    }

    // Filter out the unnecessary usings by their index
    const filteredUsings = usings.filter((_, index) => !unnecessaryUsingIndexes.has(index));
    
    // Update the original 'usings' array
    usings.length = 0;
    usings.push(...filteredUsings);

    function getLineNumbersFromDiagnostic(diagnostic: vs.Diagnostic): number[] 
    {
        const { start, end } = diagnostic.range;
        const result: number[] = [];
        if (diagnostic.range.start.line !== diagnostic.range.end.line)
        {
            for (let i = start.line; i <= end.line; i++)
            {
                result.push(i - offsetFromFileStart);
            }
            return result;
        }

        return [diagnostic.range.start.line - offsetFromFileStart];
    }

    function indexIsContainedByPreprocessorDirective(index: number, ranges: Array<vs.Range>): boolean {
        var result = false;

        for (const range of ranges) {
            if (index >= range.start.line && index <= range.end.line) {
                result = true;
                break; 
            }
        }

        return result;
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

function findPreprocessorRanges(usings: string[]): Array<vs.Range> {
    const result: vs.Range[] = [];
    const stack: { directive: string; lineIndex: number }[] = [];

    // Iterate through the `usings` array to identify directive ranges
    for (let lineIndex = 0; lineIndex < usings.length; lineIndex++) {
        const line = usings[lineIndex].trim();

        // Match any directive that starts with # (e.g., #if, #region, etc.)
        const match = line.match(/^#(if|endif|region|endregion)\b/);
        if (match) {
            const directive = match[1];

            if (directive === 'if' || directive === 'region') {
                // Push the directive and its line index onto the stack
                stack.push({ directive, lineIndex });
            } else if ((directive === 'endif' || directive === 'endregion') && stack.length > 0) {
                // Pop the last directive from the stack if it matches the closing directive
                const lastDirective = stack.pop();
                if (
                    (directive === 'endif' && lastDirective?.directive === 'if') ||
                    (directive === 'endregion' && lastDirective?.directive === 'region')
                ) {
                    // Create a Range for the matching directive pair
                    const startPosition = new vs.Position(lastDirective.lineIndex, 0);
                    const endPosition = new vs.Position(lineIndex, 0);
                    result.push(new vs.Range(startPosition, endPosition));
                } else {
                    // Handle unmatched directives (optional logging or error handling)
                    console.warn(`Unmatched directive: ${directive} at line ${lineIndex}`);
                }
            }
        }
    }

    // Handle any remaining unmatched directives in the stack (optional)
    if (stack.length > 0) {
        console.warn('Unmatched preprocessor directives detected:', stack);
    }

    return result;
}

function isRoslynUnnecessaryUsing(diagnostic: vs.Diagnostic): unknown 
{
    return typeof diagnostic.code === 'object'
        && diagnostic.code !== null
        && 'value' in diagnostic.code
        && (diagnostic.code?.value === 'IDE0005' || diagnostic.code?.value === 'CS8019');
}

function isOmniSharpUnnecessaryUsing(diagnostic: vs.Diagnostic): unknown 
{
    return diagnostic.source === 'csharp' && diagnostic.code?.toString() === 'CS8019';
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

function getDefaultFormatOptions(): IFormatOptions
{
    const cfg = vs.workspace.getConfiguration('csharpOrganizeUsings');

    return {
        sortOrder: cfg.get<string>('sortOrder', 'System'),
        splitGroups: cfg.get<boolean>('splitGroups', true),
        removeUnnecessaryUsings: cfg.get<boolean>('removeUnnecessaryUsings', true),
        numEmptyLinesAfterUsings: cfg.get<number>('numEmptyLinesAfterUsings', 1),
        numEmptyLinesBeforeUsings: cfg.get<number>('numEmptyLinesBeforeUsings', 1),
        processUsingsInPreprocessorDirectives: cfg.get<boolean>('processUsingsInPreprocessorDirectives', false),
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
