#!/usr/bin/env bash
# 路径 B 的一键发布：本地构建 → 提交源码 → 推送，GitHub Actions 负责构建部署。
# 用法：bash scripts/publish.sh "写一篇新笔记"
# 前提：已 git init、已配置 user.name/user.email、已添加 origin 远程，且默认分支为 main。
set -e
cd "$(dirname "$0")/.."
export PATH="$PWD/.bin:$PATH"

if ! command -v hugo >/dev/null 2>&1; then
  echo "未找到 hugo：请把官方二进制放到 .bin/hugo，或安装到 PATH" >&2
  exit 1
fi

hugo --minify
git add .
git commit -m "${1:-更新博客内容}"
git push origin main
