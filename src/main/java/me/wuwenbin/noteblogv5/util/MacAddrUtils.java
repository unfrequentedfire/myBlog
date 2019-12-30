package me.wuwenbin.noteblogv5.util;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import javax.servlet.http.HttpServletRequest;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.LineNumberReader;
import java.net.SocketException;
import java.net.UnknownHostException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * TODO
 *
 * @author JY
 * @date 2019/12/4 15:14
 */
@Slf4j
public class MacAddrUtils {
    public static String callCmd(String[] cmd) {
        String result = "";
        String line = "";
        Process proc;
        try {
            proc = Runtime.getRuntime().exec(cmd);
            InputStreamReader is = new InputStreamReader(proc.getInputStream());
            BufferedReader br = new BufferedReader(is);
            while ((line = br.readLine()) != null) {
                result += line;
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return result;
    }

    /**
     *
     *
     *
     * @param cmd
     *            第一个命令
     *
     * @param another
     *            第二个命令
     *
     * @return 第二个命令的执行结果
     *
     */

    public static String callCmd(String[] cmd, String[] another) {
        String result = "";
        String line = "";
        try {
            Runtime rt = Runtime.getRuntime();
            Process proc = rt.exec(cmd);
            proc.waitFor(); // 已经执行完第一个命令，准备执行第二个命令
            proc = rt.exec(another);
            InputStreamReader is = new InputStreamReader(proc.getInputStream());
            BufferedReader br = new BufferedReader(is);
            while ((line = br.readLine()) != null) {
                result += line;
            }
        } catch (IOException e) {
            e.printStackTrace();
        } catch (InterruptedException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return result;
    }

    /**
     *
     *
     *
     * @param ip
     *            目标ip,一般在局域网内
     *
     * @param sourceString
     *            命令处理的结果字符串
     *
     * @param macSeparator
     *            mac分隔符号
     *
     * @return mac地址，用上面的分隔符号表示
     *
     */

    public static String filterMacAddress(final String ip,
                                          final String sourceString, final String macSeparator) {
        String result = "";
        String regExp = "((([0-9,A-F,a-f]{1,2}" + macSeparator
                + "){1,5})[0-9,A-F,a-f]{1,2})";
        Pattern pattern = Pattern.compile(regExp);
        Matcher matcher = pattern.matcher(sourceString);
        while (matcher.find()) {
            result = matcher.group(1);
            if (sourceString.indexOf(ip) <= sourceString.lastIndexOf(matcher
                    .group(1))) {
                break; // 如果有多个IP,只匹配本IP对应的Mac.
            }
        }
        return result;
    }


    public static String getMacInWindows(final String ip) {
        String result = "";
        String[] cmd = { "cmd", "/c", "ping " + ip };
        String[] another = { "cmd", "/c", "arp -a" };
        String cmdResult = callCmd(cmd, another);
        result = filterMacAddress(ip, cmdResult, "-");
        return result;
    }

    /**
     *
     * @param ip
     *            目标ip
     * @return Mac Address
     *
     */
    public static String getMacInLinux(final String ip) {
        String result = "";
        String[] cmd = { "/bin/sh", "-c", "ping " + ip + " -c 2 && arp -a" };
        String cmdResult = callCmd(cmd);
        result = filterMacAddress(ip, cmdResult, ":");
        return result;
    }

    /**
     * 获取MAC地址
     *
     * @return 返回MAC地址
     */
    public static String getMacAddress(String ip) {
        String macAddress = "";
        macAddress = getMacInWindows(ip).trim();
        if (macAddress == null || "".equals(macAddress)) {
            macAddress = getMacInLinux(ip).trim();
        }
        return macAddress;
    }

    /**
     * 获取MAC地址(如果获取ip为127.0.0.1的话就不会得到值了。)
     *
     * @throws UnknownHostException
     * @throws SocketException
     */
    public static String getMACAddress(String ip){
        return getMacAddress(ip);
    }


    public static String getIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-real-ip");
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("x-forwarded-for");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
