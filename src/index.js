/**
 * @file index.js The AMD entry
 * @author harttle<harttle@harttle.com>
 */

define(['./utils/di', './config'], function (DI, config) {
    var di = new DI(config);

    Object.keys(config).forEach(di.resolve, di);
    return di.container;
});
