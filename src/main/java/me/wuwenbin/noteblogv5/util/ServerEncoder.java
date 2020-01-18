package me.wuwenbin.noteblogv5.util;

import net.sf.json.JSONObject;

import javax.websocket.EncodeException;
import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;

/**
 * TODO
 *
 * @author JY
 * @date 2020/1/16 14:55
 */
public class ServerEncoder implements Encoder.Text<ResponseResult> {
    @Override
    public String encode(ResponseResult responseResult) throws EncodeException {
        return JSONObject.fromObject(responseResult).toString();
    }

    @Override
    public void init(EndpointConfig endpointConfig) {

    }

    @Override
    public void destroy() {

    }
}
