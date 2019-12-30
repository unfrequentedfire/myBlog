package me.wuwenbin.noteblogv5.service.interfaces.upload;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.extension.service.IService;
import me.wuwenbin.noteblogv5.constant.UploadConstant;
import me.wuwenbin.noteblogv5.model.entity.Upload;
import me.wuwenbin.noteblogv5.util.NbUtils;
import org.springframework.core.env.Environment;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.Date;
import java.util.Objects;
import java.util.function.Consumer;

/**
 * 上传方法
 * created by Wuwenbin on 2018/7/17 at 10:29
 *
 * @author wuwenbin
 */
public interface UploadService<T> extends IService<Upload> {

    /**
     * layui上传组件
     */
    String LAYUI_UPLOADER = "lay";

    /**
     * nkeditor 上传组件
     */
    String NKEDITOR_UPLOADER = "nk";

    /**
     * 默认是本地服务器上传
     * 如果需要其他方式，请在实现类中重写该方法
     *
     * @return 返回默认的上传方式
     */
    default UploadConstant.Method getUploadMethod() {
        return UploadConstant.Method.LOCAL;
    }

    /**
     * 默认上传方法
     *
     * @param sessionUserId
     * @param fileObj
     * @param extra
     * @param t
     * @return
     * @throws IOException
     */
    default <S> Upload uploadIt(Long sessionUserId, MultipartFile fileObj, Consumer<S> extra, S t) throws IOException {
        String uploadPathPre = Objects.requireNonNull(fileObj.getContentType()).contains("image/") ? UploadConstant.FileType.IMAGE : UploadConstant.FileType.FILE;
        String fileName = fileObj.getOriginalFilename();
        //扩展名，包括点符号
        assert fileName != null;
        String ext = fileName.substring(Objects.requireNonNull(fileName).lastIndexOf("."));
        String newFileName = IdUtil.randomUUID().concat(ext);
        String prefix = NbUtils.getBean(Environment.class).getProperty("app.upload.path");
        String datePrefix = LocalDate.now().toString();
        String completePrefix = prefix + uploadPathPre + "/" + datePrefix + "/";
        //剔除字符串前缀L：[file:]
        File targetFile = new File(completePrefix.substring(5));
        boolean m = true;
        if (!targetFile.exists()) {
            m = targetFile.mkdirs();
        }
        String uploadFilePath;
        if (m) {
            uploadFilePath = FileUtil.getAbsolutePath(completePrefix + newFileName);
        } else {
            throw new RuntimeException("创建目录：" + completePrefix + "失败！");
        }
        FileOutputStream out = new FileOutputStream(uploadFilePath);
        out.write(fileObj.getBytes());
        out.flush();
        out.close();
        String virtualPath = UploadConstant.FileType.VISIT_PATH.concat(uploadPathPre).concat("/" + datePrefix + "/").concat(newFileName);
        extra.accept(t);
        return Upload.builder()
                .diskPath(uploadFilePath)
                .virtualPath(virtualPath)
                .upload(new Date())
                .type(fileObj.getContentType())
                .userId(sessionUserId)
                .build();
    }

    /**
     * 文件上传接口方法
     *
     * @param sessionUserId
     * @param fileObj 文件对象
     * @param reqType 上传组件（layuiUploader还是NKuploader）
     * @param extra   上传之外的额外操作
     * @param t       上传之外的额外参数
     * @return upload 的上传json
     */
    <S> T upload(Long sessionUserId,MultipartFile fileObj, String reqType, Consumer<S> extra, S t);

}
