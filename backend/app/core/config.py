from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "Apotheka API"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Neon: pooled string for the app, direct string reserved for Alembic
    DATABASE_URL: str
    DATABASE_URL_DIRECT: str | None = None

    REDIS_URL: str = "redis://localhost:6379/0"

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    AI_SERVICE_URL: str = "http://localhost:8001"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
