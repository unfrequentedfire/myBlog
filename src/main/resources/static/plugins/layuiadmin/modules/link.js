
layui.define(["admin"], function (exports) {
    var $ = layui.$,
        admin = layui.admin;

    $("#keyword-search").click(function () {
        var sln = $("input[name=linkName]").val();
        location.href = "/management/dict/link?name=" + sln;
    });

    $("#link-add").click(function () {
        var linkName = $("input[name=linkName]").val();
        var linkHref = $("input[name=linkHref]").val();
        if (linkHref.indexOf("http://") !== 0 && linkHref.indexOf("https://") !== 0) {
            layer.msg("URL填写格式错误！");
        } else if (linkName === '' || linkHref === '') {
            layer.msg("链接名称和url不能为空！");
        } else {
            admin.req({
                type: "post",
                dataType: "json",
                url: "/management/dict/link/add",
                data: {
                    linkName: linkName,
                    linkHref: linkHref
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


    $("div.link>button>span.delete").click(function () {
        var tbtn = $(this).parent();
        var lid = $(this).attr("data-lid");
        admin.req({
            type: "post",
            dataType: "json",
            url: "/management/dict/link/delete",
            data: {
                id: lid
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


    exports('link', {});
});