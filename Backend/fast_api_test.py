# main.py
from fastapi import FastAPI

# Create app instance
app = FastAPI()

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to FastAPI!"}

# Example with path and query parameters
@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "query": q}

# Example POST with validation
from pydantic import BaseModel

class User(BaseModel):
    name: str
    email: str

@app.post("/user")
def create_user(user: User):
    return {"message": f"User {user.name} created!", "email": user.email}
