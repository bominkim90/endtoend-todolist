# TodoList — GitHub Actions CI/CD

> 상위 문서: `00_개요-2.md` · 인프라: `03_인프라-2.md`

---

## 1. 목적

`main` 브랜치에 push하면 **수동 배포와 동일한 흐름**을 GitHub Actions가 자동 실행한다.

```
git push (main)
  → GitHub Actions
  → Docker build
  → ECR push
  → ECS Force new deployment
```

로컬에서 `./scripts/docker-deploy.sh --push` 하던 작업을 **CI가 대신** 하는 구조다.

---

## 2. 수동 배포 vs 자동 배포

| 구분 | 수동 (로컬) | 자동 (GitHub Actions) |
|------|-------------|------------------------|
| 트리거 | 터미널에서 스크립트 실행 | `main` push |
| 환경값 | `frontend/.env.deploy`, `backend/.env.deploy` | GitHub **Secrets / Variables** |
| Docker 빌드 | 로컬 Mac (`linux/amd64`) | GitHub 러너 (`ubuntu-latest`) |
| ECR push | `docker push` | 동일 |
| ECS 반영 | 콘솔 Force new deployment | `aws ecs update-service --force-new-deployment` |

> `.env.deploy`는 git에 올리지 않는다. CI에서는 GitHub Secrets/Variables로 같은 값을 주입한다.

---

## 3. 전체 아키텍처

```
[개발자 PC]
    git push
        ↓
[GitHub Repository]
    .github/workflows/*.yml
        ↓
[GitHub Actions Runner]
    docker build → docker push
        ↓
[AWS ECR]
    todolist-frontend / todolist-backend
        ↓
[AWS ECS Fargate]
    todolist-e2e-cluster
    ├── todolist-frontend-service
    └── todolist-backend-service
        ↓
[ALB + CloudFront]
```

---

## 4. 사전 준비

### 4-1. AWS 리소스 (이미 있어야 함)

| 리소스 | 이름 (예시) |
|--------|-------------|
| ECR 리포지토리 | `todolist-frontend`, `todolist-backend` |
| ECS 클러스터 | `todolist-e2e-cluster` |
| ECS 서비스 (프론트) | `todolist-frontend-service` |
| ECS 서비스 (백엔드) | `todolist-backend-service` |
| 리전 | `ap-northeast-2` |

### 4-2. IAM 사용자 (GitHub Actions 전용)

콘솔 액세스 **없음**, 프로그램용 Access Key만 발급.

**필요 권한 (최소)**

- ECR: 이미지 push (`GetAuthorizationToken`, `BatchCheckLayerAvailability`, `PutImage`, `InitiateLayerUpload` 등)
- ECS: 서비스 재배포 (`UpdateService`, `DescribeServices`)

정책은 리포지토리·클러스터 단위로 제한하는 것이 좋다. 학습 단계에서는 관리형 정책 `AmazonEC2ContainerRegistryPowerUser` + ECS update 권한을 붙이는 방식도 가능하다.

### 4-3. GitHub Secrets / Variables

**Repository → Settings → Secrets and variables → Actions**

#### Secrets (민감 정보)

| 이름 | 설명 |
|------|------|
| `AWS_ACCESS_KEY_ID` | GitHub Actions용 IAM Access Key |
| `AWS_SECRET_ACCESS_KEY` | IAM Secret Key |

#### Variables (노출돼도 되는 설정값)

| 이름 | 예시 값 | 설명 |
|------|---------|------|
| `AWS_REGION` | `ap-northeast-2` | 리전 |
| `AWS_ACCOUNT_ID` | `123456789012` | 12자리 계정 ID |
| `ECS_CLUSTER` | `todolist-e2e-cluster` | 클러스터 이름 |
| `ECS_SERVICE_FRONTEND` | `todolist-frontend-service` | 프론트 서비스 이름 |
| `ECS_SERVICE_BACKEND` | `todolist-backend-service` | 백엔드 서비스 이름 |
| `ECR_REPOSITORY_FRONTEND` | `todolist-frontend` | 프론트 ECR 리포지토리 |
| `ECR_REPOSITORY_BACKEND` | `todolist-backend` | 백엔드 ECR 리포지토리 |
| `NEXT_PUBLIC_API_URL` | `https://d3lyifkuf269i2.cloudfront.net` | 프론트 빌드 시 백엔드 **공개 URL** (CloudFront HTTPS, `/` 없이) |

> `NEXT_PUBLIC_API_URL`은 **ALB 주소가 아니라 백엔드 CloudFront URL**이어야 한다.

**ECS Task Definition (백엔드 런타임 env, GitHub Variables 아님)**

| 이름 | prod 예시 |
|------|-----------|
| `OAUTH_REDIRECT_URI` | `https://d3lyifkuf269i2.cloudfront.net/login/oauth2/code/google` |

> Google Console 승인된 리디렉션 URI와 **완전히 동일**해야 한다. `https` 포함.

---

## 5. 워크플로 파일 구조 (예정)

```
.github/workflows/
├── frontend-deploy.yml   # frontend/** 변경 시
└── backend-deploy.yml    # backend/** 변경 시
```

처음에는 path filter 없이 `main` push마다 둘 다 배포해도 된다. 이후 `paths`로 분리한다.

---

## 6. 워크플로 동작 상세

### 6-1. 백엔드 (`backend-deploy.yml`)

1. `actions/checkout` — 소스 체크아웃
2. `aws-actions/configure-aws-credentials` — AWS 인증
3. `aws-actions/amazon-ecr-login` — ECR 로그인
4. `docker build --platform linux/amd64` — `backend/Dockerfile`
5. `docker tag` / `docker push` — `:latest` 태그
6. `aws ecs update-service --force-new-deployment` — ECS 재배포

백엔드는 DB·JWT·OAuth 등 **런타임 env**를 ECS Task Definition에서 주입한다. Docker 빌드 시 별도 build-arg는 없다.

### 6-2. 프론트엔드 (`frontend-deploy.yml`)

백엔드와 동일하되, 빌드 시 **반드시** 아래를 넣는다.

```bash
docker build --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API_URL=${{ vars.NEXT_PUBLIC_API_URL }} \
  -t todolist-frontend .
```

`NEXT_PUBLIC_*`는 **빌드 타임**에 JS 번들에 박힌다. ECS Task env만 바꿔서는 프론트 API 주소가 바뀌지 않는다.

### 6-3. 트리거 예시 (path filter)

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
      - '.github/workflows/backend-deploy.yml'
```

---

## 7. ECS 배포 시 주의사항

### 7-1. ECR push ≠ ECS 자동 반영

push 후 **반드시** `update-service --force-new-deployment`가 필요하다. 워크플로 마지막 단계에 포함한다.

### 7-2. 상태 검사 유예 기간 (Health check grace period)

백엔드 Spring Boot 기동에 **50초~2분** 걸릴 수 있다.

| 설정 | 권장 |
|------|------|
| ECS 서비스 **상태 검사 유예 기간** | **120~180초** |
| Target Group `/health` | 경로·포트(8080)·200 확인 |

유예 기간이 `0`이면 새 Task가 기동 중 unhealthy → **배포 롤백**될 수 있다.

### 7-3. 프론트 CloudFront 캐시

프론트 배포 후 JS가 캐시되면 옛 `NEXT_PUBLIC_API_URL`이 남을 수 있다. 필요 시 프론트 CloudFront에서 `/*` invalidation.

---

## 8. 로컬 스크립트와의 관계

| 파일 | 용도 |
|------|------|
| `frontend/scripts/docker-deploy.sh` | 로컬 수동 빌드·push (`.env.deploy` 사용) |
| `backend/scripts/docker-deploy.sh` | 동일 |
| `frontend/.env.deploy.example` | 로컬용 템플릿 (git 포함) |
| `frontend/.env.deploy` | 로컬 실제 값 (git 제외) |

CI가 붙으면 **일상 배포는 push만** 하고, 로컬 스크립트는 **긴급·디버그용**으로 둔다.

---

## 9. 첫 CI/CD 성공 체크리스트

- [ ] IAM 사용자 생성 + Access Key 발급
- [ ] GitHub Secrets (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) 등록
- [ ] GitHub Variables (리전, 계정 ID, ECS 클러스터/서비스, `NEXT_PUBLIC_API_URL`) 등록
- [ ] `.github/workflows/` 워크플로 파일 추가
- [ ] `main` push → Actions 탭에서 워크플로 성공 확인
- [ ] ECR Images `Pushed at` 시간 갱신 확인
- [ ] ECS Deployments `COMPLETED` (롤백 아님) 확인
- [ ] 백엔드 `/health` 200, 프론트 CloudFront 접속·Google 로그인 테스트

---

## 10. 트러블슈팅

| 증상 | 확인 |
|------|------|
| Actions에서 ECR login 실패 | Secrets 키·리전 |
| push 성공했는데 앱 안 바뀜 | ECS Force new deployment 실행 여부 |
| ECS 롤백 | grace period, Target Group `/health`, CloudWatch 로그 |
| Google `redirect_uri_mismatch` | `NEXT_PUBLIC_API_URL`이 백엔드 CloudFront인지, 백엔드 `forward-headers-strategy` 배포 여부 |
| 프론트만 옛 API URL | 프론트 재빌드·재배포, CloudFront invalidation |

---

## 11. 이후 개선 (선택)

| 항목 | 설명 |
|------|------|
| OIDC | Access Key 대신 `aws-actions/configure-aws-credentials` + IAM Role (더 안전) |
| 이미지 태그 | `:latest` 대신 `git sha` 태그로 추적 |
| path filter | 변경된 레이어만 배포 |
| 배포 대기 | `aws ecs wait services-stable` 로 워크플로에서 완료까지 대기 |
| Terraform | 인프라 코드화 후 CI와 분리 |

---

## 12. 관련 문서

- `03_인프라-2.md` — ECR, ECS, ALB, CloudFront
- `01_프론트엔드.md` — `NEXT_PUBLIC_API_URL`, Docker standalone
- `02_백엔드.md` — ECS Task env, OAuth 흐름
