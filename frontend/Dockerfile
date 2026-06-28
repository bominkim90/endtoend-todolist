# ── 1단계: 빌드 스테이지 ──────────────────────────────────────────────
# Next.js 앱을 standalone 모드로 빌드 (런타임 이미지 크기 최소화)
FROM node:20-alpine AS builder

WORKDIR /app

# 빌드 시점에 주입 — NEXT_PUBLIC_ 변수는 npm run build 때 번들에 포함됨
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# 의존성 캐시 레이어 — 소스보다 자주 바뀌지 않는 파일만 먼저 복사
COPY package.json package-lock.json ./
RUN npm ci

# 전체 소스 복사 후 프로덕션 빌드
COPY . .
RUN npm run build

# ── 2단계: 실행 스테이지 ──────────────────────────────────────────────
# standalone 산출물만 포함한 가벼운 런타임 이미지
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# root가 아닌 전용 사용자로 실행 (컨테이너 보안 기본)
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# standalone 빌드 결과물만 복사 (.next/standalone, .next/static, public)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs:nodejs

EXPOSE 3000

CMD ["node", "server.js"]
