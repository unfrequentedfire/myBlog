/*
Navicat MySQL Data Transfer

Source Server         : 本机
Source Server Version : 50726
Source Host           : 127.0.0.1:3306
Source Database       : noteblogv5

Target Server Type    : MYSQL
Target Server Version : 50726
File Encoding         : 65001

Date: 2019-10-01 17:16:20
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for nb_article
-- ----------------------------
DROP TABLE IF EXISTS `nb_article`;
CREATE TABLE `nb_article` (
  `id` varchar(100) NOT NULL,
  `post` datetime(6) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `appreciable` tinyint(1) DEFAULT '0',
  `approve_cnt` int(11) DEFAULT NULL,
  `author_id` bigint(20) NOT NULL,
  `commented` tinyint(1) DEFAULT '0',
  `reprinted` tinyint(1) DEFAULT NULL,
  `content` mediumtext,
  `cover` varchar(255) DEFAULT NULL,
  `draft` tinyint(1) NOT NULL DEFAULT '1',
  `md_content` mediumtext,
  `modify` datetime(6) DEFAULT NULL,
  `summary` text,
  `text_content` mediumtext,
  `top` int(11) DEFAULT NULL,
  `url_seq` varchar(100) DEFAULT NULL,
  `views` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of nb_article
-- ----------------------------

-- ----------------------------
-- Table structure for nb_cash
-- ----------------------------
DROP TABLE IF EXISTS `nb_cash`;
CREATE TABLE `nb_cash` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cash_no` varchar(50) NOT NULL,
  `create_time` datetime DEFAULT NULL COMMENT '充值卡创建时间',
  `recharge_time` datetime DEFAULT NULL COMMENT '用户充值时间',
  `enable` tinyint(1) NOT NULL DEFAULT '1' COMMENT '充值之后变为不可用状态',
  `user_id` bigint(20) DEFAULT NULL COMMENT '使用此卡充值的用户id',
  `nickname` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of nb_cash
-- ----------------------------

-- ----------------------------
-- Table structure for nb_comment
-- ----------------------------
DROP TABLE IF EXISTS `nb_comment`;
CREATE TABLE `nb_comment` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `article_id` varchar(100) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `reply_id` bigint(20) DEFAULT NULL COMMENT '回复的评论ID，如果不是回复他人，则此项为空',
  `clear_comment` varchar(1000) DEFAULT NULL,
  `comment` varchar(1000) DEFAULT NULL,
  `enable` tinyint(1) NOT NULL,
  `ip_addr` varchar(50) DEFAULT NULL,
  `ip_info` varchar(100) DEFAULT NULL,
  `post` datetime(6) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of nb_comment
-- ----------------------------

-- ----------------------------
-- Table structure for nb_dict
-- ----------------------------
DROP TABLE IF EXISTS `nb_dict`;
CREATE TABLE `nb_dict` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `group` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of nb_dict
-- ----------------------------

-- ----------------------------
-- Table structure for nb_hide
-- ----------------------------
DROP TABLE IF EXISTS `nb_hide`;
CREATE TABLE `nb_hide` (
  `id` varchar(100) NOT NULL,
  `article_id` varchar(100) NOT NULL,
  `hide_type` varchar(50) DEFAULT NULL COMMENT '隐藏类型：依次是：回复可见、购买可见以及登录可见 --> comment、purchase、login',
  `hide_html` text,
  `hide_price` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of nb_hide
-- ----------------------------

-- ----------------------------
-- Table structure for nb_log
-- ----------------------------
DROP TABLE IF EXISTS `nb_log`;
CREATE TABLE `nb_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `content_type` varchar(255) DEFAULT NULL,
  `ip_addr` varchar(255) DEFAULT NULL,
  `ip_info` varchar(255) DEFAULT NULL,
  `request_method` varchar(255) DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `time` datetime DEFAULT NULL,
  `browser` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of nb_log
-- ----------------------------

-- ----------------------------
-- Table structure for nb_message
-- ----------------------------
DROP TABLE IF EXISTS `nb_message`;
CREATE TABLE `nb_message` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `reply_id` bigint(20) DEFAULT NULL COMMENT '回复的评论ID，如果不是回复他人，则此项为空',
  `clear_comment` varchar(1000) DEFAULT NULL,
  `comment` varchar(1000) DEFAULT NULL,
  `enable` tinyint(1) NOT NULL,
  `ip_addr` varchar(50) DEFAULT NULL,
  `ip_info` varchar(100) DEFAULT NULL,
  `post` datetime(6) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of nb_message
-- ----------------------------

-- ----------------------------
-- Table structure for nb_note
-- ----------------------------
DROP TABLE IF EXISTS `nb_note`;
CREATE TABLE `nb_note` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `clear_content` text,
  `content` text NOT NULL,
  `md_content` text,
  `modify` datetime(6) DEFAULT NULL,
  `post` datetime(6) NOT NULL,
  `show` tinyint(1) NOT NULL,
  `title` varchar(50) DEFAULT NULL,
  `top` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of nb_note
-- ----------------------------

-- ----------------------------
-- Table structure for nb_param
-- ----------------------------
DROP TABLE IF EXISTS `nb_param`;
CREATE TABLE `nb_param` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `value` text,
  `group` int(11) DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL,
  `order_index` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of nb_param
-- ----------------------------

-- ----------------------------
-- Table structure for nb_upload
-- ----------------------------
DROP TABLE IF EXISTS `nb_upload`;
CREATE TABLE `nb_upload` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) DEFAULT NULL,
  `disk_path` varchar(255) NOT NULL,
  `type` varchar(100) NOT NULL,
  `upload` datetime(6) DEFAULT NULL,
  `virtual_path` varchar(255) NOT NULL,
  `article_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of nb_upload
-- ----------------------------

-- ----------------------------
-- Table structure for nb_user
-- ----------------------------
DROP TABLE IF EXISTS `nb_user`;
CREATE TABLE `nb_user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `role` tinyint(2) NOT NULL COMMENT '1：管理员，2：系统注册用户，3：qq登录用户，4：github登录用户',
  `avatar` varchar(255) DEFAULT NULL,
  `create_date` datetime DEFAULT NULL,
  `email` varbinary(255) DEFAULT NULL,
  `enable` tinyint(1) NOT NULL,
  `nickname` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `open_id` varchar(255) DEFAULT NULL,
  `username` varchar(20) DEFAULT NULL,
  `remain_coin` int(10) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of nb_user
-- ----------------------------

-- ----------------------------
-- Table structure for nb_user_coin_record
-- ----------------------------
DROP TABLE IF EXISTS `nb_user_coin_record`;
CREATE TABLE `nb_user_coin_record` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `operate_type` varchar(10) DEFAULT NULL COMMENT '详情见 OperateType枚举类',
  `operate_time` datetime DEFAULT NULL,
  `operate_value` int(11) NOT NULL DEFAULT '0',
  `remain_coin` int(11) NOT NULL,
  `remark` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of nb_user_coin_record
-- ----------------------------

-- ----------------------------
-- Table structure for refer_article_cate
-- ----------------------------
DROP TABLE IF EXISTS `refer_article_cate`;
CREATE TABLE `refer_article_cate` (
  `article_id` varchar(100) NOT NULL,
  `cate_id` bigint(20) NOT NULL,
  PRIMARY KEY (`article_id`,`cate_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of refer_article_cate
-- ----------------------------

-- ----------------------------
-- Table structure for refer_article_tag
-- ----------------------------
DROP TABLE IF EXISTS `refer_article_tag`;
CREATE TABLE `refer_article_tag` (
  `article_id` varchar(100) NOT NULL,
  `tag_id` bigint(20) NOT NULL,
  PRIMARY KEY (`article_id`,`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of refer_article_tag
-- ----------------------------

-- ----------------------------
-- Table structure for refer_hide_user_purchase
-- ----------------------------
DROP TABLE IF EXISTS `refer_hide_user_purchase`;
CREATE TABLE `refer_hide_user_purchase` (
  `article_id` varchar(100) NOT NULL,
  `hide_id` varchar(100) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `purchase_time` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of refer_hide_user_purchase
-- ----------------------------
