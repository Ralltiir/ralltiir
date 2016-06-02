/*
 * superframe ModelView基类
 * 提供视图与数据绑定层
 * create by houyu(houyu01@baidu.com)
 * how to make 模板内部的init
 * 目前约160行~190行
 */
define(
    function () {
        /*
         * @class ViewModel
         * 处理数据绑定、模板渲染等的view-model层
         */
        function ViewModel(options) {
            var self = this;
            self.$options = options;
            self.eventPool = {};
            self.firePool = {};
            if (typeof self.$options.$container === 'string') {
                self.$options.$container = document.querySelector(self.$options.$container);
            }
            // 设置所有的设定属性
            ['$container', 'data', 'irender', 'renderLocal']
            .forEach(function (key) {
                self[key] = self.$options[key];
            });
            // 执行初始化方法
            self.init();
        }
        
        ViewModel.prototype = {

            constructor: ViewModel,

            init: function () {
                this.mount();
            },

            // 文档：生命周期，数据，DOM，事件
            
            // 数据接口的代理
            fetch: function (opt) {
                var self = this;
                var delfaultOpt = {
                    dataType: 'json'
                };
                return $
                .ajax($.extend({}, delfaultOpt, opt))
                // 数据的预处理
                .then(function (response) {
                    // 接受用户的自定义预处理数据
                    var data = opt.dataProccess ? opt.dataProccess(response) : response;
                    // 如果设置为自动设置data的话，自动设置
                    if (!opt.noSetData) {
                        self.setData(data);
                    }
                });
            },
            
            setData: function (newData, param) {
                var self = this;
                param = param || {};
                // 同步数据
                var paths = [];
                _copy(self.data, newData, true, paths);
                // 将同步数据后的结论告知渲染函数
                param.rerender = true;
                param.paths = paths;
                // 重新渲染
                self.mount(param);
                // 调用生命周期-update
                _callHook.call(self, 'update', [self.data]);
            },

            mount: function (param) {
                var self = this;
                // 调用new的时候传入的render钩子
                self.tpl = _callHook.call(self, 'render');
                param = param || {};
                var irender = param.irender || self.irender;
                // 内置的渲染方法
                if (!irender) {
                    self.actualRender(self.$container, self.tpl, param);
                }
                else {
                    // 默认是方法，这里就不判了，省代码
                    irender.call(self, self.data, self.$container);
                }
                // 生命周期-didmount
                _callHook.call(self, 'didmount');
                // 调用view内部脚本的ready方法
            },

            actualRender: function ($container, tpl, param) {
                param = param || {};
                // 将HTML渲染至文档流，目前是纯刷新，之后换成虚DOM
                if (!param.renderLocal) {
                    $container.innerHTML = tpl;
                }
                else {
                    var renderLocal = (param.renderLocal === true ? this.renderLocal : param.renderLocal);
                    // 按照更改数据的节点，局部刷新
                    for (var i = 0, len = param.paths.length; i < len; i++) {
                        var $upDom = null;
                        var localRender = renderLocal['render_' + param.paths[i]];
                        if (localRender
                           && ($upDom = $container.querySelector('[data-vmbind="' + param.paths[i].replace(/_/g, '.') + '"]'))
                        ) {
                            $upDom.innerHTML = localRender.call(this, this.data, $container);
                            _executeScript($upDom);
                        }
                    }
                }

                if (!param.rerender) {
                    _executeScript($container);
                }
            },

            destroy: function () {
                // 清空组件，以后可以更换清除方式
                $container.innerHTML = '';
                // 调用生命周期-destroyed
                _callHook.call(this, 'destroyed', [this.data]);
            },
            
            on: function (ekey, callback, param) {
                var self = this;
                param = param || {};
                if (typeof callback === 'string' && typeof param === 'function') {
                    // 证明是要绑定DOM事件
                    var selector = callback;
                    callback = param;
                    // 代理绑定事件
                    $(self.$container).on(ekey, selector, callback);
                }
                else {
                    // 否则是自定义事件
                    var eventQ = self.eventPool[ekey];
                    if (!eventQ) {
                        eventQ = self.eventPool[ekey] = [];
                    }
                    eventQ.push(callback);
                    // 重现之前的所有触发
                    if (param.listenpre && self.firePool[ekey]) {
                        for (var i in self.firePool[ekey][event]) {
                            callback && callback.call(self, self.firePool[ekey][i]);
                        }
                    }
                }
            },

            trigger: function (ekey, param) {
                var self = this;
                param = param || {};
                if (typeof param === 'string') {
                    var selector = param;
                    $(self.$container).find(selector).trigger(ekey);
                }
                else {
                    var fireQ = self.firePool[ekey];
                    if (!fireQ) {
                        fireQ = self.firePool[ekey] = [];
                    }
                    fireQ.push();
                    if (self.eventPool[ekey]) {
                        for (var i = 0, len = self.eventPool[ekey].length; i < len; i++) {
                            var curCallback = self.eventPool[ekey][i];
                            curCallback && curCallback.call(self, param);
                        }
                    }
                }
            }
        };

        function isPlainObject(obj) {
            return (typeof obj === 'object')
                && !(obj === window)
                && (Object.getPrototypeOf(obj) == Object.prototype);
        }

        function isArray(obj) {
            return obj instanceof Array;
        }
        
        // 对象拷贝函数，可以支持深度拷贝
        function _copy(data, newData, deep, paths, roads) {
            paths = paths || [];
            roads = roads || 'data';
            //ext.path.push(key);
            for (var i in newData) {
                if (deep && (isPlainObject(newData[i]) || isArray(newData[i]))) {
                    if (isPlainObject(newData[i]) && !isPlainObject(data[i])) {
                        data[i] = {};
                    }
                    if (isArray(newData[i]) && !isArray(data[i])) {
                        data[i] = [];
                    }
                    _copy(data[i], newData[i], deep, paths, roads + '_' + i);
                }
                else if (newData[i] !== undefined) {
                    // 如果是覆盖了的话，那么证明这条路径是被改了的
                    if (data[i] !== newData[i]) {
                        paths.push(roads + '_' + i);
                    }
                    data[i] = newData[i];
                }
            }
        }

        // 执行脚本方法
        function _executeScript($container) {
            // 执行其中script标签
            _traverseNode(
                $container,
                function (el) {
                    if (el.nodeName != null
                        && el.nodeName.toUpperCase() === 'SCRIPT'
                        && (!el.type || el.type === 'text/javascript')
                    ) {
                        if (!el.src) {
                            window['eval'].call(window, el.innerHTML);
                        }
                        else {
                            var script = document.createElement('script');
                            script.src = el.src;
                            el.parentNode.insertBefore(script, el);
                            el.parentNode.removeChild(el);
                        }
                    }
                }
            );
        }

        // 递归遍历节点的工具方法
        function _traverseNode(node, fun) {
            fun(node)
            for (var i = 0, len = node.childNodes.length; i < len; i++) {
                _traverseNode(node.childNodes[i], fun);
            }
        }
        
        // 钩子函数，执行vm钩子时候使用
        function _callHook(hook, param) {
            var handlers = this[hook] || this.$options[hook];
            if (handlers) {
                return handlers.apply(this, param);
            }
            return false;
        }

        return ViewModel;
    }
);
