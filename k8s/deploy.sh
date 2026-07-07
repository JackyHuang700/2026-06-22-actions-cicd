#!/bin/bash

# K3s 部署脚本 - 用於 Aliyun ECS
# 使用: bash deploy.sh [image_tag]
# 例子: bash deploy.sh docker.io/jk2022jk/clouds-web:latest

set -e

# 顏色輸出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置變量
DOCKER_USERNAME="${DOCKER_USERNAME:-jk2022jk}"
DOCKER_TOKEN="${DOCKER_TOKEN}"
IMAGE_TAG="${1:-docker.io/jk2022jk/clouds-web:latest}"
NAMESPACE="clouds-web"
DEPLOYMENT_NAME="clouds-web"
K3S_CONFIG="/etc/rancher/k3s/k3s.yaml"
DEPLOYMENT_FILE="$(dirname "$0")/deployment.yaml"

# 檢查 kubeconfig
if [ ! -f "$K3S_CONFIG" ]; then
  echo -e "${RED}❌ 錯誤: K3s kubeconfig 不存在: $K3S_CONFIG${NC}"
  echo "請確保已在此 ECS 中安裝 K3s"
  exit 1
fi

# 檢查 kubectl 命令
if ! command -v kubectl &> /dev/null; then
  echo -e "${RED}❌ 錯誤: kubectl 未安裝${NC}"
  exit 1
fi

echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}🚀 K3s 部署開始${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "📦 鏡像: ${YELLOW}$IMAGE_TAG${NC}"
echo -e "📍 命名空間: ${YELLOW}$NAMESPACE${NC}"
echo ""

# Step 1: 登入 Docker Hub（如果提供了 token）
if [ -n "$DOCKER_TOKEN" ]; then
  echo -e "${YELLOW}[1/7]${NC} 登入 Docker Hub..."
  echo "$DOCKER_TOKEN" | docker login -u "$DOCKER_USERNAME" --password-stdin > /dev/null 2>&1
  echo -e "${GREEN}✅ Docker Hub 登入成功${NC}"
else
  echo -e "${YELLOW}[1/7]${NC} 跳過 Docker 登入（未提供 token）${NC}"
fi

# Step 2: 拉取鏡像
echo -e "${YELLOW}[2/7]${NC} 拉取 Docker 鏡像: ${YELLOW}$IMAGE_TAG${NC}"
docker pull "$IMAGE_TAG" > /dev/null
echo -e "${GREEN}✅ 鏡像拉取成功${NC}"

# Step 3: 建立命名空間
echo -e "${YELLOW}[3/7]${NC} 建立 Kubernetes 命名空間..."
kubectl --kubeconfig="$K3S_CONFIG" create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl --kubeconfig="$K3S_CONFIG" apply -f -
echo -e "${GREEN}✅ 命名空間準備完成${NC}"

# Step 4: 建立鏡像拉取密鑰（如果提供了 Docker 認證）
if [ -n "$DOCKER_TOKEN" ]; then
  echo -e "${YELLOW}[4/7]${NC} 建立 Docker Registry 密鑰..."
  kubectl --kubeconfig="$K3S_CONFIG" -n "$NAMESPACE" delete secret dockerhub-secret --ignore-not-found=true > /dev/null
  kubectl --kubeconfig="$K3S_CONFIG" -n "$NAMESPACE" create secret docker-registry dockerhub-secret \
    --docker-server="docker.io" \
    --docker-username="$DOCKER_USERNAME" \
    --docker-password="$DOCKER_TOKEN" \
    --docker-email="noreply@example.com" > /dev/null
  echo -e "${GREEN}✅ Registry 密鑰建立完成${NC}"
else
  echo -e "${YELLOW}[4/7]${NC} 跳過 Registry 密鑰（未提供 token）${NC}"
fi

# Step 5: 應用部署配置
echo -e "${YELLOW}[5/7]${NC} 應用 Kubernetes 部署配置..."
if [ ! -f "$DEPLOYMENT_FILE" ]; then
  echo -e "${RED}❌ 錯誤: 找不到部署文件: $DEPLOYMENT_FILE${NC}"
  exit 1
fi
kubectl --kubeconfig="$K3S_CONFIG" apply -f "$DEPLOYMENT_FILE"
echo -e "${GREEN}✅ 部署配置應用成功${NC}"

# Step 6: 等待部署完成
echo -e "${YELLOW}[6/7]${NC} 等待部署完成（最多 5 分鐘）..."
if kubectl --kubeconfig="$K3S_CONFIG" -n "$NAMESPACE" rollout status deployment/"$DEPLOYMENT_NAME" --timeout=5m; then
  echo -e "${GREEN}✅ 部署已就緒${NC}"
else
  echo -e "${RED}⚠️  部署超時，檢查日誌...${NC}"
  kubectl --kubeconfig="$K3S_CONFIG" -n "$NAMESPACE" describe deployment "$DEPLOYMENT_NAME"
fi

# Step 7: 顯示部署狀態
echo -e "${YELLOW}[7/7]${NC} 顯示部署狀態..."
echo ""
echo -e "${YELLOW}Pod 狀態:${NC}"
kubectl --kubeconfig="$K3S_CONFIG" -n "$NAMESPACE" get pods -o wide

echo ""
echo -e "${YELLOW}Deployment 狀態:${NC}"
kubectl --kubeconfig="$K3S_CONFIG" -n "$NAMESPACE" get deployment clouds-web -o wide

echo ""
echo -e "${YELLOW}Service 狀態:${NC}"
kubectl --kubeconfig="$K3S_CONFIG" -n "$NAMESPACE" get svc clouds-web-service -o wide

echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ 部署完成！${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"

# 清理 Docker 登入
docker logout > /dev/null 2>&1 || true
