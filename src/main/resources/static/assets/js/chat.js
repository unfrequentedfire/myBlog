layui.define(['laytpl', 'timeago', 'laypage','jquery'], function (exports) {
    var tpl = layui.laytpl,
        timeago = layui.timeago,
        laypage = layui.laypage,
        $=layui.jquery;

    let _tpl =
        '<div class="content container-fluid">' +
            '<div class="row">' +
                '<div class="col-sm-12">' +
                    '<div class="chat-window">' +
                        '<div class="chat-cont-left">' +
                            '<div class="chat-header">' +
                                '<span>聊天室</span>' +
                                '<a href="javascript:void(0)" class="chat-compose"></a>' +
                            '</div>' +
                            '<form class="chat-search">' +
                                '<div class="input-group">' +
                                    '<div class="input-group-prepend">' +
                                        '<i class="fa fa-search"></i>' +
                                    '</div>' +
                                    '<input type="text" class="form-control" placeholder="Search">' +
                                '</div>' +
                            '</form>' +
                            '<div class="chat-users-list">' +
                                '<div class="chat-scroll" id="userlist">' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="chat-cont-right">' +
                            '<div class="chat-header">' +
                                '<a id="back_user_list" href="javascript:void(0)" class="back-user-list">' +
                                    '<i class="material-icons">chevron_left</i>' +
                                '</a>' +
                                '<div class="media" id="chatHeader">' +
                                    /*'<div class="media-img-wrap">' +
                                        '<div class="avatar avatar-online">' +
                                            '<img src="../../static/plugins/msg/img/profiles/avatar-02.jpg" alt="User Image" class="avatar-img rounded-circle">' +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="media-body">' +
                                        '<div class="user-name">张三</div>' +
                                        '<div class="user-status">在线</div>' +
                                    '</div>' +*/
                                '</div>' +
                            '</div>' +
                            '<div class="chat-body">' +
                                '<div class="chat-scroll">' +
                                    '<ul class="list-unstyled" id="messageList">' +
                                        // '<li class="chat-date">Today</li>' +


                                    '</ul>' +
                                '</div>' +
                            '</div>' +
                            '<div class="chat-footer">' +
                                '<div class="input-group">' +
                                    '<div class="input-group-prepend">' +
                                        '<div class="btn-file btn">' +
                                            '<i class="fa fa-paperclip" aria-hidden="true"></i>' +
                                            '<input type="file">' +
                                        '</div>' +
                                    '</div>' +
                                    '<input type="text" id="chat" class="input-msg-send form-control" placeholder="请文明用语！">' +
                                    '<div class="input-group-append">' +
                                        '<button type="button" id="sendMessage" class="btn msg-send-btn"><i class="fa fa-send"></i></button>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        //未登录
        '{{# if(d.nbv5su == null){}}' +
        '<div class="no-login">' +
        '<a href="/login?redirectUrl=/chat" class="login-a">请登录</a>' +
        '</div>' +
        '{{#}}}';

    exports('chat', function (settings, linkList, nbv5su) {
        var obj = {
            settings: settings,
            linkList: linkList,
            nbv5su: nbv5su,
        };

        tpl(_tpl).render(obj, function (html) {
            $("#main-body").prepend(html);

            let height=$(".container-fluid").css("height");
            $(".no-login").css({"height":height,"line-height":height,"top":"-"+height});

            if(nbv5su!=null){//已登录
                webSocketSession();
            }
        });
    });

});

function webSocketSession(){
    var mydate = new Date();//时间对象，用于显示时间
    var userid = $("#userid").val();
    var username = $("#username").val();
    var websocket = new WebSocket("wss://coolfire.store/websocket/"+userid+"/"+username);

    websocket.onopen = function (evnt) {
        console.log('连接成功！');
        websocket.send("connect-success");
    };

    websocket.onmessage = function (evnt) {
        let result=JSON.parse(evnt.data);
        let data=result.data;

        //维护在线用户列表
        if(data.type=='user_status'){
            $("#userlist").empty();
            for (let obj of data.user_info) {
                if(obj.is_online=='0'){
                    let htm =
                        '<a href="javascript:void(0);" class="media" name="user" username="'+obj.username+'" userid="'+obj.userid+'">' +
                            '<div class="media-img-wrap">' +
                                '<div class="avatar avatar-online">' +
                                    '<img src="'+obj.avatar+'" class="avatar-img rounded-circle">' +
                                '</div>' +
                            '</div>' +
                            '<div class="media-body">' +
                                '<div>' +
                                    '<div class="user-name">'+obj.username+'</div>' +
                                '</div>' +
                            '</div>' +
                        '</a>';
                    $("#userlist").append(htm);
                }
            }
        }else if(data.type=='msg'){//维护消息发送模块
            let username=data.username;
            let message=data.message;
            let avatar=data.avatar;

            let htm='';
            if(username==$("#username").val()) {
                //消息来自自己，改变样式
                htm='<li class="media sent">' +
                        '<div class="media-body">' +
                            '<div class="msg-box">' +
                                '<div>' +
                                    '<p>'+message+'</p>' +
                                    '<div class="chat-msg-actions dropdown">' +
                                        '<a href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                                            '<i class="fe fe-elipsis-v"></i>' +
                                        '</a>' +
                                        '<div class="dropdown-menu dropdown-menu-right">' +
                                            '<a class="dropdown-item" href="#">Delete</a>' +
                                        '</div>' +
                                    '</div>' +
                                    '<ul class="chat-msg-info">' +
                                        '<li>' +
                                            '<div class="chat-time">' +
                                                '<span>'+mydate.toLocaleString()+'</span>' +
                                            '</div>' +
                                        '</li>' +
                                        '<li><a href="#">Edit</a></li>' +
                                    '</ul>' +
                            '</div>' +
                            '</div>' +
                        '</div>' +
                    '</li>';
                $("#messageList").append(htm);
                return;
            }

            htm='<li class="media received">' +
                    '<div class="avatar">' +
                        '<img src="'+avatar+'" alt="User Image" class="avatar-img rounded-circle">' +
                    '</div>' +
                    '<div class="media-body">' +
                        '<div class="msg-box">' +
                            '<div>' +
                                '<p>'+message+'</p>' +
                                '<ul class="chat-msg-info">' +
                                    '<li>' +
                                        '<div class="chat-time">' +
                                            '<span>'+mydate.toLocaleString()+'</span>' +
                                        '</div>' +
                                    '</li>' +
                                    '<li><a href="#">--'+username+'</a></li>' +
                                '</ul>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</li>';
            $("#messageList").append(htm);
        }
    };


    websocket.onerror = function (evnt) {
        console.log('连接失败！');
    };
    websocket.onclose = function (evnt) {
        console.log('连接关闭！');
    };

    $("#sendMessage").bind("click", function() {
        var msg=$("#chat").val();
        if($("#sendUserid").val()!=''){
            msg="P:"+$("#sendUserid").val()+"-"+msg;
        }
        websocket.send(msg);

        $("#chat").val("");//发送消息后清空输入框
    });

    //监听键盘事件(聊天内容回车提交)
    $('#chat').bind('keypress',function(event){
        if(event.keyCode == "13"){
            var msg=$("#chat").val();
            if($("#sendUserid").val()!=''){
                msg="P:"+$("#sendUserid").val()+"-"+msg;
            }
            websocket.send(msg);

            $("#chat").val("");//发送消息后清空输入框
            return false;//阻止事件广播
        }
    });

    //私聊
    $("#userlist").on('click','a[name="user"]',function () {
        if($(this).attr("userid")==$("#userid").val()){
            alert("不能给自己发消息");
            return;
        }

        $("#chatHeader").html('<div class="media-img-wrap">' +
                                    '<div class="avatar avatar-online">' +
                                        '<img src="'+$(this).find("img").attr("src")+'" alt="User Image" class="avatar-img rounded-circle">' +
                                    '</div>' +
                                '</div>' +
                                    '<div class="media-body">' +
                                        '<div class="user-name">'+$(this).attr('username')+'</div>' +
                                        '<div class="user-status">在线</div>' +
                                    '</div>');

        $("a[name='user']").removeClass("active");
        $(this).addClass("active");
        $("#sendUserid").val($(this).attr("userid"));
    })
}
