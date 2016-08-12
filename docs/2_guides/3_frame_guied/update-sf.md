# 局部更新Superframe视图

目前框架支持简单的视图局部更新机制，通过action接口可直接调用。

## 使用说明

局部更新功能目前仅提供给通用情景页，情景页里通过action模块的update接口提供，具体使用和配置如下：

```
    fif.action.update("/sf?params", null, null,{
        container: $cotainer,    //传入当前视图的container的$对象
        view: view  //传入当前视图对象view
    });

```

>注意：update方法，对url会进行replace变更, 通过 mod = 5 参数标识为局部更新。同时，使用update，也需要做好同步和异步的切换处理。

## Demo

下面是一个通过切换 Tab 进行局部更新视图的例子。

```js
{%extends "../base/result.tpl"%}

{%block name="title"%}{%/block%}

{%block name="data_modifier"%}

{%/block%}

{%block name="content"%}
<div class="sfe-page-wrap">
		{%*不更新视图部分*%}
    <div class="c-row sfc-tab-wrap">
        {%fe_fn_card_sflink_prefix class="c-span4 sfc-tab c-blocka" url="{%$tplData.url1%}"%}
            Tab1
        {%fe_fn_card_sflink_suffix%}

        {%fe_fn_card_sflink_prefix class="c-span4 sfc-tab c-blocka sfc-tab-selected" url="{%$tplData.url2%}"%}
            Tab2
        {%fe_fn_card_sflink_suffix%}
    </div>
		{%*更新视图部分*%}
		<div class="sfc-updated-content">
		    ......
		</div>
</div>


<script>
	card.setup(function () {
   		var $tab = $('.sfc-tab-wrap', me.container);
        if ($tab.length !== 0) {
            $tab.on('click', 'a', function (e) {
                e.preventDefault();
                $tab.find('.sfc-tab-selected').removeClass('sfc-tab-selected');
                $(this).addClass('sfc-tab-selected');
                var content = $('.sfc-updated-content', me.container);
                // 调用局部更新方法
                fif.action.update(
                    $(this).data('sf-href'), null, null,{
                        container: content,
                        view: view
                    }
                );
            });
        }
    });
</script>
{%/block%}

```
