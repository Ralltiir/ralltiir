#!/usr/bin/env node

/*
 * Usage:
 * node bin/doc.js src/utils/promise.js
 */

var path = require('path');
var fs = require('fs');
var file = process.argv[2];

var src = fs.readFileSync(file, 'utf8');

var moduleName = path.basename(file, '.js');
moduleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1)
console.log('#', moduleName, 'API\n');

/*
 * parsers for each tag
 */
var tagParsers = {
    /*
     * Parse the return descriptor from comment string
     * @param {String} comment The comment string
     * @return {Object} The return descriptor
     * @example
     * {
     *     type: 'Promise',
     *     description: 'A thenable.'
     * }
     */
    'return': function(comment) {
        var match = /^{(\w+)}?\s*((?:.|\n)*)$/.exec(comment);
        if (!match) return {};
        return {
            type: inlineCode(match[1]),
            description: trimComment(match[2]),
        };
    },
    'private': c => true,
    'static': c => true,
    'constructor': c => true,
    /*
     * Parse the param descriptor from comment string
     * @param {String} comment The comment string
     * @return {Object}
     * @example 
     * {
     *     type: 'Function',
     *     name: 'cb',
     *     description: 'The callback to be called'
     * }
     */
    param: function(comment) {
        var match = /{([^}]+)}?\s*(\w+)\s+((?:.|\n)*?)$/.exec(comment);
        if (!match) return {};
        return {
            type: inlineCode(match[1]),
            name: match[2].replace(/\|/g, '&#124;'),
            description: trimComment(match[3]).replace(/\|/g, '&#124;')
        };
    },
    description: function(comment) {
        return trimComment(comment);
    },
    example: function(comment) {
        return fencedCode(trimComment(comment));
    }
};

/*
 * call parse and render GFM
 */
parseBlocks(src)
    .forEach(function(o) {
        if (o.hasOwnProperty('private')) return;

        if (o.hasOwnProperty('static')) {
            console.log(`## ${moduleName}.${o.signature}\n`);
        } else if (o.hasOwnProperty('constructor')) {
            console.log(`## new ${o.signature}\n`);
        } else {
            console.log(`## ${moduleName}#${o.signature}\n`);
        }

        console.log(`${o.description}\n`);
        if (o.params.length) {
            console.log(`**Parameters**\n`);
            console.log('Name | Type | Description');
            console.log('---  | ---  | ---');
            o.params.forEach(function(param) {
                console.log(param.name, '|', param.type, '|', param.description);
            });
        }
        if (o.ret) {
            console.log('**Returns**:', o.ret.type, '\n');
            console.log(`${o.ret.description}\n`);
        }
        if (o.example) {
            console.log('**Example**\n');
            console.log(o.example);
        }
        console.log('\n');
    });

/*
 * Parse the function signature
 * @param {String} code The code block containing the function signature
 * @return {String} The function signature
 * @example 
 * parseSignature('function foo(bar){}');   // returns foo(bar)
 */
function parseSignature(code) {
    // function foo(bar){}
    // foo = function(bar){}
    var functionRegExp = /(?:function\s+(\w+)\s*\(((?:.|\n)*?)\)|(\w+)\s*(?:=|:)\s*function\(((?:.|\n)*?)\))/;
    var match = functionRegExp.exec(code);
    if (!match) return "";

    var name = match[1] || match[3] || '';
    // private
    if(name[0] === '_') return '';

    var params = match[2] || match[4] || '';
    return name.trim() + '(' + params + ')';
}

/*
 * Parse comment blocks from the given source file.
 * @param {String} src A string which contains the source file.
 * @return {Array} An array contains commented code blocks.
 */
function parseBlocks(src) {
    var blocks = [],
        begin, end;
    while ((begin = src.indexOf('/*')) > -1) {
        end = src.indexOf('*/');
        if (end === -1) break;

        var comment = src.slice(begin + 2, end);
        var tags = parseComment(comment);

        src = src.slice(end + 2);
        var until = src.indexOf('/*');
        if(until === -1){
            until = src.length;
        }
        var signature = parseSignature(src.slice(0, until));
        if (signature) {
            tags.signature = signature;
            blocks.push(tags);
        }
    }
    return blocks;
}

/*
 * Parse comment string into a set of tags.
 * @param {String} comment The comment string.
 * @return {Object} The set of tags.
 * @example
 * {
 *     name: 'return',
 *     signature: 'then(cb)',
 *     static: true,
 *     params: [{
 *         type: 'Function',
 *         name: 'cb',
 *         description: 'The callback to be called'
 *     }]
 * }
 */
function parseComment(comment) {
    var match, tags = [{
        name: 'description',
        content: ''
    }];

    while (match = /@(\w+)/.exec(comment)) {
        var before = comment.substr(0, match.index);
        tags[tags.length - 1].content += before;

        tags.push({
            name: match[1],
            content: ''
        });

        comment = comment.substr(match.index + match[0].length);
    }
    tags[tags.length - 1].content += comment;

    var ret = {
        params: []
    };
    tags.forEach(function(tag) {
        if (!tagParsers.hasOwnProperty(tag.name)) {
            console.warn(`[warn] Tag ${tag.name} not recognized`);
            return;
        }
        tag.descriptor = tagParsers[tag.name](trimComment(tag.content));
        if (tag.name === 'param') {
            ret.params.push(tag.descriptor);
        } else {
            ret[tag.name] = tag.descriptor;
        }
    });
    return ret;
}

function inlineCode(code) {
    code = code.replace(/\|/g, '&#124;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    if (code.indexOf('&') > -1) {
        return `<code>${code}</code>`;
    } else {
        return '`' + code + '`';
    }
}

function fencedCode(code) {
    return '```\n' + code + '\n```';
}

/*
 * Trim the comment string, remove trailing blanks, and leading " * "
 * @param {String} comment The comment string to be trimed.
 * @return {String} The result string
 */
function trimComment(comment) {
    return comment
        .split('\n')
        .map(str => str
            .replace(/^\s*\* ?/, '')
            .trimRight())
        .join('\n').trim();
}
