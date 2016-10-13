#!/usr/bin/env node

var fs = require('fs');
var file = process.argv[2];

var blockRegExp = /\/\*\s*\n((?:.|\n)*?)\n\s*\*\/\s*\n(.*)/g;
var paramRegExp = /@param\s*{(\w+)}?\s*(\w+)?\s*(.*)/g;
var returnRegExp = /@return\s*{(\w+)}?\s*(.*)/;
var exampleRegExp = /@example\s*((?:.|\n)*)$/;
var descriptionRegExp = /^\*((?:.|\n)*?)(?:\*\s*@|$)/;
var nameRegExp = /(?:function\s+(\w+)\s*\(|(\w+)\s*(?:=|:)\s*function)/;
var src = fs.readFileSync(file, 'utf8');

parseBlocks(src)
    .map(function(block) {
        return {
            name: parseName(block.code),
            description: parseDescription(block.comment),
            params: parseParams(block.comment),
            ret: parseReturn(block.comment),
            example: parseExample(block.comment)
        };
    })
    .filter(function(block){
        return block && block.name && block.name[0] != '_';
    })
    .forEach(function(o) {
        console.log(`## ${o.name}\n`);
        console.log(`${o.description}\n`);
        console.log(`**Parameters**:\n`);
        console.log('Name | Type | Description');
        console.log('---  | ---  | ---');
        o.params.forEach(function(param){
            console.log(`${param.name} | ${param.type} | ${param.description}`);
        });
        console.log(`**Return**: ${o.ret.type}\n`);
        console.log(`${o.ret.description}\n`);
    });


/*
 * Parse the function name mark
 * @param {String} comment The comment string
 * @return {String} The function name
 */
function parseName(code) {
    var match = nameRegExp.exec(code);
    if (!match) return "";
    var name = match[1] || match[2] || '';
    return name.trim();
}

/*
 * Parse the return value mark
 * @param {String} comment The comment string
 * @return {Object} The return value descriptiont Object
 */
function parseReturn(comment) {
    var match = returnRegExp.exec(comment);
    if (!match) return {};
    return {
        type: match[1],
        description: match[2],
    };
}

/*
 * Parse the params mark
 * @param {String} comment The comment string
 * @return {Attay} Array of params, each item of which contains a param object.
 */
function parseParams(comment) {
    var params = [], match;
    while (match = paramRegExp.exec(comment)) {
        params.push({
            type: match[1],
            name: match[2],
            description: match[3]
        });
    }
    return params;
}

/*
 * Parse the funciton description 
 * @param {String} comment The comment string
 * @return {String} The description string
 */
function parseDescription(comment) {
    var match = descriptionRegExp.exec(comment);
    if(!match) return '';
    return trimComment(match[1]).trim();
}

/*
 * Parse the example mark
 * @param {String} comment The comment string
 * @return {String} The example code block
 */
function parseExample(comment) {
    var match = exampleRegExp.exec(comment);
    return match ? trimComment(match[1]) : '';
}

/*
 * Parse comment blocks from the given source file.
 * @param {String} src A string which contains the source file.
 * @return {Array} An array contains commented code blocks.
 */
function parseBlocks(src) {
    var blocks = [],
        match;
    while (match = blockRegExp.exec(src)) {
        var comment = match[1],
            code = match[2];
        comment = comment.split('\n').map(x => x.trim()).join('\n');
        code = code.trim();
        blocks.push({
            comment,
            code
        });
    }
    return blocks;
}

/*
 * Trim the comment string, remove trailing blanks, and leading " * "
 * @param {String} comment The comment string to be trimed.
 * @return {String} The result string
 */
function trimComment(comment){
    return comment
        .split('\n')
        .map(str => str.replace(/^\s*\* ?/, '').trimRight())
        .join('\n');
}
