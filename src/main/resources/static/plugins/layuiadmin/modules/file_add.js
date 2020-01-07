layui.use(["layer","form", "upload","jquery","element","formSelects"],function() {
    var $=layui.jquery,
        upload = layui.upload,
        formSelects = layui.formSelects,
        form=layui.form,
        element = layui.element;

    //查询文件分类有哪些
    let fileSorts;
    $.get("/management/dict/filesort/list", function (resp) {
        if (resp.code === 200) {
            fileSorts=resp.data
        }
    });

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

    let file_names="";
    let file_indexs="";
    //多文件列表示例
    var demoListView = $('#demoList')
        ,uploadListIns = upload.render({
        elem: '#testList'
        ,url: '/management/file/add'
        ,accept: 'file'
        ,multiple: true
        ,auto: false
        ,data:{param:{}}
        ,bindAction: '#testListAction'
        ,xhr:xhrOnProgress
        ,before: function(obj){
            let file_name_arr=file_names.split(",");
            let file_index_arr=file_indexs.split(",");
            let map=[];

            for (let i in file_index_arr) {
                if(i!=((file_index_arr.length)-1)){
                    let file_nickname=$("#filenickname"+file_index_arr[i]).val();
                    let file_sort=formSelects.value('filesortId'+file_index_arr[i], 'valStr');
                    map.push({
                        "file_name":file_name_arr[i],
                        "file_nickname":file_nickname,
                        "file_sort":file_sort
                    })
                }
            }
            this.data.param=JSON.stringify(map);
        }
        ,choose: function(obj){
            let files = this.files = obj.pushFile(); //将每次选择的文件追加到文件队列
            let keys = Object.keys(files);

            demoListView.empty();
            for (let index of keys){
                var tr = $([
                    '<tr id="upload-'+ index +'">'+
                        '<td><input type="text" class="layui-input" id="filenickname'+index+'" value="'+files[index].name+'"/></td>'+
                        '<td>' +
                            '<select name="filesortId'+index+'" xm-select="filesortId'+index+'" xm-select-search="" xm-select-radio>' +
                                '<option value="">请选择文件分类</option>' +
                            '</select>' +
                        '</td>'+
                        '<td>'+ ((files[index].size/1014)/1014).toFixed(1) +'MB</td>'+
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

                file_names += files[index].name+",";
                file_indexs += index+",";

                demoListView.append(tr);
                element.render('progress');//进度条div追加后，重新渲染进度条
                formSelects.render('filesortId'+index);//重载formSelects
                formSelects.data('filesortId'+index, 'local', {//给文件分类下拉赋值
                    arr: fileSorts
                });
            }
            /*//读取本地文件1577942454993-0
            obj.preview(function(index, file, result){
                var tr = $([
                    '<tr id="upload-'+ index +'">'+
                        '<td><input type="text" class="layui-input" id="filenickname'+index+'" value="'+file.name+'"/></td>'+
                        '<td>' +
                            '<select name="filesortId'+index+'" xm-select="filesortId'+index+'" xm-select-search="" xm-select-radio>' +
                                '<option value="">请选择文件分类</option>' +
                            '</select>' +
                        '</td>'+
                        '<td>'+ ((file.size/1014)/1014).toFixed(1) +'MB</td>'+
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
                file_names += file.name+",";
                file_indexs += index+",";

                demoListView.append(tr);
                element.render('progress');//进度条div追加后，重新渲染进度条

                formSelects.render('filesortId'+index);//重载formSelects
                formSelects.data('filesortId'+index, 'local', {//给文件分类下拉赋值
                    arr: fileSorts
                });
            });*/
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