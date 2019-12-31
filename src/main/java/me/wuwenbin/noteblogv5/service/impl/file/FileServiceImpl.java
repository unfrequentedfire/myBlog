package me.wuwenbin.noteblogv5.service.impl.file;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import me.wuwenbin.noteblogv5.mapper.FileMapper;
import me.wuwenbin.noteblogv5.model.entity.Filess;
import me.wuwenbin.noteblogv5.service.interfaces.file.FileService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


/**
 * TODO
 *
 * @author JY
 * @date 2019/12/31 10:09
 */
@Service
@Transactional(rollbackFor = Exception.class)
public class FileServiceImpl extends ServiceImpl<FileMapper, Filess> implements FileService {
}
