from passlib.context import CryptContext

# Support both bcrypt (if any existing) and pbkdf2_sha256
pwd_context = CryptContext(schemes=["bcrypt", "pbkdf2_sha256"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a plaintext password. Using pbkdf2_sha256 to avoid bcrypt 4+ compatibility issues in passlib."""
    return pwd_context.hash(password, scheme="pbkdf2_sha256")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plaintext password against a stored hash.
    Falls back to direct comparison for plain-text sample data.
    """
    # Check if the stored value is a hash (passlib hashes start with $)
    if hashed_password.startswith("$"):
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception:
            return False
    
    # Fallback: plain-text comparison (for sample/seed data only)
    return plain_password == hashed_password
