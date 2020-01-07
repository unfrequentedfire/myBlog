
layui.define(["admin"], function (exports) {
    var $ = layui.$,
        admin = layui.admin;

    $("#keyword-search").click(function () {
        var sc = $("input[name=keyword]").val();
        location.href = "/management/dict/keyword?keyword=" + sc;
    });

    $("#keyword-add").click(function () {
        var addKeyword = $("input[name=keyword]").val();
        if (addKeyword === '') {
            layer.msg("关键字称不能为空！");
        } else {
            admin.req({
                type: "post",
                dataType: "json",
                url: "/management/dict/keyword/add",
                data: {
                    keyword: addKeyword
                },
                success: function (resp) {
                    layer.msg(resp.message);
                    setTimeout(function () {
                        if (resp.code === 200) {
                            location.reload();
                        }
                    }, 1000);
                }
            })
        }
    });


    $("div.keyword>button>span.delete").click(function () {
        var tbtn = $(this).parent();
        var kid = $(this).attr("data-kid");
        admin.req({
            type: "post",
            dataType: "json",
            url: "/management/dict/keyword/delete",
            data: {
                id: kid
            },
            success: function (resp) {
                layer.msg(resp.message);
                tbtn.remove();
                setTimeout(function () {
                    if (resp.code === 200) {
                        location.reload();
                    }
                }, 1000);
            }
        })
    });


    exports('keyword', {});
});