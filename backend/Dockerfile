# ── 1단계: 빌드 스테이지 ──────────────────────────────────────────────
# Gradle + JDK 21로 bootJar 생성 (테스트는 이미지 빌드 시 생략)
FROM gradle:9.5.1-jdk21-alpine AS builder

WORKDIR /app

# 의존성 캐시 레이어 — 소스보다 자주 바뀌지 않는 파일만 먼저 복사
COPY gradle/ gradle/
COPY gradlew settings.gradle build.gradle ./
RUN chmod +x gradlew

COPY src/ src/

# bootJar와 plain jar가 함께 생성되므로 실행용 jar만 분리
RUN ./gradlew bootJar --no-daemon -x test \
    && cp "$(find build/libs -maxdepth 1 -name '*.jar' ! -name '*-plain.jar')" /app/app.jar

# ── 2단계: 실행 스테이지 ──────────────────────────────────────────────
# 가벼운 JRE 21 이미지로 실행 (빌드 도구·소스는 포함하지 않음)
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# root가 아닌 전용 사용자로 실행 (컨테이너 보안 기본)
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# 빌드 스테이지에서 분리해 둔 실행 가능 jar만 복사
COPY --from=builder /app/app.jar app.jar

# application.yml 기본값: SERVER_PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
