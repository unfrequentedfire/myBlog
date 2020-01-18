package me.wuwenbin.noteblogv5.util;

/**
 * 响应结果
 * @param <T>
 */
public class ResponseResult<T> {
    public final static String KEY_CODE = "code";
    public final static String KEY_MESSAGE = "message";
    public final static String KEY_DATA = "data";
    public final static String KEY_DATA_TOTAL = "total";

    public final static Integer CODE_DEFAULT = 0;
    public final static String MESSAGE_SUCCESS = "操作成功";
    public final static String MESSAGE_FAILURE = "操作失败";

    // 状态码
    private int code;
    //状态信息
    private String message = MESSAGE_SUCCESS;
    //响应数据
    private T data;
    //状态信息
    private Integer total;

    public static ResponseResult get(){
        return new ResponseResult();
    }

    public void success(){
        this.code = CODE_DEFAULT;
        this.message = MESSAGE_SUCCESS;
    }

    public void success(String message){
        this.code = CODE_DEFAULT;
        this.message = message;
    }

    public void error(){
        this.code = 99;
        this.message = MESSAGE_FAILURE;
    }

    public void error(String error){
        this.code = 99;
        this.message = error;
    }

    public void error(int code,String error){
        this.code = code;
        this.message = error;
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Object getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public Integer getTotal() {
        return total;
    }

    public void setTotal(Integer total) {
        this.total = total;
    }
}
