import os

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "FoodSense")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "foodsense-super-secure-secret-key-demo-2026")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./foodsense.db")
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
        ).split(",")
        if origin.strip()
    ]
    DEMO_EMAIL: str = os.getenv("DEMO_EMAIL", "manager@foodsense.lk")
    DEMO_PASSWORD: str = os.getenv("DEMO_PASSWORD", "demo1234")
    DEFAULT_CURRENCY: str = os.getenv("DEFAULT_CURRENCY", "LKR")
    DEFAULT_SAFETY_STOCK_PCT: float = float(os.getenv("DEFAULT_SAFETY_STOCK_PCT", "15.0"))
    DEFAULT_LEAD_TIME_DAYS: int = int(os.getenv("DEFAULT_LEAD_TIME_DAYS", "2"))
    CO2_FACTOR_FOOD_WASTE: float = float(os.getenv("CO2_FACTOR_FOOD_WASTE", "2.5"))

settings = Settings()
