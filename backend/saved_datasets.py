import os

from dotenv import load_dotenv
from sqlalchemy import Column, DateTime, Integer, String, Text, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.sql import func

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    # Render (and most hosts) give a single postgresql:// URL - SQLAlchemy
    # needs the +psycopg2 driver suffix to pick the right dialect.
    DB_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)
else:
    DB_URL = (
        f"postgresql+psycopg2://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )

engine = create_engine(DB_URL)
Session = sessionmaker(bind=engine)
Base = declarative_base()

class SavedDataset(Base):
    __tablename__ = "saved_datasets"

    id = Column(Integer, primary_key=True)
    source = Column(String(255))
    title = Column(String(255))
    subtitle = Column(Text)
    file_type = Column(String(255))
    license = Column(String(255))
    url = Column(String(500), unique=True)
    saved_at = Column(DateTime, server_default=func.now())

Base.metadata.create_all(engine)

def save_dataset(dataset):
    session = Session()
    try:
        if session.query(SavedDataset).filter_by(url=dataset["url"]).first():
            return
        session.add(SavedDataset(**dataset))
        session.commit()
    finally:
        session.close()

def delete_dataset(url):
    session = Session()
    try:
        session.query(SavedDataset).filter_by(url=url).delete()
        session.commit()
    finally:
        session.close()

def get_saved_datasets():
    session = Session()
    try:
        rows = session.query(SavedDataset).all()
        return [
            {
                "source": row.source,
                "title": row.title,
                "subtitle": row.subtitle,
                "file_type": row.file_type,
                "license": row.license,
                "url": row.url,
            }
            for row in rows
        ]
    finally:
        session.close()