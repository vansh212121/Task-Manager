# app/models/task_model.py
import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING
from sqlalchemy import Enum as SAEnum
from sqlalchemy import func, Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import (
    UUID as PG_UUID,
)
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .user_model import User


class TaskStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"


class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class TaskBase(SQLModel):

    title: str = Field(sa_column=Column(String(100), index=True, nullable=False))
    description: str = Field(sa_column=Column(Text, nullable=False))
    priority: Priority = Field(
        sa_column=Column(SAEnum(Priority), nullable=False, index=True),
        default=Priority.LOW,
    )
    status: TaskStatus = Field(
        sa_column=Column(SAEnum(TaskStatus), nullable=False, index=True),
        default=TaskStatus.PENDING,
    )


class Task(TaskBase, table=True):
    __tablename__ = "tasks"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(
            PG_UUID(as_uuid=True),
            server_default=func.gen_random_uuid(),
            primary_key=True,
            index=True,
            nullable=False,
        ),
    )

    user_id: uuid.UUID = Field(foreign_key="users.id", index=True, nullable=False)

    # Timestamps
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), nullable=False
        )
    )
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False,
        )
    )

    # Relationship
    user: "User" = Relationship(back_populates="tasks")

    # --- Computed properties (data-focused) ---
    def __repr__(self) -> str:
        return f"<Task(id='{self.id}', user_id='{self.user_id}')>"
