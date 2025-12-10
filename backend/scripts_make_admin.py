from app.database import SessionLocal
from app import models

db = SessionLocal()
user = db.query(models.User).filter(models.User.email == "admin@1.com").first()
user.role = models.UserRole.admin
db.commit()
print("Updated role to admin")
