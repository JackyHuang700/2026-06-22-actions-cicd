# K3s 部署指南 - SSH 方式

本指南介绍如何通过 GitHub Actions 自动化在 Aliyun ECS 上的 K3s 集群中部署应用。

## 📋 前置条件

- [ ] Aliyun ECS 实例已创建
- [ ] K3s 已在 ECS 中安装 (`curl -sfL https://get.k3s.io | sh -`)
- [ ] Docker 已在 ECS 中安装
- [ ] ECS 可通过 SSH 访问
- [ ] Docker Hub 账户已准备好

## 🔧 第一步: 在 ECS 上准备环境

### 1. SSH 连接到 ECS

```bash
ssh -i your-private-key.pem root@your-ecs-ip
```

### 2. 验证 K3s 状态

```bash
# 检查 K3s 是否运行
sudo k3s kubectl get nodes

# 或使用标准 kubectl（需要配置 kubeconfig）
sudo kubectl get nodes --kubeconfig=/etc/rancher/k3s/k3s.yaml
```

### 3. 验证 Docker 安装

```bash
docker --version
docker login
```

### 4. 上传部署脚本（可选）

将 `k8s/deploy.sh` 上传到 ECS：

```bash
scp -i your-private-key.pem k8s/deploy.sh root@your-ecs-ip:/root/deploy.sh
chmod +x /root/deploy.sh
```

## 🔐 第二步: 在 GitHub 中配置 Secrets

进入你的 GitHub 仓库 → Settings → Secrets and variables → Actions，添加以下 Secret：

| Secret 名称 | 说明 | 示例 |
|---|---|---|
| `ECS_HOST` | Aliyun ECS 的公网 IP 或域名 | `123.45.67.89` |
| `ECS_USERNAME` | ECS 登录用户名 | `root` |
| `ECS_SSH_KEY` | ECS SSH 私钥内容 | （粘贴完整的私钥） |
| `DOCKERHUB_USERNAME` | Docker Hub 用户名 | `jk2022jk` |
| `DOCKERHUB_TOKEN` | Docker Hub 访问令牌/密码 | （从 Docker Hub 生成） |

### 如何生成 Docker Hub Token

1. 登录 [Docker Hub](https://hub.docker.com)
2. 进入 Account Settings → Security → New Access Token
3. 创建新 Token，赋予 Read & Write 权限
4. 复制 Token 内容到 GitHub Secret

### 如何获取 SSH 私钥内容

```bash
# Linux/Mac
cat ~/.ssh/your-private-key.pem

# Windows PowerShell
Get-Content C:\path\to\your-private-key.pem
```

## 🚀 第三步: 部署流程

### 自动部署（推荐）

当你推送到 `main` 分支时，GitHub Actions 会自动：

1. ✅ 构建 Docker 镜像
2. ✅ 推送到 Docker Hub
3. ✅ 通过 SSH 连接到 ECS
4. ✅ 拉取最新镜像
5. ✅ 部署到 K3s
6. ✅ 验证部署状态

**工作流文件**: `.github/workflows/build-push.yml`

### 手动部署（用于测试）

如果想在 ECS 上手动部署：

```bash
# 登录 ECS
ssh -i your-private-key.pem root@your-ecs-ip

# 方法 1: 使用部署脚本
export DOCKER_USERNAME="jk2022jk"
export DOCKER_TOKEN="your-token-here"
bash /root/deploy.sh docker.io/jk2022jk/clouds-web:latest

# 方法 2: 手动执行 kubectl 命令
sudo kubectl --kubeconfig=/etc/rancher/k3s/k3s.yaml apply -f /root/deployment.yaml
sudo kubectl --kubeconfig=/etc/rancher/k3s/k3s.yaml -n clouds-web rollout status deployment/clouds-web
```

## 📊 监控部署

### 查看 Pod 状态

```bash
# 查看所有 Pod
sudo kubectl --kubeconfig=/etc/rancher/k3s/k3s.yaml -n clouds-web get pods

# 实时监控 Pod
sudo kubectl --kubeconfig=/etc/rancher/k3s/k3s.yaml -n clouds-web get pods -w

# 查看 Pod 日志
sudo kubectl --kubeconfig=/etc/rancher/k3s/k3s.yaml -n clouds-web logs -f deployment/clouds-web
```

### 查看 Deployment 状态

```bash
sudo kubectl --kubeconfig=/etc/rancher/k3s/k3s.yaml -n clouds-web describe deployment clouds-web
```

### 查看 Service 信息

```bash
sudo kubectl --kubeconfig=/etc/rancher/k3s/k3s.yaml -n clouds-web get svc clouds-web-service
```

## 🔄 故障排查

### 问题 1: 镜像拉取失败

```bash
# 检查 image pull secret
sudo kubectl --kubeconfig=/etc/rancher/k3s/k3s.yaml -n clouds-web describe pod <pod-name>

# 查看事件日志
sudo kubectl --kubeconfig=/etc/rancher/k3s/k3s.yaml -n clouds-web describe events
```

**解决方案**: 重新创建 secret

```bash
sudo kubectl --kubeconfig=/etc/rancher/k3s/k3s.yaml -n clouds-web delete secret dockerhub-secret

sudo kubectl --kubeconfig=/etc/rancher/k3s/k3s.yaml -n clouds-web create secret docker-registry dockerhub-secret \
  --docker-server="docker.io" \
  --docker-username="your-username" \
  --docker-password="your-token" \
  --docker-email="noreply@example.com"
```

### 问题 2: Pod 无法启动

```bash
# 查看 Pod 日志
sudo kubectl --kubeconfig=/etc/rancher/k3s/k3s.yaml -n clouds-web logs -f <pod-name>

# 查看 Pod 详细信息
sudo kubectl --kubeconfig=/etc/rancher/k3s/k3s.yaml -n clouds-web describe pod <pod-name>
```

### 问题 3: GitHub Actions 部署失败

1. 查看 GitHub Actions 日志：仓库 → Actions → 最新工作流 → 查看错误
2. 检查 SSH 连接是否正常
3. 验证所有 Secret 是否正确配置
4. 确保 ECS 有足够的磁盘空间

## 🌐 綁定網域與 HTTPS

以 `jk66888.ccwu.cc` 為例：

### 1. DNS

在管理該子網域的 DNS 後台新增一筆 **A 記錄**，指向 ECS 的公網 IP（同 `ECS_HOST`）：

```
主機記錄: jk66888
記錄值:   <ECS 公網 IP>
```

### 2. 安全群組

確認 Aliyun 安全群組已開放 inbound TCP `80` 與 `443`。

### 3. 安裝 cert-manager（僅需一次）

```bash
sudo kubectl --kubeconfig=/etc/rancher/k3s/k3s.yaml apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.16.2/cert-manager.yaml

# 等 cert-manager 的 Pod 都 Running 之後再套用 ClusterIssuer
sudo kubectl --kubeconfig=/etc/rancher/k3s/k3s.yaml apply -f k8s/cert-manager-issuer.yaml
```

### 4. 確認

`k8s/deployment.yaml` 中的 Ingress 已設定 `host: jk66888.ccwu.cc` 並透過 `cert-manager.io/cluster-issuer: letsencrypt-prod` 自動簽發憑證到 `clouds-web-next-tls` 這個 Secret。下次 GitHub Actions 部署（或手動 `kubectl apply -f k8s/deployment.yaml`）後：

```bash
# 觀察憑證簽發狀態
sudo kubectl --kubeconfig=/etc/rancher/k3s/k3s.yaml -n clouds-web-next get certificate
sudo kubectl --kubeconfig=/etc/rancher/k3s/k3s.yaml -n clouds-web-next describe certificaterequest
```

DNS 生效、憑證簽發成功後即可用 `https://jk66888.ccwu.cc` 存取。

### 5. 新增子網域（走 Cloudflare Proxy，例如 test.jk66888.ccwu.cc）

這個情境跟上面的 `jk66888.ccwu.cc` 不同：DNS 是在 Cloudflare 管理，而且開啟 Proxy（橘色雲朵），所以訪客端的 HTTPS 是由 **Cloudflare** 負責，不是 cert-manager。

**Cloudflare 後台：**
1. DNS → Add record
   - Type: `A`
   - Name: 如果 Cloudflare 裡的 zone 是 `jk66888.ccwu.cc`，填 `test`；如果 zone 是 `ccwu.cc`，填 `test.jk66888`
   - IPv4 address: ECS 公網 IP（同 `ECS_HOST`）
   - Proxy status: 🟠 Proxied
2. SSL/TLS → Overview，模式選 **Flexible**（Cloudflare↔訪客走 HTTPS，Cloudflare↔origin 走 HTTP，origin 不需要額外憑證，設定最簡單）
   - 如果之後想要 Cloudflare↔origin 這段也加密，可以改用 **Full**，但要在 Traefik 那端裝一張 Cloudflare Origin Certificate（Cloudflare 後台 SSL/TLS → Origin Server → Create Certificate），不能用 **Full (strict)**，因為 origin 目前沒有 Cloudflare 信任的憑證。

**專案端（已完成）：**
`k8s/deployment.yaml` 的 Ingress 已經多加一個 `host: test.jk66888.ccwu.cc` 規則，指到同一個 `clouds-web-next-service`（跟正式站同一份內容）。這個 host **沒有**放進 `tls.hosts`，所以 cert-manager 不會幫它跟 Let's Encrypt 申請憑證——因為流量是走 Cloudflare Proxy，HTTP-01 驗證請求會被 Cloudflare 擋下，而且訪客端的憑證本來就該由 Cloudflare 簽發，不需要 Let's Encrypt 重複簽一次。

> 注意：如果之後把這筆記錄改回「僅 DNS」（灰色雲朵），要記得同時把 `test.jk66888.ccwu.cc` 加進 Ingress 的 `tls.hosts`，否則瀏覽器會用不到憑證。

## 🛠️ 常用命令速查

```bash
# 重启 Deployment
sudo kubectl --kubeconfig=/etc/rancher/k3s/k3s.yaml -n clouds-web rollout restart deployment/clouds-web

# 删除所有 Pod（会自动重建）
sudo kubectl --kubeconfig=/etc/rancher/k3s/k3s.yaml -n clouds-web delete pods --all

# 强制更新镜像（拉取最新）
sudo kubectl --kubeconfig=/etc/rancher/k3s/k3s.yaml -n clouds-web set image deployment/clouds-web \
  clouds-web=docker.io/jk2022jk/clouds-web:latest --record

# 查看资源使用情况
sudo kubectl --kubeconfig=/etc/rancher/k3s/k3s.yaml -n clouds-web top pods

# 获取所有资源
sudo kubectl --kubeconfig=/etc/rancher/k3s/k3s.yaml -n clouds-web get all
```

## 📝 部署配置说明

### deployment.yaml 关键字段

```yaml
# 副本数
replicas: 2

# 滚动更新策略
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1           # 最多增加 1 个 Pod
    maxUnavailable: 0     # 不能有不可用的 Pod

# 镜像配置
image: docker.io/jk2022jk/clouds-web:latest
imagePullPolicy: Always  # 每次都拉取最新镜像

# 端口映射
ports:
  - containerPort: 3000   # 容器内端口
    hostPort: 80          # 主机端口（在 K3s 中映射到 80）

# 重启策略
restartPolicy: Always     # 容器崩溃后自动重启

# 镜像拉取密钥（用于私有仓库）
imagePullSecrets:
  - name: dockerhub-secret
```

## 🎯 最佳实践

1. ✅ 使用标签来追踪镜像版本：`docker.io/jk2022jk/clouds-web:v1.0.0`
2. ✅ 定期备份 K3s 数据：`sudo k3s etcd-snapshot save`
3. ✅ 启用 Health Check（取消注释 deployment.yaml 中的 livenessProbe）
4. ✅ 设置资源限制（取消注释 deployment.yaml 中的 resources）
5. ✅ 定期更新 K3s 版本
6. ✅ 监控磁盘空间，及时清理旧镜像：`docker image prune -a`
7. ✅ 使用 HTTPS 保护应用（配置 Ingress）

---

**有任何问题？** 查看 [K3s 官方文档](https://docs.k3s.io/) 或 [Kubernetes 文档](https://kubernetes.io/docs/)
