/**
 * @file utils/dom.js
 * @author harttle<yangjun14@baidu.com>
 */

define(function (require) {
    function addClass(el, className) {
        if (!hasClass(el, className)) {
            if (el.className) {
                el.className += ' ';
            }
            el.className += className;
        }
    }
    function hasClass(el, className) {
        return rClassName(className).test(el.className);
    }
    function rClassName(name) {
        return new RegExp('(^|\\s)' + name + '(\\s|$)');
    }
    return {
        addClass: addClass,
        hasClass: hasClass
    };
});
