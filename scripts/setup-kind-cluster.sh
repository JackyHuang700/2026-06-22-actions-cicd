#!/bin/bash
# setup-kind-cluster.sh - 在 ECS 上初始化 kind 集群和创建 docker registry secret

set -e

DOCKERHUB_USERNAME=${1:-"your_dockerhub_username"}
DOCKERHUB_TOKEN=${2:-"your_dockerhub_token"}
KIND_CLUSTER_NAME=${3:-"clouds-web-cluster"}

echo "🔧 Setting up Kind cluster: $KIND_CLUSTER_NAME"

# 1. 检查 kind 是否已安装
if ! command -v kind &> /dev/null; then
  echo "❌ kind not found. Please install kind first."
  exit 1
fi

# 2. 创建 kind 集群（如果不存在）
if ! kind get clusters | grep -q "^$KIND_CLUSTER_NAME$"; then
  echo "📦 Creating kind cluster: $KIND_CLUSTER_NAME"
  kind create cluster --name "$KIND_CLUSTER_NAME"
else
  echo "✅ Kind cluster already exists: $KIND_CLUSTER_NAME"
fi

# 3. 切换到对应集群的上下文
kubectl config use-context "kind-$KIND_CLUSTER_NAME"

# 4. 创建 docker registry secret
echo "🔐 Creating Docker registry secret..."
kubectl delete secret dockerhub-secret --ignore-not-found
kubectl create secret docker-registry dockerhub-secret \
  --docker-server=docker.io \
  --docker-username="$DOCKERHUB_USERNAME" \
  --docker-password="$DOCKERHUB_TOKEN" \
  --docker-email="user@example.com"

# 5. 应用初始的部署
echo "🚀 Deploying clouds-web..."
# 替换镜像名称中的用户名
sed -i "s/YOUR_DOCKERHUB_USERNAME/$DOCKERHUB_USERNAME/g" k8s/deployment.yaml
kubectl apply -f k8s/deployment.yaml

echo "✅ Setup complete!"
echo ""
echo "查看部署状态："
echo "  kubectl get pods"
echo "  kubectl get svc"
echo ""
echo "查看服务日志："
echo "  kubectl logs -l app=clouds-web"
echo ""
echo "端口转发（本地访问）："
echo "  kubectl port-forward svc/clouds-web-service 8080:80"
