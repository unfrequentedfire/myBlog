layui.define(['laytpl', 'timeago', 'laypage','jquery'], function (exports) {
    var tpl = layui.laytpl,
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
                                '<div class="chat-scroll" id="message-div">' +
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

var mydate = new Date();//时间对象，用于显示时间
function webSocketSession(){
    var userid = $("#userid").val();
    var username = $("#username").val();
    var websocket = new WebSocket("wss://coolfire.store/websocket/"+userid+"/"+username);
    // var websocket = new WebSocket("ws://localhost:443/websocket/"+userid+"/"+username);

    websocket.onopen = function (evnt) {
        console.log('连接成功！');
        websocket.send("connect-success");

        //默认点击群聊
        setTimeout(function () {
            $("a[is-public='true']").click();
        },1000);

        heartCheck.start();//启动心跳
    };

    websocket.onmessage = function (evnt) {
        heartCheck.reset();//心跳重置
        let result=JSON.parse(evnt.data);
        let data=result.data;

        //维护在线用户列表
        if(data.type=='init'){
            chatRoomInit(data);
        }else if(data.type=='msg'){//维护消息发送模块
            setSendMess(data);
        }else if(data.type=='public-message'){//维护群聊历史消息
            setPublicMess(data);
        }else if(data.type=='private-message'){//维护私聊历史消息
            setPrivateMess(data);
        }
    };


    websocket.onerror = function (evnt) {
        console.log('连接失败！');
    };
    websocket.onclose = function (evnt) {
        console.log('连接关闭！');
    };

    /**
     * 心跳数据代码
     * @type {{timeoutObj: null, start: heartCheck.start, reset: heartCheck.reset, timeout: number}}
     */
    var heartCheck = {
        timeout: 60000,//60s
        timeoutObj: null,
        reset: function(){
            clearInterval(this.timeoutObj);
            this.start();
        },
        start: function(){
            this.timeoutObj = setInterval(function(){
                if(websocket.readyState==1){
                    websocket.send("HeartBeat");
                }
            }, this.timeout)
        }
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

    //人员列表点击
    $("#userlist").on('click','a[name="user"]',function () {
        if($(this).attr("userid")==$("#userid").val()){
            alert("不能给自己发消息");
            return;
        }

        //清空消息
        $("#messageList").empty();
        //清空提醒未读数量
        $(this).find(".media-active").empty();
        $(this).find(".media-active").attr("active-num","0");
        $("a[name='user']").removeClass("active");
        $(this).addClass("active");
        $("#chatHeader").html('<div class="media-img-wrap">' +
                                    '<div class="avatar avatar-online">' +
                                        '<img src="'+$(this).find("img").attr("src")+'" alt="User Image" class="avatar-img rounded-circle">' +
                                    '</div>' +
                                '</div>' +
                                '<div class="media-body">' +
                                    '<div class="user-name">'+$(this).find("div[class='user-name']").html()+'</div>' +
                                    '<div class="user-status">在线</div>' +
                                '</div>');
        //群聊
        if($(this).attr("is-public")=='true'){
            $("#sendUserid").val('');
            websocket.send("get-public-message");
        }else {//私聊
            $("#sendUserid").val($(this).attr("userid"));
            websocket.send("get-private-message:"+$(this).attr("userid"));
        }
    })
}

/**
 * 聊天室初始化-在线人员列表
 * @param data
 */
function chatRoomInit(data) {
    let htm =
        '<a href="javascript:void(0);" class="media active" name="user" is-public="true">' +
            '<div class="media-img-wrap">' +
                '<div class="avatar avatar-online">' +
                    '<img src="../../assets/img/avatar_public.jpg" class="avatar-img rounded-circle">' +
                '</div>' +
            '</div>' +
            '<div class="media-body">' +
                '<div>' +
                    '<div class="user-name">群聊</div>' +
                '</div>' +
            '</div>' +
        '</a>';
    $("#userlist").html(htm);
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
                        '<div class="media-active" active-num="0"></div>'+
                    '</div>' +
                '</a>';
            $("#userlist").append(htm);
        }
    }
}

/**
 * 设置群聊历史
 */
function setPublicMess(data) {
    for (let obj of data.public_msg) {
        if(obj.username==$("#username").val()) {
            //消息来自自己，改变样式
            let htm=
                '<li class="media sent">' +
                    '<div class="media-body">' +
                        '<div class="msg-box">' +
                            '<div>' +
                                '<p>'+obj.message+'</p>' +
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
        }else {
            let htm =
                '<li class="media received">' +
                    '<div class="avatar">' +
                        '<img src="' + obj.avatar + '" alt="User Image" class="avatar-img rounded-circle">' +
                    '</div>' +
                    '<div class="media-body">' +
                        '<div class="msg-box">' +
                            '<div>' +
                                '<p>' + obj.message + '</p>' +
                                '<ul class="chat-msg-info">' +
                                    '<li><div class="chat-time"><span>' + mydate.toLocaleString() + '</span></div></li>' +
                                    '<li><a href="#">--' + obj.username + '</a></li>' +
                                '</ul>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</li>';
            $("#messageList").append(htm);
        }
    }

    scrollBottm();
}

/**
 * 设置消息发送
 */
function setSendMess(data) {
    let username=data.username;
    let message=data.message;
    let avatar=data.avatar;
    let userid=data.userid;

    if(username==$("#username").val()) {
        //消息来自自己，改变样式
        let htm=
            '<li class="media sent">' +
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
    }else if($("a[userid='"+userid+"']").attr("class").indexOf("active")>=0){
        //消息来自别人，并且对话框已打开
        let htm =
            '<li class="media received">' +
                '<div class="avatar">' +
                    '<img src="' + avatar + '" alt="User Image" class="avatar-img rounded-circle">' +
                '</div>' +
                '<div class="media-body">' +
                    '<div class="msg-box">' +
                        '<div>' +
                            '<p>' + message + '</p>' +
                            '<ul class="chat-msg-info">' +
                                '<li>' +
                                    '<div class="chat-time">' +
                                        '<span>' + mydate.toLocaleString() + '</span>' +
                                    '</div>' +
                                '</li>' +
                                '<li><a href="#">--' + username + '</a></li>' +
                            '</ul>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</li>';
        $("#messageList").append(htm);
    }else {
        //消息来自别人，对话框未开启，添加提醒
        $("a[userid='"+userid+"']").find(".media-active").each(function () {
            let num=parseInt($(this).attr("active-num"));
            $(this).attr("active-num",(num+1));

            let htm = '<div class="badge badge-success badge-pill">'+$(this).attr("active-num")+'</div>';
            $(this).html(htm);
        });
    }

    scrollBottm();
}

function setPrivateMess(data) {
    for (let obj of data.private_msg) {
        if(obj.username==$("#username").val()) {
            //消息来自自己，改变样式
            let htm=
                '<li class="media sent">' +
                    '<div class="media-body">' +
                        '<div class="msg-box">' +
                            '<div>' +
                                '<p>'+obj.message+'</p>' +
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
        }else {
            let htm =
                '<li class="media received">' +
                    '<div class="avatar">' +
                        '<img src="' + obj.avatar + '" alt="User Image" class="avatar-img rounded-circle">' +
                    '</div>' +
                    '<div class="media-body">' +
                        '<div class="msg-box">' +
                            '<div>' +
                                '<p>' + obj.message + '</p>' +
                                '<ul class="chat-msg-info">' +
                                    '<li><div class="chat-time"><span>' + mydate.toLocaleString() + '</span></div></li>' +
                                    '<li><a href="#">--' + obj.username + '</a></li>' +
                                '</ul>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</li>';
            $("#messageList").append(htm);
        }
    }

    scrollBottm();
}

function scrollBottm() {
    $("#message-div").scrollTop($("#message-div")[0].scrollHeight);
}
