package me.wuwenbin.noteblogv5.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Date;

/**
 * TODO
 *
 * @author JY
 * @date 2019/12/31 9:58
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("nb_file")
public class Filess implements Serializable {
    @TableId(type = IdType.UUID)
    private String id;
    @TableField("`file_name`")
    private String filename;//文件名称
    @TableField("`file_type`")
    private String filetype;//文件类型
    @TableField("`file_path`")
    private String filepath;//文件路径
    @TableField("`file_sort`")
    private String filesort;//文件分类
    @TableField("`post`")
    private Date post;
    @TableField("`file_nickname`")
    private String filenickname;
    @TableField("`file_suffix`")
    private String filesuffix;
    @TableField("`createtime`")
    private Date createtime;
    @TableField("`creator`")
    private String creator;
    @TableField("`creatorid`")
    private String creatorid;
}
