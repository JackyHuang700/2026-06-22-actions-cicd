#!/bin/bash
# setup-traefik-and-networking.sh - 在 ECS 上配置 Traefik 和网络转发

set -e

export KUBECONFIG=/root/.kube/config

echo "🔧 Setting up Traefik Ingress Controller and networking..."

# 1. 检查 Helm 是否已安装
if ! command -v helm &> /dev/null; then
  echo "❌ Helm not found. Installing Helm..."
  curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
fi

# 2. 添加 Helm repo 并安装 Traefik
echo "📦 Installing Traefik Ingress Controller..."
if ! helm list -n traefik 2>/dev/null | grep -q traefik; then
  helm repo add traefik https://helm.traefik.io/traefik
  helm repo update
  helm install traefik traefik/traefik \
    --namespace traefik \
    --create-namespace \
    --set ports.web.nodePort=30080 \
    --set ports.websecure.nodePort=30443 \
    --set service.type=NodePort \
    --wait --timeout 5m
  echo "✅ Traefik installed"
else
  echo "✅ Traefik already installed"
fi

# 3. 应用 IngressRoute 资源
echo "📡 Applying Traefik IngressRoute..."
kubectl apply -f /opt/clouds-web/k8s/ingress.yaml

# 4. 设置 iptables 端口转发
echo "🔌 Configuring iptables port forwarding..."
echo 1 > /proc/sys/net/ipv4/ip_forward
echo "net.ipv4.ip_forward = 1" >> /etc/sysctl.conf
sysctl -p

# 清空旧规则（如果存在）
iptables -t nat -D PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 30080 2>/dev/null || true

# 添加新规则
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 30080

# 保存规则
if ! command -v iptables-save &> /dev/null; then
  apt-get update
  apt-get install -y iptables-persistent
fi
iptables-save > /etc/iptables/rules.v4

echo "✅ iptables rules configured and saved"

# 5. 验证配置
echo ""
echo "=== Verification ==="
echo "✓ Traefik pods:"
kubectl get pods -n traefik

echo ""
echo "✓ Traefik service:"
kubectl get svc -n traefik

echo ""
echo "✓ IngressRoute resources:"
kubectl get ingressroute -A

echo ""
echo "✓ iptables rules:"
iptables -t nat -L PREROUTING | grep 80

echo ""
echo "✅ Setup complete!"
echo ""
echo "You can now access your application at:"
echo "  http://YOUR_ECS_IP"
echo ""
echo "Traefik Dashboard (optional):"
echo "  kubectl port-forward -n traefik svc/traefik 9000:9000"
echo "  Then access: http://localhost:9000/dashboard"
