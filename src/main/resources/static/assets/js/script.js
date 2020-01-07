
layui.config({
    base: '/static/assets/js/'
}).extend({
    clock: 'clock',
    timeago: 'timeago',
    col12: 'index_style/col12',
    col39: 'index_style/col39',
    col93: 'index_style/col93',
    card_media: 'index_style/card_media',
    long_card: 'index_style/long_card',
    article: 'article_style/article',
    search: 'search',
    note: 'note',
    message: 'message',
    ubs: 'ubs'
});

layui.use(['util', 'clock'], function () {
    var util = layui.util;
    var clock = layui.clock;

    clock.now();
    util.fixbar({
        bar1: true
        , click: function (type) {
            if (type === 'bar1') {
                location.href = "/message";
            }
        }
        , css: {right: 10, bottom: 25}
        , bgcolor: '#9F9F9F'

    });

});

$(function ($) {
    var $body = $("body");

    $("#mobile-nav").click(function () {
        var $sideNav = $(".nav-header .layui-nav-side");
        if ($sideNav.css("width") !== "0px") {
            $sideNav.animate({
                width: "0"
            }, 200)
        } else {
            $sideNav.animate({
                width: "200px"
            }, 200);

            layer.open({
                type: 1
                , title: false
                , shade: [0.6, '#000000']
                , shadeClose: true
                , closeBtn: 0
            })

        }
    });

    $body.click(function () {
        var $sideNav = $(".nav-header .layui-nav-side");
        if ($sideNav.css("width") !== "0px") {
            $sideNav.animate({
                width: "0"
            }, 200)
        }
    });

});

