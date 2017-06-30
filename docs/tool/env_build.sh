#!/bin/bash

if [ $# -eq 0 ]
  then
    echo "please input correct address..."
    exit 1
  else
    oldDev=$1
    newDev=$2
fi

# 查找修改线上地址
sed -i "s/$oldDev/$newDev/g" /home/work/odp/template/wise/zh-CN/page/www/base/iphone/parent_content.tpl 

# 清除 odp 缓存
rm -rf /home/work/odp/tmp/

# 修改 nginx 302 地址
sed -i "s/$oldDev/$newDev/g" /home/work/nginx/conf/sf_jump.conf

# 重启 nginx
/home/work/nginx/sbin/nginx_control restart
