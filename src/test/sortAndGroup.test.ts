import * as assert from 'assert';
import { IFormatOptions, sortUsings, splitGroups, USING_REGEX } from '../formatting';

suite('Usings Tests', () => {
    const options: IFormatOptions = {
        sortOrder: 'System',
        splitGroups: true,
        removeUnnecessaryUsings: false,
        numEmptyLinesAfterUsings: 0,
        numEmptyLinesBeforeUsings: 0,
    };

    test('regex captures lines it should and excludes those it should not', () => {
        const input = [
            'using System;',
            '// jlkjasfkljsakljsaf blah blah blah using this other thing...',
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

    test('sortUsings should correctly sort using statements', () => {
        const input = [
            'using System;',
            'using Allocate.Common.Authorization.Enums;',
            'using Foo = Serilog.Foo;',
            'using Allocate.Common.Comparison;',
            'using ILogger = Serilog.ILogger;',
            'using Microsoft.AspNetCore.Mvc;',
        ];
        const expected = [
            'using System;',
            'using Allocate.Common.Authorization.Enums;',
            'using Allocate.Common.Comparison;',
            'using Microsoft.AspNetCore.Mvc;',
            'using Foo = Serilog.Foo;',
            'using ILogger = Serilog.ILogger;',
        ];
        sortUsings(input, options);
        assert.deepEqual(input, expected);
    });

    test('splitGroups should correctly group using statements', () => {
        const input = [
            'using System;',
            'using Allocate.Common.Authorization.Enums;',
            'using Allocate.Common.Comparison;',
            'using Allocate.Common.Constants;',
            'using Allocate.Common.Database.Services;',
            'using Allocate.Users.ServiceClient;',
            'using Allocate.Venture.Contracts.RequestModels;',
            'using Allocate.Venture.Contracts.ResponseModels;',
            'using Allocate.Venture.Contracts.ResponseModels.Teasers;',
            'using AutoMapper;',
            'using Microsoft.AspNetCore.Authorization;',
            'using Microsoft.AspNetCore.Mvc;',
            'using Foo = Serilog.Foo;',
            'using ILogger = Serilog.ILogger;'
        ];
        const expected = [
            'using System;',
            '',
            'using Allocate.Common.Authorization.Enums;',
            'using Allocate.Common.Comparison;',
            'using Allocate.Common.Constants;',
            'using Allocate.Common.Database.Services;',
            'using Allocate.Users.ServiceClient;',
            'using Allocate.Venture.Contracts.RequestModels;',
            'using Allocate.Venture.Contracts.ResponseModels;',
            'using Allocate.Venture.Contracts.ResponseModels.Teasers;',
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
});
