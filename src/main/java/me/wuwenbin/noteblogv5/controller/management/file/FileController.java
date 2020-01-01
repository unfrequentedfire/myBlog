package me.wuwenbin.noteblogv5.controller.management.file;

import cn.hutool.core.util.StrUtil;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import me.wuwenbin.noteblogv5.constant.DictGroup;
import me.wuwenbin.noteblogv5.controller.common.BaseController;
import me.wuwenbin.noteblogv5.model.LayuiTable;
import me.wuwenbin.noteblogv5.model.ResultBean;
import me.wuwenbin.noteblogv5.model.entity.Dict;
import me.wuwenbin.noteblogv5.model.entity.Filess;
import me.wuwenbin.noteblogv5.model.entity.User;
import me.wuwenbin.noteblogv5.service.interfaces.dict.DictService;
import me.wuwenbin.noteblogv5.service.interfaces.file.FileService;
import me.wuwenbin.noteblogv5.util.FileUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
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
    private final DictService dictService;

    public FileController(FileService fileService, DictService dictService) {
        this.fileService = fileService;
        this.dictService = dictService;
    }

    @GetMapping
    public String cashPage() {
        return "management/file/list";
    }
    @GetMapping("/add")
    public String addPage(HttpServletRequest request){
        request.setAttribute("fileSortList", dictService.list(Wrappers.<Dict>query().eq("`group`", DictGroup.GROUP_FILESORT)));
        return "management/file/add";
    }

    @PostMapping("/add")
    @ResponseBody
    public ResultBean upload(HttpServletRequest request,
                             @Valid Filess bean,
                             MultipartFile file,
                             String param){
        if (file != null && !file.isEmpty()){
            try {
                /*设置上传文件自定义参数*/
                JSONArray jsonArray = JSONObject.parseArray (param);
                for (int i=0;i<jsonArray.size();i++){
                    JSONObject object = (JSONObject) jsonArray.get(i);
                    if(object.getString("file_name").equals(file.getOriginalFilename())){
                        bean.setFilenickname(object.getString("file_nickname"));
                        bean.setFilesort(object.getString("file_sort"));
                    }
                }
                /*设置上传文件自定义参数*/

                /*保存到服务器*/
                String file_name = FileUtil.reName(file.getOriginalFilename());
                String file_path=savePath+file_name;
                if(!FileUtil.makeDirectory(file_path)){
                    System.out.println("创建文件目录失败！可能已经创建");
                }
                file.transferTo(new File(FileUtil.toUNIXpath(file_path)));
                /*保存到服务器*/

                /*数据保存到数据库*/
                bean.setFilename(file_name);//文件在服务器名字
                bean.setFilepath(file_path);//文件路径
                bean.setFiletype(file.getContentType());//文件编码
                bean.setFilesuffix(FileUtil.getTypePart(file_name));//文件后缀
                bean.setCreatetime(new Date());
                bean.setPost(new Date());
                User su = getSessionUser(request);
                bean.setCreator(su.getUsername());
                bean.setCreatorid(String.valueOf(su.getId()));

                if(fileService.save(bean)){
                    return ResultBean.ok("文件上传成功！");
                }else {
                    return ResultBean.error("文件上传失败！");
                }
                /*数据保存到数据库*/
            } catch (IOException e) {
                ResultBean.error("文件上传失败！");
                e.printStackTrace();
            }
        } else {
            return ResultBean.error("未获取到有效的文件信息，请重新上传！");
        }

        return ResultBean.error("文件上传失败！");
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
    public void downloadFile(HttpServletRequest request,HttpServletResponse response, String fileName,String fileNickName) {
        String fullPath = savePath+fileName;//被下载的文件在服务器中的路径

        //下载，支持断点续传
        FileUtil.breakDown(request,response,fullPath,(fileNickName+"."+FileUtil.getTypePart(fileName)));
    }

    @PostMapping("/delete")
    @ResponseBody
    public ResultBean delete(String id, HttpServletRequest request) {
        boolean res = fileService.removeById(id);
        return handle(res, "删除成功！", "删除失败！");
    }
}
