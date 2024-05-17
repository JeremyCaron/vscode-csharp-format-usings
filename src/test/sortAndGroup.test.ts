import * as assert from 'assert';
import { IFormatOptions, sortUsings, splitGroups } from '../formatting';

suite('Usings Tests', () => {
    const options: IFormatOptions = {
        sortOrder: 'System',
        splitGroups: true,
        removeUnnecessaryUsings: false,
        numEmptyLinesAfterUsings: 0,
        numEmptyLinesBeforeUsings: 0,
    };

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
