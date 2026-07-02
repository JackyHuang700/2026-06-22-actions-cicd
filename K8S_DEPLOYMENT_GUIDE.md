# Kind + Kubernetes 部署指南

## 前置条件

在 ECS 上需要已安装：
- Docker
- kubectl
- kind

## 部署流程

### 第一次部署（自动化）

GitHub Actions 工作流现已支持**自动化**部署，流程如下：

1. ✅ 检查 kind 集群是否存在，不存在则自动创建
2. ✅ 创建/更新 Docker registry secret
3. ✅ 应用 `k8s/deployment.yaml` 中的 Deployment 和 Service
4. ✅ 更新镜像标签
5. ✅ 等待 rollout 完成

**无需手动操作**，只需：
```bash
git push origin main  # GitHub Actions 自动处理
```

### 手动验证和初始设置（可选）

如果需要在部署前手动验证环境：

```bash
# SSH 连接到 ECS
ssh -i your-key.pem root@YOUR_ECS_IP

# 验证 kind 和 kubectl 已安装
kind --version
kubectl version --client

# 查看已存在的集群
kind get clusters
```

## 部署后验证

### 查看部署状态
```bash
# SSH 连接到 ECS
ssh root@YOUR_ECS_IP

# 设置 kubeconfig
export KUBECONFIG=/root/.kube/config

# 查看 pods
kubectl get pods -l app=clouds-web

# 查看服务
kubectl get svc clouds-web-service

# 查看完整状态
kubectl get all
```

### 查看日志
```bash
export KUBECONFIG=/root/.kube/config

# 查看最新日志
kubectl logs -l app=clouds-web --tail=100 -f

# 查看特定 pod 的日志
kubectl logs <pod-name>

# 查看上一个容器的日志（如果容器已重启）
kubectl logs <pod-name> --previous
```

## 常见操作

### 本地端口转发（从 ECS 上执行）
```bash
export KUBECONFIG=/root/.kube/config
kubectl port-forward svc/clouds-web-service 8080:80

# 然后在本地通过 SSH 隧道连接
ssh -L 8080:localhost:8080 root@YOUR_ECS_IP
# 访问 http://localhost:8080
```

### 扩展副本数
```bash
export KUBECONFIG=/root/.kube/config
kubectl scale deployment clouds-web --replicas=3
```

### 查看部署历史
```bash
export KUBECONFIG=/root/.kube/config
kubectl rollout history deployment/clouds-web
```

### 手动回滚到上一个版本
```bash
export KUBECONFIG=/root/.kube/config
kubectl rollout undo deployment/clouds-web
```

### 删除部署（谨慎操作）
```bash
export KUBECONFIG=/root/.kube/config
kubectl delete deployment clouds-web
kubectl delete svc clouds-web-service
```

## GitHub Secrets 配置

确保在 GitHub 仓库的 **Settings > Secrets and variables > Actions** 中设置了：

| Secret | 值 | 说明 |
|---|---|---|
| `ECS_HOST` | `1.2.3.4` | ECS 的公网 IP 地址 |
| `ECS_USERNAME` | `root` | SSH 用户名 |
| `ECS_SSH_KEY` | `-----BEGIN RSA PRIVATE KEY-----...` | SSH 私钥（完整内容） |
| `DOCKERHUB_USERNAME` | 你的用户名 | Docker Hub 用户名 |
| `DOCKERHUB_TOKEN` | 你的 token | Docker Hub 访问令牌 |

## 故障排查

### 问题 1：Pod 无法启动（CrashLoopBackOff）
```bash
export KUBECONFIG=/root/.kube/config

# 检查 pod 状态
kubectl describe pod <pod-name>

# 查看日志
kubectl logs <pod-name> --previous
```

**常见原因：**
- 镜像不存在或拉取失败 → 检查 imagePullSecrets 和镜像标签
- 应用端口配置错误 → 检查 Deployment 中的 containerPort
- 应用启动失败 → 查看容器日志

### 问题 2：镜像拉取失败 (ImagePullBackOff)
```bash
export KUBECONFIG=/root/.kube/config

# 检查 secret 是否存在
kubectl get secret dockerhub-secret

# 删除并重新创建 secret
kubectl delete secret dockerhub-secret
kubectl create secret docker-registry dockerhub-secret \
  --docker-server=docker.io \
  --docker-username=YOUR_USERNAME \
  --docker-password=YOUR_TOKEN \
  --docker-email=your@email.com
```

### 问题 3：Service 无法访问（LoadBalancer pending）
```bash
export KUBECONFIG=/root/.kube/config
kubectl get svc clouds-web-service

# Kind 集群中，LoadBalancer 类型的服务不会自动获得外部 IP
# 使用端口转发代替
kubectl port-forward svc/clouds-web-service 8080:80
```

### 问题 4：Deployment 更新失败
```bash
export KUBECONFIG=/root/.kube/config

# 检查 rollout 状态
kubectl rollout status deployment/clouds-web

# 查看 deployment 详情
kubectl describe deployment clouds-web

# 查看事件日志
kubectl get events --sort-by='.lastTimestamp'
```

### 问题 5：Kubectl 命令无法执行 (context 不存在)
```bash
# 列出所有可用的 context
kubectl config get-contexts

# 列出所有集群
kind get clusters

# 手动创建集群
kind create cluster --name clouds-web-cluster
```

## 完整的初始化脚本（如果需要手动执行）

```bash
#!/bin/bash
set -e

export KUBECONFIG=/root/.kube/config
CLUSTER_NAME="clouds-web-cluster"
DOCKERHUB_USERNAME="your_username"
DOCKERHUB_TOKEN="your_token"

# 创建集群
if ! kind get clusters | grep -q "^${CLUSTER_NAME}$"; then
  kind create cluster --name "${CLUSTER_NAME}"
fi

# 设置上下文
kubectl config use-context "kind-${CLUSTER_NAME}"

# 创建 secret
kubectl delete secret dockerhub-secret --ignore-not-found
kubectl create secret docker-registry dockerhub-secret \
  --docker-server=docker.io \
  --docker-username="${DOCKERHUB_USERNAME}" \
  --docker-password="${DOCKERHUB_TOKEN}" \
  --docker-email="ci@example.com"

# 应用部署
sed "s/YOUR_DOCKERHUB_USERNAME/${DOCKERHUB_USERNAME}/g" k8s/deployment.yaml | kubectl apply -f -

echo "✅ Setup complete!"
kubectl get pods -l app=clouds-web
```
