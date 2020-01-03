package me.wuwenbin.noteblogv5.controller.frontend;

import com.baomidou.mybatisplus.core.metadata.OrderItem;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import me.wuwenbin.noteblogv5.controller.common.BaseController;
import me.wuwenbin.noteblogv5.model.entity.Filess;
import me.wuwenbin.noteblogv5.service.interfaces.dict.DictService;
import me.wuwenbin.noteblogv5.service.interfaces.file.FileService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * TODO
 *
 * @author JY
 * @date 2020/1/2 9:03
 */
@Controller
@RequestMapping("/dl")
public class FileDownController extends BaseController {
    private final FileService fileService;
    private final DictService dictService;

    public FileDownController(FileService fileService, DictService dictService) {
        this.fileService = fileService;
        this.dictService = dictService;
    }

    @GetMapping
    public String messagePage(Model model, Page<Filess> fillPage) {
        fillPage.setSize(10);
//        fillPage.setCurrent(Long.parseLong(p));
        OrderItem oi = OrderItem.desc("post");
        fillPage.addOrder(oi);
        model.addAttribute("files", fileService.page(fillPage));
        return "frontend/filedown";
    }
}
