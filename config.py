"""
=============================================================================
MEDI TRACK – Integrated Patient Care Management System
Configuration Module
=============================================================================
"""

import os
from datetime import timedelta

class Config:
    """Base application configuration."""
    SECRET_KEY = os.getenv("SECRET_KEY", "meditrack-super-secret-production-key-2026")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "meditrack-jwt-token-signing-secret-2026")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=12)
    
    # Hospital Identity & Billing Configurations
    HOSPITAL_NAME = "MEDI TRACK MULTISPECIALITY HOSPITAL"
    HOSPITAL_TAGLINE = "NABH Accredited Integrated Patient Care & Research Centre"
    HOSPITAL_ADDRESS = "No. 1, Hospital Road, 100 Feet Bypass, Vadapalani, Chennai - 600026, Tamil Nadu, India"
    HOSPITAL_PHONE = "+91 44 2483 3444 / +91 44 2483 4555"
    HOSPITAL_EMERGENCY = "1066 / +91 44 2483 9999"
    HOSPITAL_EMAIL = "care@meditrack.in"
    HOSPITAL_WEBSITE = "https://www.meditrack.in"
    HOSPITAL_GSTIN = "33AAACM1234F1Z8"
    HOSPITAL_NABH_REG = "NABH/HOSP/2026/TN/0942"
    
    # Database Settings (Default: SQLite for instant fallback, MySQL for production)
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
    MYSQL_USER = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
    MYSQL_DB = os.getenv("MYSQL_DB", "meditrack_db")
    
    # SQLite local DB fallback file
    SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), "database", "meditrack.sqlite")
    USE_SQLITE = os.getenv("USE_SQLITE", "true").lower() in ("true", "1", "yes")
    
    # Pagination
    ITEMS_PER_PAGE = 20
