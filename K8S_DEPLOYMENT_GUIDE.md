# Kind + Kubernetes 部署指南

## 前置条件

在 ECS 上需要已安装：
- Docker
- kubectl
- kind

## 初始化（第一次手动执行）

### 1. SSH 连接到 ECS
```bash
ssh -i your-key.pem root@YOUR_ECS_IP
```

### 2. 创建 kind 集群
```bash
kind create cluster --name clouds-web-cluster
```

### 3. 验证集群
```bash
kubectl cluster-info
kubectl get nodes
```

### 4. 运行初始化脚本
将项目克隆到 ECS，然后运行：
```bash
cd /path/to/project
bash scripts/setup-kind-cluster.sh YOUR_DOCKERHUB_USERNAME YOUR_DOCKERHUB_TOKEN
```

这个脚本会：
- 创建 kind 集群上下文
- 创建 Docker registry secret
- 应用初始部署

## 验证部署

```bash
# 查看 pods
kubectl get pods -l app=clouds-web

# 查看服务
kubectl get svc

# 查看日志
kubectl logs -l app=clouds-web --tail=100 -f

# 端口转发（本地测试）
kubectl port-forward svc/clouds-web-service 8080:80
# 然后访问 http://localhost:8080
```

## GitHub Actions 自动部署流程

一旦初始化完成，GitHub Actions 工作流会在每次 `main` 分支 push 时：

1. ✅ 构建 Docker 镜像
2. ✅ 推送到 Docker Hub
3. ✅ SSH 连接到 ECS
4. ✅ 更新 kind 集群中的部署
5. ✅ 等待 rollout 完成

## 常见操作

### 查看部署历史
```bash
kubectl rollout history deployment/clouds-web
```

### 回滚到上一个版本
```bash
kubectl rollout undo deployment/clouds-web
```

### 扩展副本数
```bash
kubectl scale deployment clouds-web --replicas=3
```

### 删除部署
```bash
kubectl delete deployment clouds-web
```

## 故障排查

### 镜像拉取失败
检查 secret 和 imagePullPolicy：
```bash
kubectl get secret dockerhub-secret
kubectl describe pod <pod-name>
```

### Pod 无法启动
查看详细日志：
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name> --previous  # 如果 pod 已崩溃
```

### kind 集群无响应
重启 kind 集群：
```bash
kind delete cluster --name clouds-web-cluster
kind create cluster --name clouds-web-cluster
bash scripts/setup-kind-cluster.sh YOUR_USERNAME YOUR_TOKEN
```

## GitHub Secrets 配置

确保你在 GitHub 仓库的 Secrets 中设置了：
- `ECS_HOST` - ECS 公网 IP
- `ECS_USERNAME` - SSH 用户名（通常是 root）
- `ECS_SSH_KEY` - SSH 私钥
- `DOCKERHUB_USERNAME` - Docker Hub 用户名
- `DOCKERHUB_TOKEN` - Docker Hub 访问令牌
