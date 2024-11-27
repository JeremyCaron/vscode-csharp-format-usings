import * as assert from 'assert';
import { removeUnnecessaryUsings } from '../formatting';
import * as vs from 'vscode';

suite('removeUnnecessaryUsings', () => {

    test('should remove unused usings based on single-line Diagnostics', () => {
        const input = [
            'using System;',
            '',
            'using AwesomeCompany.Common.Authorization.Enums;',
            'using AwesomeCompany.Common.Comparison;',
            'using AwesomeCompany.Common.Constants;',
            'using AwesomeCompany.Common.Database.Services;',
            'using AwesomeCompany.Users.ServiceClient;',
            'using AwesomeCompany.Venture.Contracts.RequestModels;',
            'using AwesomeCompany.Venture.Contracts.ResponseModels;',
            'using AwesomeCompany.Venture.Contracts.ResponseModels.Teasers;',
            '',
            'using AutoMapper;',
            '',
            'using Microsoft.AspNetCore.Authorization;',
            'using Microsoft.AspNetCore.Mvc;',
            '',
            'using Foo = Serilog.Foo;',
            'using ILogger = Serilog.ILogger;'
        ];

        const diagnostics: vs.Diagnostic[] = [
            {
                code: 'CS8019',
                source: 'csharp',
                message: 'Using directive is unnecessary.',
                severity: vs.DiagnosticSeverity.Warning,
                range: new vs.Range(new vs.Position(0, 0), new vs.Position(0, 1))
            },
            {
                code: {value: 'IDE0005', target: vs.Uri.parse("null")},
                source: 'roslyn',
                message: 'Using directive is unnecessary.',
                severity: vs.DiagnosticSeverity.Warning,
                range: new vs.Range(new vs.Position(4, 0), new vs.Position(4, 1))
            },
            {
                code: 'CS8019',
                source: 'csharp',
                message: 'Using directive is unnecessary.',
                severity: vs.DiagnosticSeverity.Warning,
                range: new vs.Range(new vs.Position(6, 0), new vs.Position(6, 1))
            },
            {
                code: {value: 'CS8019', target: vs.Uri.parse("null")},
                source: 'roslyn',
                message: 'Using directive is unnecessary.',
                severity: vs.DiagnosticSeverity.Warning,
                range: new vs.Range(new vs.Position(8, 0), new vs.Position(8, 1))
            }
        ];

        const expected = [
            '',
            'using AwesomeCompany.Common.Authorization.Enums;',
            'using AwesomeCompany.Common.Comparison;',
            'using AwesomeCompany.Common.Database.Services;',
            'using AwesomeCompany.Venture.Contracts.RequestModels;',
            'using AwesomeCompany.Venture.Contracts.ResponseModels.Teasers;',
            '',
            'using AutoMapper;',
            '',
            'using Microsoft.AspNetCore.Authorization;',
            'using Microsoft.AspNetCore.Mvc;',
            '',
            'using Foo = Serilog.Foo;',
            'using ILogger = Serilog.ILogger;'
        ];

        const firstUsingLine = 0;
        removeUnnecessaryUsings(diagnostics, input, firstUsingLine);
        assert.deepEqual(input, expected);
    });

    test('should remove unused usings on multiple lines from a single Diagnostic range', () => {
        const input = [
            'using System;',
            'using System.Collections;',
            'using System.Buffers;',
            'using System.Runtime.CompilerServices;',
            'using System.CodeDom;',
            '',
            'using Microsoft.CodeAnalysis;'
        ];

        const diagnostics: vs.Diagnostic[] = [
            {
                code: 'CS8019',
                source: 'csharp',
                message: 'Using directive is unnecessary.',
                severity: vs.DiagnosticSeverity.Warning,
                range: new vs.Range(new vs.Position(0, 0), new vs.Position(0, 1))
            },
            {
                code: {value: 'IDE0005', target: vs.Uri.parse("null")},
                source: 'roslyn',
                message: 'Using directive is unnecessary.',
                severity: vs.DiagnosticSeverity.Warning,
                range: new vs.Range(new vs.Position(2, 0), new vs.Position(2, 1))
            },
            {
                code: 'CS8019',
                source: 'csharp',
                message: 'Using directive is unnecessary.',
                severity: vs.DiagnosticSeverity.Warning,
                range: new vs.Range(new vs.Position(4, 0), new vs.Position(6, 1))
            }
        ];

        const expected = [
            'using System.Collections;',
            'using System.Runtime.CompilerServices;'
        ];

        const firstUsingLine = 0;
        removeUnnecessaryUsings(diagnostics, input, firstUsingLine);
        assert.deepEqual(input, expected);
    });
});
