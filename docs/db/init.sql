-- TodoList 프로젝트 DB 초기화 스크립트
-- DB명: TodoListDB
-- 스키마: todolist_db
-- 실행 전 TodoListDB에 접속한 상태여야 합니다

-- 스키마 생성
CREATE SCHEMA IF NOT EXISTS todolist_db;

-- 이후 모든 테이블은 todolist_db 스키마 안에 생성
SET search_path TO todolist_db;

-- =====================
-- users 테이블
-- 소셜 로그인 유저 정보 저장
-- provider: google 또는 kakao
-- provider_id: 소셜 제공자가 부여한 고유 ID
-- =====================
CREATE TABLE IF NOT EXISTS users (
    id             BIGSERIAL PRIMARY KEY,
    email          VARCHAR(255) NOT NULL UNIQUE,
    nickname       VARCHAR(100) NOT NULL,
    provider       VARCHAR(20)  NOT NULL,          -- 'google' | 'kakao'
    provider_id    VARCHAR(255) NOT NULL,
    refresh_token  TEXT,                            -- JWT Refresh Token 저장
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP NOT NULL DEFAULT NOW(),

    -- 같은 소셜 제공자에서 같은 ID가 중복 등록되지 않도록
    CONSTRAINT uq_provider_provider_id UNIQUE (provider, provider_id)
);

-- =====================
-- todos 테이블
-- 투두 항목 저장
-- content: TipTap 에디터의 JSON 데이터를 문자열로 저장
-- =====================
CREATE TABLE IF NOT EXISTS todos (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title         VARCHAR(255) NOT NULL,
    content       TEXT,                             -- TipTap JSON 본문
    is_completed  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- =====================
-- 인덱스
-- 자주 조회되는 컬럼에 인덱스 추가해서 조회 속도 향상
-- =====================

-- 투두 목록 조회 시 user_id로 필터링하므로 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);

-- 소셜 로그인 시 provider + provider_id로 유저 조회하므로 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);

-- =====================
-- updated_at 자동 갱신 트리거
-- UPDATE 시 updated_at을 자동으로 현재 시각으로 갱신
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
