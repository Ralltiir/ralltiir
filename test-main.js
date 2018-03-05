/**
 * @file testMain 测试脚本载入器
 * @author harttle(harttle@harttle.com)
 */

/* globals mocha: true */

var TEST_FILES = Object.keys(window.__karma__.files).filter(isTestFile);

// 依赖配置
require.config({
    baseUrl: '/base/src',
    paths: {
        test: '/base/test',
        '@searchfe': '/base/amd_modules/@searchfe'
    }
});

// 启动测试
// Important: 禁用__karma__.loaded()，它会在DOM载入后立即调用 mocha.run()
//     此时esl尚未载入测试脚本。
window.__karma__.loaded = function () {};

// 设置DEBUG环境
window.DEBUG || (window.DEBUG = false);
var mods = TEST_FILES.map(getModuleId);
require(mods, function () {
    // eslint-disable-next-line
    console.log(mods.length + ' test modules loaded');
    mocha.allowUncaught = true;
    window.__karma__.start();
    // clear mocha listener, since mocha.allowUncaught() not working
    window.onerror = null;
});

function isTestFile(filepath) {
    return /\/base\/test\//.test(filepath);
}

function getModuleId(filepath) {
    // 0123456
    // /base/test/xx.js => test/xx
    return filepath.slice(6, -3);
}

