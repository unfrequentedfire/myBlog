package me.wuwenbin.noteblogv5.controller.frontend;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * TODO
 *
 * @author JY
 * @date 2020/1/17 13:21
 */
@Controller
@RequestMapping("/chat")
public class ChatController {

    @GetMapping
    public String messagePage(Model model) {
        return "frontend/chat";
    }
}
