define(
    'lib/hash_lib',
  function () {
      // requires Zepto
      var B = window.B || (window.B = {});
      var getKeys = Object.getOwnPropertyNames;
      var hash = B.hash = {
        mute: true
      };
      var hashKV = {}; // hash被解析后的KV

      var events = $('<div />');
      // 直接借助zepto的事件机制，把on/off/one"代理"到一个div上
      'on off one'.split(' ').forEach(function(key){
        hash[key] = function(evt, callback){
          events[key](evt, callback);
        };
      });

      function clone(obj){
        return $.extend({}, obj);
      }

      function getHash(){
        // Firefox中直接使用location.hash的返回值会强制进行urldecode，这不是我们所期望的
        // 兼容的办法是从location.href里手工解
        var match = location.href.match(/#(.*)$/);
        var hash = match ? match[0] : '';
        if (hash.indexOf('#%7C') === 0){
            // 百度浏览器在内的部分浏览器会把hash自动进行url-encode
            // %7C就是'|'的url-encode
            hash = decodeURIComponent(hash);
        }
        return hash;
      }

      /**
       * 把符合规范的hash解析成KV对
       * @private
       * @return {Object}
       */
      function parseHash(){
        var str = getHash().replace(/^#*/g, ''); // 先消除所有前置#符号，因为有时候hash会很奇怪的有####这类东西
        var kvArr = str.split(/\|+/);
        var kvObj = {};
        kvArr.forEach(function(equ){
          var match = equ.match(/([^=]+)(?:=(.*))?/); // 匹配key，或key=，或key=value三种格式
          if (match){
            kvObj[match[1]] = decodeURIComponent(match[2] || '');
          }
        });
        return kvObj;
      }

      /**
       * 把KV对格式化成符合规范的hash传
       * @private
       * @param  {Object} kvObj
       * @return {String}
       */
      function formatHash(kvObj){
        var kvArr = [];
        for (var key in kvObj){
          var val = kvObj[key];
          if (val === ''){
            kvArr.push(key); // 值为空时使用没有等号的简化格式
          }else{
            kvArr.push(key + '=' + encodeURIComponent(val));
          }
        }
        return '#|' + kvArr.join('|'); // 前置了一个|号，暂时是为了兼容一部分旧的手工代码
      }

      /**
       * 对比两个KV之间的差异
       * @private
       * @param  {Object} A 旧的KV
       * @param  {Object} B 新的KV
       * @return {Array}
       */
      function diffKV(A, B){
        var diffs = [];
        var keysA = getKeys(A), keysB = getKeys(B);
        keysB.forEach(function(key){
          var valB = B[key];
          if (!(key in A)){
            // B里有但是A里没有，说明是新增的
            diffs.push({
              type: 'added',
              key: key,
              oldValue: null,
              newValue: valB
            });
          }else{
            var valA = A[key];
            if (valA !== valB){
              // B里有，A里也有，但是值不相等，说明是修改了
              diffs.push({
                type: 'modified',
                key: key,
                oldValue: valA,
                newValue: valB
              });
            }
          }
        });
        keysA.forEach(function(key){
          var valA = A[key];
          if (!(key in B)){
            // A里有B里没有，说明是删掉了
            diffs.push({
              type: 'removed',
              key: key,
              oldValue: valA,
              newValue: null
            });
          }
        });
        return diffs;
      }

      /**
       * 当hash变的时候响应
       * 更新hashKV
       * 触发自定义事件（如果没被mute的话）
       */
      function onhashchange(){
        var newHashKV = parseHash();
        if (!hash.mute){
          // 触发事件
          var diffs = diffKV(hashKV, newHashKV);
          diffs.forEach(function(d){
            events.trigger('change:' + d.key, [d.type, d.oldValue, d.newValue]);
          });
          if (diffs.length > 0){
            events.trigger('change', [clone(hashKV), clone(newHashKV), diffs]);
          }
        }
        hashKV = newHashKV;
      }
      function listenChanges(){
        $(window).on('hashchange', onhashchange);
      }
      function muteChanges(){
        $(window).off('hashchange', onhashchange);
      }

      /**
       * 更新location.hash，暂时关闭hashchange监听，处理完之后才会恢复监听，避免内部矛盾
       * @private
       * @param {Object} kvObj
       * @param {Boolean} silent
       */
      function updateHash(kvObj, silent){
        var str = formatHash(kvObj);
        hash.mute = !!silent;
        muteChanges();
        location.hash = str;
        onhashchange();
        setTimeout(listenChanges, 0);
        hash.mute = false;
        // 发现在location.hash = str后
        // 必须等下一个event loop才会触发/响应window.onhashchange
        // 这样当连续修改location.hash时，会把多个修改吞并到一个hashchange事件里面
        // 所以这里用了个很trick的办法：
        // 1、解绑hashchange事件监听
        // 2、修改hash
        // 3、手工“触发”一次hashchange响应函数
        // 4、使用setTimeout(0)重新绑定hashchange事件监听，让它推迟一个event loop
        // 5、实际效果是达到了，但是这种trick看起来很不靠谱的样子，等待高人review
      }

      /**
       * 获取值，返回key所对应的值，不存在时返回null。不传key时返回整个hash的KV
       * @param  {String} key
       * @return {Mixed}
       */
      hash.get = function(key){
        if (arguments.length === 0){
          return clone(hashKV); // 不直接返回hashKV防止被外界修改了
        }
        if (key in hashKV){
          return hashKV[key];
        }
        return null;
      };

      /**
       * 设置值
       * @param {String} key
       * @param {String} value
       * @param {Boolean} silent
       */
      hash.set = function(key, value, silent){
        var kvObj = parseHash(),
            newKV = {};
        newKV[key] = value;
        if (arguments.length == 1){
          // 只传一个参数时，为KV的格式
          newKV = key;
        }else if (arguments.length == 2){
          if (typeof value === 'boolean'){
            // 只传两个参数，且第二个是布尔值，那么是KV+silent的格式
            newKV = key;
            silent = value;
          }
        }
        $.extend(kvObj, newKV);
        updateHash(kvObj, silent);
      };

      /**
       * 删除值
       * @param {String} key
       * @param {Boolean} silent
       */
      hash.remove = function(key, silent){
        var kvObj = parseHash();
        if (!(key in kvObj)){
          return;
        }
        delete kvObj[key];
        updateHash(kvObj, silent);
      };

      hashKV = parseHash(); // 初始化KV
      listenChanges(); // 初始化事件监听
      hash.mute = false; // 开启自定义事件
    }
);
require(['lib/hash_lib']);
