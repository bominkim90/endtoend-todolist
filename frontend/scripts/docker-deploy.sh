#!/usr/bin/env bash
# prod Docker 빌드(+선택 ECR push) — .env.deploy 값 사용
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${FRONTEND_DIR}/.env.deploy"
IMAGE_NAME="todolist-frontend"
DOCKER_PLATFORM="linux/amd64"

usage() {
  cat <<'EOF'
Usage: ./scripts/docker-deploy.sh [--push]

  --push   빌드 후 ECR tag + push (.env.deploy에 AWS_* / ECR_REPOSITORY 필요)

사전 준비:
  cp .env.deploy.example .env.deploy
  # .env.deploy에 NEXT_PUBLIC_API_URL 등 실제 값 입력
EOF
}

DO_PUSH=false
for arg in "$@"; do
  case "$arg" in
    --push) DO_PUSH=true ;;
    -h|--help) usage; exit 0 ;;
    *) echo "알 수 없는 옵션: $arg" >&2; usage; exit 1 ;;
  esac
done

if [[ ! -f "$ENV_FILE" ]]; then
  echo "오류: ${ENV_FILE} 파일이 없습니다." >&2
  echo "  cp .env.deploy.example .env.deploy 후 값을 채워주세요." >&2
  exit 1
fi

# .env.deploy 변수를 현재 셸에 로드
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ -z "${NEXT_PUBLIC_API_URL:-}" ]]; then
  echo "오류: .env.deploy에 NEXT_PUBLIC_API_URL이 필요합니다." >&2
  exit 1
fi

echo "==> Docker build (NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL})"
cd "$FRONTEND_DIR"
docker build \
  --platform "$DOCKER_PLATFORM" \
  --build-arg "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}" \
  -t "${IMAGE_NAME}:latest" \
  .

if [[ "$DO_PUSH" == false ]]; then
  echo "==> 빌드 완료: ${IMAGE_NAME}:latest"
  echo "    ECR push: ./scripts/docker-deploy.sh --push"
  exit 0
fi

for var in AWS_REGION AWS_ACCOUNT_ID ECR_REPOSITORY; do
  if [[ -z "${!var:-}" ]]; then
    echo "오류: --push 시 .env.deploy에 ${var}가 필요합니다." >&2
    exit 1
  fi
done

ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:latest"

echo "==> ECR login"
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin \
    "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "==> Docker tag & push → ${ECR_URI}"
docker tag "${IMAGE_NAME}:latest" "$ECR_URI"
docker push "$ECR_URI"

echo "==> push 완료. ECS 프론트 서비스에서 Force new deployment 하세요."
