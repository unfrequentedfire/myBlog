layui.define(["form", "table", "element"], function (exports) {
    var $ = layui.$,
        table = layui.table
        , form = layui.form
        , element = layui.element;

    element.render();
    var fileTable = table.render({
        elem: '#file-table'
        , height: 'full'
        , url: "/management/file/list"
        , cellMinWidth: 90
        , toolbar:  '#addBar'
        , defaultToolbar: ['filter']
        , limit: 10
        , size: 'lg'
        , request: {
            pageName: 'current' //页码的参数名称，默认：page
            , limitName: 'size' //每页数据量的参数名，默认：limit
        }
        , where: {
            order: 'desc'
            , sort: 'post'
        }
        , initSort: {
            field: 'post'
            , type: 'desc'
        }
        , cols: [[
            {type: 'numbers'}
            , {field: 'filenickname', title: '文件名', sort: true}
            , {field: 'filesuffix', title: '文件类型'}
            , {field: 'filesort', title: '文件分类'}
            , {field: 'post', title: '上传时间', sort: true, hide: true}
            , {title: '操作', width: 250, align: 'center', toolbar: '#fileBar', fixed: 'right'}
        ]]
        , page: true
    });
    var active = {
        reload: function () {
            var titleSearch = $('#file-name-search');
            //执行重载
            table.reload('file-table', {
                page: {
                    curr: 1 //重新从第 1 页开始
                }, where: {//查询条件
                    file_name: titleSearch.val()
                }
            });
        }
    };
    $('button[data-type]').on('click', function () {
        var type = $(this).data('type');
        active[type] ? active[type].call(this) : '';
    });

    //监听工具条
    table.on('tool(file)', function (obj) {
        var data = obj.data;
        if (obj.event === 'del') {
            window.top.layer.confirm('删除不可恢复，确认删除吗？', function (index) {
                obj.del();
                NBV5.post("/management/file/delete", {id: data.id});
                window.top.layer.close(index);
            });
        }

        if (obj.event === 'down') {
            window.location.href="/management/file/download?fileName="+data.filename+"&fileNickName="+data.filenickname;
        }
        if (obj.event === 'detail') {
            alert("编辑");
        }
    });

    //监听事件
    table.on('toolbar(file)', function(obj){
        if(obj.event==='add'){
            layer.open({
                type: 2,
                title:"上传文件",
                content: '/management/file/add',
                area:["100%","100%"],
                end:function () {
                    element.render();
                }
            });
        }
    });

    /*页码*/
    table.on('sort(file)', function (obj) {
        fileTable.reload({
            initSort: obj
            , where: {
                sort: obj.field
                , order: obj.type
            }
        });
    });

    exports('file_page', {});
});