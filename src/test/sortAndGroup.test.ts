import * as assert from 'assert';
import { sortUsings, splitGroups, USING_REGEX } from '../formatting';
import { IFormatOptions } from '../interfaces/IFormatOptions';

suite('Usings Tests', () => 
{
    const options: IFormatOptions =
    {
        sortOrder: 'System',
        splitGroups: true,
        removeUnnecessaryUsings: false,
        numEmptyLinesAfterUsings: 0,
        numEmptyLinesBeforeUsings: 0,
    };

    test('regex captures lines it should and excludes those it should not', () => 
    {
        const input = [
            'using System;',
            '// blah blah blah using this other thing...',
            'using ILogger = Serilog.ILogger;',
            'using (Foo xyz = new())',
            'using Foo xyz = new();',
        ];

        const expected = [
            'using System;',
            'using ILogger = Serilog.ILogger;',
        ];

        var results = input.filter(line => USING_REGEX.test(line));
        assert.deepEqual(results, expected);
    });

    test('sortUsings should correctly sort using statements', () =>
    {
        const input = [
            'using System;',
            'using AwesomeCompany.Common.Authorization.Enums;',
            'using Foo = Serilog.Foo;',
            'using AwesomeCompany.Common.Comparison;',
            'using ILogger = Serilog.ILogger;',
            'using Microsoft.AspNetCore.Mvc;',
        ];

        const expected = [
            'using System;',
            'using AwesomeCompany.Common.Authorization.Enums;',
            'using AwesomeCompany.Common.Comparison;',
            'using Microsoft.AspNetCore.Mvc;',
            'using Foo = Serilog.Foo;',
            'using ILogger = Serilog.ILogger;',
        ];

        sortUsings(input, options);
        assert.deepEqual(input, expected);
    });

    test('sortUsings should remove duplicates', () =>
    {
        const input = [
            'using System;',
            'using AwesomeCompany.Common.Authorization.Enums;',
            'using Foo = Serilog.Foo;',
            'using AwesomeCompany.Common.Comparison;',
            'using ILogger = Serilog.ILogger;',
            'using Microsoft.AspNetCore.Mvc;',
            'using ILogger = Serilog.ILogger;',
            'using AwesomeCompany.Common.Authorization.Enums;',
            'using System;',
        ];

        const expected = [
            'using System;',
            'using AwesomeCompany.Common.Authorization.Enums;',
            'using AwesomeCompany.Common.Comparison;',
            'using Microsoft.AspNetCore.Mvc;',
            'using Foo = Serilog.Foo;',
            'using ILogger = Serilog.ILogger;',
        ];

        sortUsings(input, options);
        assert.deepEqual(input, expected);
    });

    test('splitGroups should correctly group using statements', () =>
    {        
        const input = [
            'using System;',
            'using AwesomeCompany.Common.Authorization.Enums;',
            'using AwesomeCompany.Common.Comparison;',
            'using AwesomeCompany.Common.Constants;',
            'using AwesomeCompany.Common.Database.Services;',
            'using AwesomeCompany.Users.ServiceClient;',
            'using AwesomeCompany.Venture.Contracts.RequestModels;',
            'using AwesomeCompany.Venture.Contracts.ResponseModels;',
            'using AwesomeCompany.Venture.Contracts.ResponseModels.Teasers;',
            'using AutoMapper;',
            'using Microsoft.AspNetCore.Authorization;',
            'using Microsoft.AspNetCore.Mvc;',
            'using Foo = Serilog.Foo;',
            'using ILogger = Serilog.ILogger;'
        ];

        const expected = [
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

        splitGroups(input);
        assert.deepEqual(input, expected);
    });

    test('sortUsings should handle empty input', () => 
    {
        const input: string[] = [];
        sortUsings(input, options);
        assert.deepEqual(input, []);
    });

    test('sortUsings should handle single using statement', () => 
    {
        const input = ['using System;'];
        sortUsings(input, options);
        assert.deepEqual(input, ['using System;']);
    });

    test('sortUsings should handle duplicate using statements', () =>
    {        
        const input = [
            'using System;',
            'using AwesomeCompany.Common.Authorization.Enums;',
            'using System;',
            'using AwesomeCompany.Common.Comparison;',
        ];

        const expected = [
            'using System;',
            'using AwesomeCompany.Common.Authorization.Enums;',
            'using AwesomeCompany.Common.Comparison;',
        ];

        sortUsings(input, options);
        assert.deepEqual(input, expected);
    });

    test('splitGroups should handle empty input', () => 
    {
        const input: string[] = [];
        splitGroups(input);
        assert.deepEqual(input, []);
    });

    test('splitGroups should handle single using statement', () => 
    {
        const input = ['using System;'];
        splitGroups(input);
        assert.deepEqual(input, ['using System;']);
    });

    test('splitGroups should handle no groups', () => 
    {
        const input = [
            'using Foo;',
            'using Bar;',
            'using Baz;',
        ];

        splitGroups(input);

        assert.deepEqual(input, [
            'using Foo;',
            '',
            'using Bar;',
            '',
            'using Baz;',
        ]);
    });

    test('splitGroups should handle multiple groups', () =>
    {
        const input = [
            'using System;',
            'using AwesomeCompany.Common.Authorization.Enums;',
            'using AwesomeCompany.Common.Comparison;',
            'using AwesomeCompany.Common.Constants;',
            'using AutoMapper;',
            'using Microsoft.AspNetCore.Authorization;',
            'using Microsoft.AspNetCore.Mvc;',
            'using Foo = Serilog.Foo;',
            'using ILogger = Serilog.ILogger;',
            'using AwesomeCompany.Venture.Contracts.RequestModels;',
            'using AwesomeCompany.Venture.Contracts.ResponseModels;',
            'using AwesomeCompany.Venture.Contracts.ResponseModels.Teasers;',
        ];

        const expected = [
            'using System;',
            '',
            'using AutoMapper;',
            '',
            'using AwesomeCompany.Common.Authorization.Enums;',
            'using AwesomeCompany.Common.Comparison;',
            'using AwesomeCompany.Common.Constants;',
            'using AwesomeCompany.Venture.Contracts.RequestModels;',
            'using AwesomeCompany.Venture.Contracts.ResponseModels;',
            'using AwesomeCompany.Venture.Contracts.ResponseModels.Teasers;',
            '',
            'using Microsoft.AspNetCore.Authorization;',
            'using Microsoft.AspNetCore.Mvc;',
            '',
            'using Foo = Serilog.Foo;',
            'using ILogger = Serilog.ILogger;',
        ];

        sortUsings(input, options);
        splitGroups(input);
        assert.deepEqual(input, expected);
    });
});
