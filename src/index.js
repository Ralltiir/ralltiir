/**
 * @file index.js The AMD entry
 * @author harttle<yangjun14@baidu.com>
 */

define(['./utils/di', './config'], function (DI, config) {
    var di = new DI(config);

    Object.keys(config).forEach(di.resolve, di);
    return di.container;
});
