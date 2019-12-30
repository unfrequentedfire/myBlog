package me.wuwenbin.noteblogv5.controller.frontend;

import cn.hutool.cache.Cache;
import cn.hutool.core.img.Img;
import cn.hutool.core.img.ImgUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.crypto.SecureUtil;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import me.wuwenbin.noteblogv5.constant.NBV5;
import me.wuwenbin.noteblogv5.constant.uploader.LayUploader;
import me.wuwenbin.noteblogv5.constant.uploader.NkUploader;
import me.wuwenbin.noteblogv5.controller.common.BaseController;
import me.wuwenbin.noteblogv5.mapper.UploadMapper;
import me.wuwenbin.noteblogv5.model.LayuiTable;
import me.wuwenbin.noteblogv5.model.ResultBean;
import me.wuwenbin.noteblogv5.model.bo.CommentBo;
import me.wuwenbin.noteblogv5.model.bo.HideBo;
import me.wuwenbin.noteblogv5.model.bo.ReplyBo;
import me.wuwenbin.noteblogv5.model.entity.Upload;
import me.wuwenbin.noteblogv5.model.entity.User;
import me.wuwenbin.noteblogv5.service.interfaces.UserCoinRecordService;
import me.wuwenbin.noteblogv5.service.interfaces.UserService;
import me.wuwenbin.noteblogv5.service.interfaces.content.HideService;
import me.wuwenbin.noteblogv5.service.interfaces.msg.CommentService;
import me.wuwenbin.noteblogv5.service.interfaces.property.ParamService;
import me.wuwenbin.noteblogv5.util.NbUtils;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.awt.*;
import java.io.File;
import java.util.Objects;

/**
 * @author wuwen
 */
@Controller
@RequestMapping("/ubs/token")
public class UbsController extends BaseController {

    private final CommentService commentService;
    private final HideService hideService;
    private final UserService userService;
    private final Cache<String, String> codeCache;
    private final UserCoinRecordService userCoinRecordService;


    public UbsController(CommentService commentService, HideService hideService,
                         UserService userService, Cache<String, String> codeCache,
                         UserCoinRecordService userCoinRecordService, ParamService paramService) {
        this.commentService = commentService;
        this.hideService = hideService;
        this.userService = userService;
        this.codeCache = codeCache;
        this.userCoinRecordService = userCoinRecordService;
    }

    @GetMapping("/{page}")
    public String uHistory(Model model, HttpServletRequest request, @PathVariable String page) {
        if ("index".equalsIgnoreCase(page)) {
            User su = getSessionUser(request);
            model.addAttribute("signed", userCoinRecordService.todayIsSigned(su.getId()));
        }
        return "frontend/ubs/" + page;
    }

    @PostMapping("/reply/{userId}")
    @ResponseBody
    public LayuiTable<ReplyBo> myLogs(Page<ReplyBo> replyPage, @PathVariable Long userId) {
        IPage<ReplyBo> newPage = commentService.findReplyPage(replyPage, userId);
        return new LayuiTable<>(newPage.getTotal(), newPage.getRecords());
    }

    @PostMapping("/comment/{userId}")
    @ResponseBody
    public LayuiTable<CommentBo> myComments(Page<CommentBo> replyPage, @PathVariable Long userId) {
        IPage<CommentBo> newPage =
                commentService.findCommentPage(replyPage, null, null, null, userId, true);
        return new LayuiTable<>(newPage.getTotal(), newPage.getRecords());
    }

    @PostMapping("/purchase/{userId}")
    @ResponseBody
    public LayuiTable<HideBo> myPurchases(Page<HideBo> replyPage, @PathVariable Long userId) {
        IPage<HideBo> newPage =
                hideService.findMyPurchases(replyPage, userId);
        return new LayuiTable<>(newPage.getTotal(), newPage.getRecords());
    }

    @PostMapping("/avatar/change")
    @ResponseBody
    public ResultBean upload(@RequestParam(value = "file", required = false) MultipartFile file, HttpServletRequest request) {
        String base64 = request.getParameter("base64");
        String GRAFFITI = "1";
        if (StrUtil.isNotEmpty(base64) && GRAFFITI.equals(base64)) {
            String base64Str = request.getParameter("img_base64_data");
            file = NbUtils.base64ToMultipartFile(base64Str);
        }
        User su = getSessionUser(request);
        Object res = Objects.requireNonNull(NbUtils.getUploadServiceByConfig()).upload(su.getId(), file, "lay", (v) -> {
        }, null);
        if (res instanceof LayUploader) {
            LayUploader layRes = (LayUploader) res;
            Object newAvatar = layRes.getData().get("src");
            scaleAvatar(newAvatar.toString());
            boolean r = userService.update(Wrappers.<User>update().set("avatar", newAvatar).eq("id", su.getId()));
            return handle(r, "修改成功，重新登录生效！", "修改失败！");
        } else if (res instanceof NkUploader) {
            NkUploader nkRes = (NkUploader) res;
            Object newAvatar = nkRes.getItem().get("url");
            scaleAvatar(newAvatar.toString());
            boolean r = userService.update(Wrappers.<User>update().set("avatar", newAvatar).eq("id", su.getId()));
            return handle(r, "修改成功，重新登录生效！", "修改失败！");
        } else {
            return ResultBean.error("修改失败，请稍后再试！");
        }
    }

    @PostMapping("/nickname/change")
    @ResponseBody
    public ResultBean nickname(@RequestParam(value = "nickname") String nickname, HttpServletRequest request) {
        User u = getSessionUser(request);
        if (StrUtil.isNotEmpty(nickname)) {
            int c = userService.countNickname(nickname);
            if (c >= 1) {
                return ResultBean.error("已存在，请修改在提交！");
            } else {
                boolean res = userService.update(Wrappers.<User>update().set("nickname", nickname).eq("id", u.getId()));
                return handle(res, "修改成功，重新登录生效！", "修改失败！");
            }
        } else {
            return ResultBean.error("昵称不能为空！");
        }
    }

    @PostMapping("/password/change")
    @ResponseBody
    public ResultBean password(String code, String pass, HttpServletRequest request) {
        if (StrUtil.isNotEmpty(code) && StrUtil.isNotEmpty(pass)) {
            User su = getSessionUser(request);
            String sessionMailCode = codeCache.get(su.getEmail() + "-" + NBV5.MAIL_CODE_KEY);
            if (code.equalsIgnoreCase(sessionMailCode)) {
                pass = SecureUtil.md5(pass);
                boolean res = userService.update(Wrappers.<User>update().set("password", pass).eq("id", su.getId()));
                return handle(res, "修改成功，重新登录生效！", "修改失败！");
            } else {
                return ResultBean.error("验证码错误！");
            }
        } else {
            return ResultBean.error("验证码和新密码不能为空！");
        }
    }

    @ResponseBody
    @PostMapping("/sign")
    public ResultBean sign(HttpServletRequest request) {
        User user = getSessionUser(request);
        int c = userCoinRecordService.todayIsSigned(user.getId());
        if (c >= 1) {
            return ResultBean.error("您今日已签过到，请明日再来签到！");
        } else {
            boolean res = userCoinRecordService.userSign(user.getId());
            if (res) {
                updateSessionUser(request, userService.getById(user.getId()));
            }
            return handle(res, "√ 已签到！", "× 签到失败！");
        }
    }

    @PostMapping("/cash/recharge")
    @ResponseBody
    public ResultBean cashRecharge(HttpServletRequest request, String cashNo) {
        User user = getSessionUser(request);
        boolean res = userCoinRecordService.userCashRecharge(user, cashNo);
        if (res) {
            updateSessionUser(request, userService.getById(user.getId()));
        }
        return handle(res, "充值成功！", "充值失败！");
    }

    @PostMapping("/getUserRemainCoin")
    @ResponseBody
    public ResultBean getUserRemainCoin(@RequestParam(value = "userId") Long userId) {
        if (userId == null) {
            return ResultBean.error("加载失败", 0);
        } else {
            User u = userService.getById(userId);
            return ResultBean.ok("加载成功", u.getRemainCoin());
        }
    }

    private void scaleAvatar(String imgSrc) {
        UploadMapper uploadMapper = NbUtils.getBean(UploadMapper.class);
        Upload upload = uploadMapper.selectOne(Wrappers.<Upload>query().eq("virtual_path", imgSrc));
        String trueDiskPath = upload.getDiskPath();
        File f = new File(trueDiskPath);
        Img img = Img.from(f);
        int width = img.scale(1).getImg().getWidth(null);
        int height = img.scale(1).getImg().getHeight(null);
        int num = Math.min(width, height);
        ImgUtil.cut(f, f, new Rectangle(0, 0, num, num));
    }
}
