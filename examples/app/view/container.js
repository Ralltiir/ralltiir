define(function() {
    var View = require('sfr/view');
    var action = require('sfr/action');

    var html = [
        '<div>',
        '  <div class="sfr-head">',
        '    <span class="sfr-head-left">',
        '      <i class="c-icon">&#xe783</i>',
        '      <span>返回</span>',
        '    </span>',
        '    <span class="sfr-head-title">%t</span>',
        '    <span class="sfr-head-right"></span>',
        '  </div>',
        '  <div class="sfr-body"></div>',
        '</div>'
    ].join('\n');
    var css = [
        '.sfr-head {',
        '    background: %b;',
        '    position: fixed;',
        '    top: 0;',
        '    left: 0;',
        '    z-index: 500;',
        '    width: 100%;',
        '    height: %h;',
        '    line-height: %h;',
        '    text-align: center;',
        '    font-size: 18px;',
        '    color: #fff;',
        '    -webkit-user-select: none;',
        '    user-select: none',
        '}',
        '.sfr-head-left, .sfr-head-right{',
        '    height: %h;',
        '    font-size: 16px;',
        '}',
        '.sfr-head-left{',
        '    width: 62px;',
        '    float: left;',
        '}',
        '.sfr-head-left .c-icon{',
        '    font-family: "cicons";',
        '    font-style: normal;',
        '    -webkit-font-smoothing: antialiased;',
        '}',
        '.sfr-head-right{',
        '    width: 62px;',
        '    float: right;',
        '}',
        '.sfr-head-title{',
        '    padding-left: 8px;',
        '    padding-right: 8px;',
        '    text-overflow: ellipsis;',
        '    white-space: nowrap;',
        '    overflow: hidden;',
        '}',
        '.sfr-body{',
        '    padding-top: %h;',
        '}'
    ].join('\n');

    var ContainerView = new View();

    ContainerView.create = function(options) {
        if (!options || !options.title) {
            throw new Error('必须设置头部标题');
        }
        this.$root = this.render({
            title: options.title,
            height: options.height || '44px',
            background: options.background || '#09f'
        });
        this.$back = this.$root.find('.sfr-head-left');
        this.$body = this.$root.find('.sfr-body');
    };

    ContainerView.render = function(options) {
        var resultCss = css
            .replace(/%h/g, options.height)
            .replace(/%b/g, options.background);
        var resultHtml = html
            .replace(/%t/g, options.title);

        var $style = $('<style>').html(resultCss);
        var $html = $(resultHtml).append($style).appendTo('body').hide();
        return $html;
    };

    ContainerView.attach = function() {
        this.$root.show();
        this.$back.on('click', function(e) {
            e.preventDefault();
            action.back();
        });
    };

    ContainerView.detach = function() {
        this.$root.hide();
        this.$back.off('click');
    };

    ContainerView.destroy = function() {
        this.$root.remove();
    };

    return ContainerView;
});
