define(function() {
    function analysHtml(html) {
        var content;
        var templates;
        var index;
        var count;
        var item;
        var poslt;
        var posend;
        var attr;

        content = {};
        templates = html.split('<template id="sf_async_');
        count = templates.length;
        //console.log(templates);
        for (index = 0; index < count; index++) {
            item = templates[index];
            poslt = item.indexOf('>');
            posend = item.lastIndexOf('</template>');
            if (poslt > -1 && posend > -1) {
                attr = item.substring(0, poslt).match(/([^>]*)['|"][^>]*/);
                if (attr && attr[1]) {
                    content['sf_async_' + attr[1]] = item.substring(poslt + 1, posend);
                }
            }
        }
        return content;
    }

    function execScript(code, arglist) {
        var fn;
        var argkeys = [];
        var argvals = [];
        var count;
        var index;
        var argitem;
        var ret;
        count = arglist.length;
        for (index = 0; index < count; index++) {
            argitem = arglist[index];
            argkeys.push(argitem[0]);
            argvals.push(argitem[1]);
        }
        argkeys.push(code);
        try{
            fn = Function.apply(null, argkeys);
            ret = fn.apply(this, argvals);
        }catch(e){
            console.log(e)
        }
        return ret;
    }
    function render(html, global) {
        global = global || {};
        var content = analysHtml(html);
        var jsargs = [
            ['_global_', global],
            ['page', global.page],
            ['view', global.view],
            ['card', global.card]
        ];

        if (content.sf_async_head_js) {
            execScript(content.sf_async_head_js.replace(/<\/?script>/ig,''), jsargs);
        }
       var jsargs = [
            ['_global_', global],
            ['page', global.page],
            ['view', global.view],
            ['card', global.card]
        ];
        if (content.sf_async_body) {
            global.container && (global.container.innerHTML = content.sf_async_body);
        }
       var jsargs = [
            ['_global_', global],
            ['page', global.page],
            ['view', global.view],
            ['card', global.card]
        ];
        if (content.sf_async_merge_js) {
            execScript(content.sf_async_merge_js.replace(/<\/?script>/ig,''), jsargs);
        }
       var jsargs = [
            ['_global_', global],
            ['page', global.page],
            ['view', global.view],
            ['card', global.card]
        ];
        if (content.sf_async_foot_js) {
            execScript(content.sf_async_foot_js.replace(/<\/?script>/ig,''), jsargs);
        }
    }

    return render;
 //   module.exports = render;
});
