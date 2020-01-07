layui.use(["layer","form", "upload","jquery","element"],function() {
    var $=layui.jquery,
        upload = layui.upload;

    let index=0;
    upload.render({
        elem: '#upload'
        ,url: '#'
        ,accept: 'images'
        ,auto: false
        ,choose: function(obj){
            obj.preview(function(index, file, result){
                //压缩图片
                photoCompress(file, {
                    quality : compressionRatio(file.size)
                },function (base64Codes){
                    //显示到页面上
                    $(".layui-card-body").append(
                        '<div style="float: left;padding: 10px;">' +
                            '<img index="'+index+'" style="max-width: 300px;max-height: 300px;" src="'+base64Codes+'"/>' +
                        '</div>'
                    );
                    index+=1;
                });
            });
        }
    })
});