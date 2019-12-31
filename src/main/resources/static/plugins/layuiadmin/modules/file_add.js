layui.use(["layer","form", "upload","jquery","element"],function() {
    var $=layui.jquery,
        upload = layui.upload,
        element = layui.element;

    //创建监听函数
    var xhrOnProgress=function(fun) {
        xhrOnProgress.onprogress = fun; //绑定监听
        //使用闭包实现监听绑
        return function() {
            //通过$.ajaxSettings.xhr();获得XMLHttpRequest对象
            var xhr = $.ajaxSettings.xhr();
            //判断监听函数是否为函数
            if (typeof xhrOnProgress.onprogress !== 'function')
                return xhr;
            //如果有监听函数并且xhr对象支持绑定时就把监听函数绑定上去
            if (xhrOnProgress.onprogress && xhr.upload) {
                xhr.upload.onprogress = xhrOnProgress.onprogress;
            }
            return xhr;
        }
    };

    //多文件列表示例
    var demoListView = $('#demoList')
        ,uploadListIns = upload.render({
        elem: '#testList'
        ,url: '/management/file/add'
        ,accept: 'file'
        ,multiple: true
        ,auto: false
        ,bindAction: '#testListAction'
        ,xhr:xhrOnProgress
        ,choose: function(obj){
            var files = this.files = obj.pushFile(); //将每次选择的文件追加到文件队列
            //读取本地文件
            obj.preview(function(index, file, result){
                var tr = $([
                    '<tr id="upload-'+ index +'">'+
                        '<td>'+ file.name +'</td>'+
                        '<td>'+ (file.size/1014).toFixed(1) +'kb</td>'+
                        '<td>' +
                            '<div class="layui-progress layui-progress-big" lay-showpercent="true" lay-filter="uploadProgressBar'+index+'">' +
                                '<div class="layui-progress-bar" lay-percent="0%"></div>' +
                            '</div>' +
                        '</td>'+
                        '<td>'+
                            '<button class="layui-btn layui-btn-xs demo-reload layui-hide">重传</button>'+
                            '<button class="layui-btn layui-btn-xs layui-btn-danger demo-delete">删除</button>'+
                        '</td>'+
                    '</tr>'
                ].join(''));

                //单个重传
                tr.find('.demo-reload').on('click', function(){
                    obj.upload(index, file);
                });

                //删除
                tr.find('.demo-delete').on('click', function(){
                    delete files[index]; //删除对应的文件
                    tr.remove();
                    uploadListIns.config.elem.next()[0].value = ''; //清空 input file 值，以免删除后出现同名文件不可选
                });

                demoListView.append(tr);
                element.render('progress');//进度条div追加后，重新渲染进度条
            });
        }
        ,done: function(res, index, upload){
            if(res.code == '200'){ //上传成功
                var tr = demoListView.find('tr#upload-'+ index)
                    ,tds = tr.children();
                tds.eq(2).html('<span style="color: #5FB878;">'+res.message+'</span>');
                tds.eq(3).html(''); //清空操作
                return delete this.files[index]; //删除文件队列已经上传成功的文件
            }
            this.error(index, upload);
        }
        ,error: function(index, upload){
            var tr = demoListView.find('tr#upload-'+ index)
                ,tds = tr.children();
            tds.eq(2).html('<span style="color: #FF5722;">上传失败</span>');
            tds.eq(3).find('.demo-reload').removeClass('layui-hide'); //显示重传
        }
        ,progress:function(index,value){//上传进度回调 value进度值
            element.progress('uploadProgressBar'+index, value+'%')//设置页面进度条
        }
    });
});