layui.define(['laytpl', 'timeago', 'laypage'], function (exports) {
    var tpl = layui.laytpl,
        timeago = layui.timeago,
        laypage = layui.laypage;

    var _tpl =
        '<div class="layui-mt20 animated fadeInUp">' +
            '{{# layui.each(d.files.records, function(index, item){ }}' +
            '<div class="dl layui-card" style="display: inline-block;width: 100%;">' +
                '<div class="layui-col-md7 layui-col-xs12" style="line-height: 45px;">' +
                    '<fieldset class="layui-elem-field layui-field-title" style="margin: 0px">' +
                        '<legend class="center-to-head"><i class="fa fa-sun-o"></i>' +
                            '<a href="#" onclick=downFile("{{item.filename}}","{{item.filenickname}}")>{{item.filenickname}}</a>' +
                        '</legend>' +
                    '</fieldset>' +
                '</div>' +
                '<div class="layui-col-md2 dl-item layui-hide-sm layui-hide-xs layui-show-md-inline-block">' +
                    '<span class="layui-badge no-select" style="margin-right: 10px;padding: 5px; background-color: #e6e6e6;color: #0c0c0c;">' +
                    '<i class="fa fa-tag"></i>{{item.filesort}}</span>' +
                '</div>' +
                '<div class="layui-col-md1 dl-item layui-hide-sm layui-hide-xs layui-show-md-inline-block"><span class="timeago" datetime="{{nbv5front.timeAgo(item.createtime)}}"></span></div>' +
                '<div class="layui-col-md1 dl-item layui-hide-sm layui-hide-xs layui-show-md-inline-block">{{item.filesuffix}}</div>' +
                '<div class="layui-col-md1 dl-item dl-btn layui-hide-sm layui-hide-xs layui-show-md-inline-block"><a href="#" onclick=downFile("{{item.filename}}","{{item.filenickname}}")><i class="fa fa-download"></i></a></div>' +
            '</div>' +
            '{{# });  }}' +
        '</div>'+
        '<div class="layui-row layui-container layui-mt20">  ' +
        '<div class="index-page-btn text-center">' +
        '        <div id="page-btns"></div>' +
        '    </div>' +
        '</div>';

    exports('filedown', function (settings, nbv5su, files) {
        var obj = {
            settings: settings,
            nbv5su: nbv5su,
            files: files
        };

        tpl(_tpl).render(obj, function (html) {
            $("#main-body").prepend(html);
            // stickySideBar();
            timeago.render($(".timeago"));
            initPage(files,laypage);
        });

    });
});

/*function stickySideBar() {
    nbv5front.clearSticky();

    var p = 0, t = 0;
    var sticky;

    $(window).scroll(function () {
        p = $(this).scrollTop();
        if (t < p) {
            if (sticky != null) {
                sticky.destroy();
            }
            sticky = new hcSticky("#affix-side", {
                stickTo: '#main-body',
                top: 15,
                queries: {980: {disable: true}}
            });
            //下滚
        } else {
            if (sticky != null) {
                sticky.destroy();
            }
            sticky = new hcSticky("#affix-side", {
                stickTo: '#main-body',
                top: 65,
                queries: {980: {disable: true}}
            });
            //上滚
        }
        setTimeout(function () {
            t = p;
        }, 0)
    })
}*/

function initPage(pageObj, page) {
    page.render({
        elem: 'page-btns'
        , count: pageObj.total
        , limit: pageObj.size
        , curr: pageObj.current
        , layout: ['count', 'prev', 'page', 'next']
        , jump: function (obj, first) {
            if (!first) {
                var words = nbv5front.getQueryString("w");
                words = words === null ? "" : words;
                location.href = "/dl?w=" + words + "&current=" + obj.curr
            }
        }
    });
}

//下载
function downFile(filename,filenickname) {
    window.location.href="/management/file/download?fileName="+filename+"&fileNickName="+filenickname;
}