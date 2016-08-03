/*
 * @author yangjun14(yangjun14@baidu.com)
 * @file 测试脚本载入器
 */

var tests = [];
var regex = /\/base\/test\//;

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(function(file) {
    if (file !== '/base/test/index.js' && regex.test(file)) {
        var mod = file.replace(/.js$/g, '').replace(/\/base\//, '');
        tests.push(mod);
    }
});

require.config({
    baseUrl: '/base'
});

// Important: 禁用__karma__.loaded()，它会在DOM载入后立即调用 mocha.run()
//     此时esl尚未载入测试脚本。
window.__karma__.loaded = function() {};

console.log('loading tests:', tests);
require(tests, window.__karma__.start);
