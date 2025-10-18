import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from pydantic import (
    BaseModel,
    Field,
    ConfigDict,
    field_validator,
    model_validator,
)
from app.core.exceptions import ValidationError
from app.models.task_model import TaskStatus, Priority


class TaskBase(BaseModel):
    """Base schema for tasks."""

    title: str = Field(
        ...,
        min_length=2,
        max_length=50,
        description="Task's title",
        examples=["Eat medicine"],
    )
    description: str = Field(
        ...,
        min_length=2,
        max_length=10000,
        description="Task's description",
        examples=["Eat medicine at 4pm"],
    )
    priority: Priority = Field(..., description="Task's priority", examples=["low"])
    status: TaskStatus = Field(..., description="Task's status", examples=["completed"])

    @field_validator("title", "description")
    @classmethod
    def validate_text_fields(cls, v: str) -> str:
        """Validate and clean text fields."""
        v = " ".join(v.strip().split())
        if not v:
            raise ValidationError("Text fields cannot be empty or whitespace")
        return v


class TaskCreate(TaskBase):
    """Schema for creating a task."""

    pass


class TaskUpdate(BaseModel):
    """Schema for updating a task."""

    title: Optional[str] = Field(
        None,
        min_length=2,
        max_length=50,
        description="Task's title",
        examples=["Eat medicine"],
    )
    description: Optional[str] = Field(
        None,
        min_length=2,
        max_length=10000,
        description="Task's description",
        examples=["Eat medicine at 4pm"],
    )
    priority: Optional[Priority] = Field(
        None, description="Task's priority", examples=["low"]
    )
    status: Optional[TaskStatus] = Field(
        None, description="Task's status", examples=["completed"]
    )

    @field_validator("title", "description")
    @classmethod
    def validate_text_fields(cls, v: str) -> str:
        """Validate and clean text fields."""
        v = " ".join(v.strip().split())
        if not v:
            raise ValidationError("Text fields cannot be empty or whitespace")
        return v

    @model_validator(mode="before")
    @classmethod
    def validate_at_least_one_field(cls, values: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure at least one field is provided for update."""
        if isinstance(values, dict) and not any(v is not None for v in values.values()):
            raise ValidationError("At least one field must be provided for update")
        return values


class TaskResponse(TaskBase):
    """Response schema for a task."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(..., description="Task ID")
    user_id: uuid.UUID = Field(..., description="User ID")
    created_at: datetime = Field(..., description="Task creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")


class TaskListResponse(BaseModel):
    """Response for paginated user list."""

    items: List[TaskResponse] = Field(..., description="List of tasks")
    total: int = Field(..., ge=0, description="Total number of tasks")
    page: int = Field(..., ge=1, description="Current page number")
    pages: int = Field(..., ge=0, description="Total number of pages")
    size: int = Field(..., ge=1, le=100, description="Number of items per page")

    @property
    def has_next(self) -> bool:
        """Check if there's a next page."""
        return self.page < self.pages

    @property
    def has_previous(self) -> bool:
        """Check if there's a previous page."""
        return self.page > 1


class TaskSearchParams(BaseModel):
    """Parameters for searching users."""

    search: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        description="Search in title",
    )
    priority: Optional[Priority] = Field(None, description="Task's priority")
    status: Optional[TaskStatus] = Field(None, description="Task's Status")
    created_after: Optional[date] = Field(
        None, description="Filter users created after this date"
    )
    created_before: Optional[date] = Field(
        None, description="Filter users created before this date"
    )

    @field_validator("search")
    @classmethod
    def clean_search(cls, v: Optional[str]) -> Optional[str]:
        """Clean up search query."""
        return v.strip() if v else v

    @model_validator(mode="after")
    def validate_date_range(self) -> "TaskSearchParams":
        """Ensure date range is valid."""
        if self.created_after and self.created_before:
            if self.created_after > self.created_before:
                raise ValidationError("created_after must be before created_before")
        return self


__all__ = [
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserListResponse",
    "UserSearchParams",
    "TaskBase",
    "TaskCreate",
    "TaskUpdate",
    "TaskResponse",
    "TaskListResponse",
    "TaskSearchParams",
]
