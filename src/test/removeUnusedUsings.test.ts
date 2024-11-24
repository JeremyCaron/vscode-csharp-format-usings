import * as assert from 'assert';
import { removeUnncessaryUsings } from '../formatting';
import * as vs from 'vscode'; // Assuming you have vscode as a dev dependency

suite('removeUnnecessaryUsings', () => {
    test('should remove unused usings based on diagnostics', () => {
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
                code: 'IDE0005',
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
                code: 'IDE0005',
                source: 'roslyn',
                message: 'Using directive is unnecessary.',
                severity: vs.DiagnosticSeverity.Warning,
                range: new vs.Range(new vs.Position(8, 0), new vs.Position(8, 1))
            }
        ];

        const expected = [
            '',
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
        removeUnncessaryUsings(diagnostics, input, firstUsingLine);
        assert.deepEqual(input, expected);
    });
});
