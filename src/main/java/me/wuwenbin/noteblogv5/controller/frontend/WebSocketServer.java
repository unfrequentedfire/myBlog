package me.wuwenbin.noteblogv5.controller.frontend;

import me.wuwenbin.noteblogv5.model.entity.User;
import me.wuwenbin.noteblogv5.service.interfaces.UserService;
import me.wuwenbin.noteblogv5.util.ResponseResult;
import me.wuwenbin.noteblogv5.util.ServerEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * TODO
 *
 * @author JY
 * @date 2020/1/15 16:32
 */
@Component
@ServerEndpoint(value = "/websocket/{id}/{xm}",encoders = { ServerEncoder.class })
public class WebSocketServer {
    @Autowired
    private UserService userService;

    private static WebSocketServer server;

    @PostConstruct
    public void init() {
        server = this;
        server.userService = this.userService;
    }

    public void setUserService(UserService userService) {
        this.userService = userService;
    }

    /**
     * 所有在线会话
     */
    private static Map<String, Session> onlineSessions = new ConcurrentHashMap<>();

    /**
     * 用户信息
     */
    private static final List<HashMap<String,Object>> users = new ArrayList<>();

    /**
     * 消息记录-私聊
     */
    private static final List<HashMap<String,Object>> privateMessages = new ArrayList<>();

    /**
     * 消息记录-群聊
     */
    private static final List<HashMap<String,Object>> publicMessages = new ArrayList<>();


    /**
     * 连接成功
     * @param id 用户id
     * @param session
     */
    @OnOpen
    public void onOpen( @PathParam(value = "id") String id, @PathParam(value = "xm") String xm, Session session) {
        onlineSessions.put(id, session);
        System.out.println("用户 "+id+" 上线！当前在线 "+onlineSessions.size()+" 人");

        flag: {
            for(HashMap map1:users){
                if(id.equals(map1.get("userid"))){
                    break flag;
                }
            }

            User user=server.userService.getById(id);
            HashMap<String,Object> map=new HashMap<>();
            map.put("username",xm);
            map.put("userid",id);
            map.put("avatar",user.getAvatar());
            users.add(map);
        }
    }

    @OnMessage
    public void onMessage(@PathParam(value = "id") String id, @PathParam(value = "xm") String xm, Session session, String msg) throws IOException {
        if("HeartBeat".equals(msg)){
            return;
        }
        ResponseResult result=ResponseResult.get();
        HashMap<String,Object> map=new HashMap<>();
        if("connect-success".equals(msg)){
            map.put("type","init");
            for(HashMap map1:users){
                if(onlineSessions.get(map1.get("userid"))!=null){
                    //在线
                    map1.put("is_online",'0');
                }else {
                    //离线
                    map1.put("is_online",'1');
                }
            }
            map.put("user_info",users);
//            map.put("user_message",getPrivateMessages(id));

            result.setData(map);
            sendObjectToAll(result);
            return;
        }

        if(msg.equals("get-public-message")){
            map.put("type","public-message");
            map.put("public_msg",publicMessages);

            result.setData(map);
            sendObjectToUser(result,id);
            return;
        }

        if(msg.startsWith("get-private-message:")){
            String sendUserId = msg.substring(msg.indexOf(":")+1);
            System.out.println(sendUserId);
            map.put("type","private-message");
            map.put("private_msg",getPrivateMessages(id));

            result.setData(map);
            sendObjectToUser(result,id);
            return;
        }

        if(msg.startsWith("P:")){
            //私聊(格式:P:sendUserId-私聊信息)
            String sendUserId = msg.split(":")[1].split("-")[0];
            msg = msg.split(":")[1].split("-")[1];

            map.put("type","msg");
            map.put("message",msg);
            map.put("username",xm);
            map.put("userid",id);//消息发送人
            map.put("sendUserId",sendUserId);//消息接收人
            for(HashMap map1:users){
                if(id.equals(map1.get("userid"))){
                    map.put("avatar",map1.get("avatar"));
                }
            }
            //保存消息记录
            privateMessages.add(map);
            //发送消息
            result.setData(map);
            sendObjectToUser(result,sendUserId,id);
        }else{
            //群聊
            map.put("type","msg");
            map.put("message",msg);
            map.put("username",xm);
            map.put("userid",id);
            for(HashMap map1:users){
                if(id.equals(map1.get("userid"))){
                    map.put("avatar",map1.get("avatar"));
                }
            }

            //保存消息记录
            publicMessages.add(map);
            //发送消息
            result.setData(map);
            sendObjectToAll(result);
        }
    }

    /**
     * 连接关闭
     */
    @OnClose
    public void onClose(@PathParam(value = "id") String id, Session session) {
        onlineSessions.remove(id);

        ResponseResult result=ResponseResult.get();
        HashMap<String,Object> map=new HashMap<>();
        map.put("type","init");

        for(HashMap map1:users){
            if(id.equals(map1.get("userid"))){
                //离线
                map1.put("is_online",'1');
            }
        }
        map.put("user_info",users);

        result.setData(map);
        sendObjectToAll(result);
        System.out.println("用户 "+id+" 下线！当前在线 "+onlineSessions.size()+" 人");
    }

    /**
     * 连接错误
     */
    @OnError
    public void onError(Session session, Throwable error) {
        error.printStackTrace();
    }

    /**
     * 发送ResponseResult给所有人
     */
    private static void sendObjectToAll(ResponseResult result) {
        onlineSessions.forEach((id, session) -> {
            try {
                session.getBasicRemote().sendObject(result);
            } catch (IOException e) {
                e.printStackTrace();
            } catch (EncodeException e) {
                e.printStackTrace();
            }
        });
    }

    /**
     * 发送ResponseResult给指定用户,自己也发送
     * @param result 结果集
     * @param sendUserId 指定用户id
     * @param id 发送发id
     */
    private static void sendObjectToUser(ResponseResult result,String sendUserId,String id) {
        if (onlineSessions.get(sendUserId) != null) {
            try {
                //发给指定用户
                onlineSessions.get(sendUserId).getBasicRemote().sendObject(result);
                //发给自己
                onlineSessions.get(id).getBasicRemote().sendObject(result);
            } catch (IOException e) {
                e.printStackTrace();
            } catch (EncodeException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * 发送ResponseResult给指定用户，自己不发送
     * @param result 结果集
     * @param sendUserId 指定用户id
     */
    private static void sendObjectToUser(ResponseResult result,String sendUserId) {
        if (onlineSessions.get(sendUserId) != null) {
            try {
                //发给指定用户
                onlineSessions.get(sendUserId).getBasicRemote().sendObject(result);
            } catch (IOException e) {
                e.printStackTrace();
            } catch (EncodeException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * 获取某用户的所有私聊信息(别人发的，自己发的)
     * @param id
     * @return
     */
    private List<HashMap<String,Object>> getPrivateMessages(String id){
        List<HashMap<String,Object>> list = new ArrayList<>();
        for(HashMap map:privateMessages){
            if(id.equals(map.get("sendUserId")) || id.equals(map.get("userid"))){
                list.add(map);
            }
        }

        return list;
    }
}
