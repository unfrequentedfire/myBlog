package me.wuwenbin.noteblogv5.controller.management.file;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import me.wuwenbin.noteblogv5.controller.common.BaseController;
import me.wuwenbin.noteblogv5.model.LayuiTable;
import me.wuwenbin.noteblogv5.model.ResultBean;
import me.wuwenbin.noteblogv5.model.entity.Filess;
import me.wuwenbin.noteblogv5.service.interfaces.file.FileService;
import me.wuwenbin.noteblogv5.util.FileUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.io.*;
import java.util.Date;

/**
 * TODO
 *
 * @author JY
 * @date 2019/12/31 9:20
 */
@Controller
@RequestMapping("/management/file")
public class FileController extends BaseController {
    @Value("${com.zc.savepath}")
    private String savePath;

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @GetMapping
    public String cashPage() {
        return "management/file/list";
    }
    @GetMapping("/add")
    public String addPage(){
        return "management/file/add";
    }

    @PostMapping("/add")
    @ResponseBody
    public ResultBean upload(@Valid Filess bean, MultipartFile file){
        if (file != null && !file.isEmpty()){
            try {
                String file_path=savePath+file.getOriginalFilename();
                if(!FileUtil.makeDirectory(file_path)){
                    System.out.println("创建文件目录失败！可能已经创建");
                }
                file.transferTo(new File(FileUtil.toUNIXpath(file_path)));
                bean.setFilename(file.getOriginalFilename());
                bean.setFilepath(file_path);
                bean.setFiletype(file.getContentType());
                bean.setPost(new Date());
            } catch (IOException e) {
                ResultBean.error("文件上传失败！");
                e.printStackTrace();
            }

            if(fileService.save(bean)){
                return ResultBean.ok("文件上传成功！");
            }else {
                return ResultBean.error("文件上传失败！");
            }
        } else {
            return ResultBean.error("未获取到有效的文件信息，请重新上传！");
        }
    }

    @GetMapping("/list")
    @ResponseBody
    public LayuiTable<Filess> fileListPage(Page<Filess> page, String sort, String order, String file_name) {
        addPageOrder(page, order, sort);
        IPage<Filess> filePage = fileService.page(page, Wrappers.<Filess>query().like(StrUtil.isNotEmpty(file_name), "file_name", file_name));
        return new LayuiTable<>(filePage.getTotal(), filePage.getRecords());
    }


    @GetMapping("/download")
    @ResponseBody
    private void downloadFile(HttpServletResponse response,String fileName) {
        String downloadFilePath = savePath+fileName;//被下载的文件在服务器中的路径

        File file = new File(FileUtil.toUNIXpath(downloadFilePath));
        if (file.exists()) {
            response.setContentType("application/force-download");// 设置强制下载不打开
            response.addHeader("Content-Disposition", "attachment;fileName=" + fileName);
            byte[] buffer = new byte[1024];
            FileInputStream fis = null;
            BufferedInputStream bis = null;
            try {
                fis = new FileInputStream(file);
                bis = new BufferedInputStream(fis);
                OutputStream outputStream = response.getOutputStream();
                int i = bis.read(buffer);
                while (i != -1) {
                    outputStream.write(buffer, 0, i);
                    i = bis.read(buffer);
                }
            } catch (Exception e) {
                e.printStackTrace();
            } finally {
                if (bis != null) {
                    try {
                        bis.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
                if (fis != null) {
                    try {
                        fis.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }
}
