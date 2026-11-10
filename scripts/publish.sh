#!/usr/bin/env bash
# 路径 B 的一键发布：本地构建 → 提交源码 → 推送，GitHub Actions 负责构建部署。
# 用法：bash scripts/publish.sh "写一篇新笔记"
# 前提：已 git init、已配置 user.name/user.email、已添加 origin 远程，且默认分支为 main。
set -e
cd "$(dirname "$0")/.."
export PATH="$PWD/.bin:$PATH"

# 本机 ssh 默认会去 /root/.ssh 找钥匙，而实际私钥在 $HOME/.ssh，显式指定避免认证失败
SSH_DIR="${HOME}/.ssh"
if [ -f "${SSH_DIR}/id_ed25519" ]; then
  export GIT_SSH_COMMAND="ssh -o BatchMode=yes -o ConnectTimeout=15 -o UserKnownHostsFile=${SSH_DIR}/known_hosts -o GlobalKnownHostsFile=/dev/null -o StrictHostKeyChecking=accept-new -i ${SSH_DIR}/id_ed25519"
fi

if ! command -v hugo >/dev/null 2>&1; then
  echo "未找到 hugo：请把官方二进制放到 .bin/hugo，或安装到 PATH" >&2
  exit 1
fi

hugo --minify

if [ -z "$(git status --porcelain)" ]; then
  echo "没有需要提交的变更，跳过推送。"
  exit 0
fi

git add .
git commit -m "${1:-更新博客内容}"
git push origin main
echo "已推送，GitHub Actions 将在约 1-2 分钟内自动构建并部署。"
