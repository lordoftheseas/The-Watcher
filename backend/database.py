CONNECTION_URI = "postgresql://postgres.ayvkfoagfgnbwglrgznq:[ZzSM7AokYzx7q8Bd]@aws-1-us-east-2.pooler.supabase.com:6543/postgres"
CONNECTION_URI = "postgresql://postgres:[ZzSM7AokYzx7q8Bd]@db.ayvkfoagfgnbwglrgznq.supabase.co:5432/postgres"
CONNECTION_URI = "postgresql://postgres.ayvkfoagfgnbwglrgznq:[ZzSM7AokYzx7q8Bd]@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
from sqlmodel import SQLModel, Field, select
from typing import Optional, List
from sqlmodal import create_engine, Session
from fastapi import FASTAPI
from contextlib import asynccontextmanager

class Item(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    price: float
    is_offer: bool = False

engine = create_engine(CONNECTION_URI, echo=True)

def create_db_and_taken():
    SQLModel.metadata.create_all(engine)

@asynccontextmanager
def lifespan(app: FASTAPI):
    create_db_and_taken()
    yield

app = FASTAPI(lifespan=lifespan)

@app.post("/items")

def create_item(item: Item):
    with Session(engine) as session:
        session.add()
        session.commit()
        session.refresh(item)
        return item

@app.get("/items/", response_model=List[Item])

def read_items():
    with Session(engine) as session:
        items = session.exec(select(Item)).all()
        return items

