package me.wuwenbin.noteblogv5.controller.management.utils;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * TODO
 *
 * @author JY
 * @date 2020/1/6 13:50
 */
@Controller
@RequestMapping("/management/pic")
public class PicCompressController {
    @GetMapping
    public String picPage() {
        return "management/utils/pic-compress/pic_compress";
    }
}
