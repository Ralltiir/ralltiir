/*
 * 添加require.config paths项方法
 * 抽取公共方法方便其它模块使用
 * B.amd.addPaths({})
 */
function __getAmdUri(path) {
    return path;
}
var B = window.B || {};
B.amd = {
    // 用于存储已有的组件key
    keys : {},
    
    // 结果页添加paths公共方法
    addPaths : function(opt) {
        // 参数必须为obj, opt={'a/b':'a/b.js','a/c':'a/c.js'}
        if (typeof opt !== "object") {
            return;
        };
        // esl config 支持二级mix,可多处配置
        /*require.config({
            paths: opt
        });*/
        // 存入keys
        B.amd.mix(B.amd.keys, opt);
    },

    // 判断组件key是否存在
    exist : function (key) {
        if (key && typeof B.amd.keys[key] !== 'undefined') {
            return true;
        }
        return false;
    },

    mix: function (src, opt) {
        for (var i in opt) {
            src[i] = opt[i];
        }
    }
};

require
.config({
    baseUrl: './static/js/',
    shim: {
        'sf/route': {
            exports: 'B.route'
        }
    }
});

// ui组件
B.amd.addPaths({
    'app/myActivity': 'app/myActivity.js'
});
