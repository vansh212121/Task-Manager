# app/services/user_service.py
"""
User service module.

This module provides the business logic layer for user operations,
handling authorization, validation, and orchestrating repository calls.
"""
import logging
from typing import Optional, Dict, Any
import uuid

from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import datetime, timezone
from app.crud.user_crud import user_repository
from app.crud.task_crud import task_repository
from app.schemas.task_schema import (
    TaskCreate,
    TaskListResponse,
    TaskResponse,
    TaskUpdate,
)
from app.models.user_model import User
from app.models.task_model import Task
from app.services.cache_service import cache_service
from app.core.exception_utils import raise_for_status
from app.core.exceptions import (
    ResourceNotFound,
    NotAuthorized,
    ValidationError,
)

logger = logging.getLogger(__name__)


class TaskService:
    """Handles all task-related business logic."""

    def __init__(self):
        """
        Initializes the TaskService.
        This version has no arguments, making it easy for FastAPI to use,
        while still allowing for dependency injection during tests.
        """
        self.task_repository = task_repository
        self.user_repository = user_repository
        self._logger = logging.getLogger(f"{__name__}.{self.__class__.__name__}")

    def _check_authorization(
        self, *, current_user: User, target_task: Task, action: str
    ) -> None:
        """
        Central authorization check. An admin can do anything.
        A non-admin can only perform actions on their own account.

        Args:
            current_user: The user performing the action
            target_task: The task being acted upon
            action: Description of the action for error messages

        Raises:
            NotAuthorized: If user lacks permission for the action
        """

        is_not_self = str(current_user.id) != str(target_task.user_id)
        raise_for_status(
            condition=is_not_self,
            exception=NotAuthorized,
            detail=f"You are not authorized to {action} this task.",
        )

    async def _load_user_schema_from_db(
        self, *, db: AsyncSession, task_id: uuid.UUID
    ) -> Optional[TaskResponse]:
        """Private helper to load a task from the DB and convert it to a Pydantic schema.
        This is our "loader" function for the cache."""

        task_model = await self.task_repository.get(db=db, obj_id=task_id)
        raise_for_status(
            condition=task_model is None,
            exception=ResourceNotFound,
            detail=f"Task with {task_id} not Found.",
            resource_type="Task",
        )
        return TaskResponse.model_validate(task_model)

    async def get_task_by_id(
        self, db: AsyncSession, *, task_id: uuid.UUID, current_user: User
    ) -> Optional[TaskResponse]:
        """Retrieve task by it's ID"""
        # Fine-grained authorization check
        task = await cache_service.get_or_set(
            schema_type=TaskResponse,
            obj_id=task_id,
            loader=lambda: self._load_user_schema_from_db(db=db, task_id=task_id),
            ttl=300,  # Cache for 5 minutes
        )

        if str(current_user.id) != str(task.user_id):
            raise NotAuthorized("You are not authorized to view this task.")

        self._logger.debug(f"Task {task_id} retrieved by user {current_user.id}")
        return task

    async def get_all_user_tasks(
        self,
        db: AsyncSession,
        *,
        current_user: User,
        skip: int = 0,
        limit: int = 50,
        filters: Optional[Dict[str, Any]] = None,
        order_by: str = "created_at",
        order_desc: bool = True,
    ) -> TaskListResponse:
        """
        Lists appliances with pagination and filtering.

        Args:
            db: Database session
            current_user: User making the request
            skip: Number of records to skip
            limit: Maximum number of records to return
            filters: Optional filters to apply
            order_by: Field to order by
            order_desc: Whether to order in descending order

        Returns:
            UserApplianceListResponse: Paginated list of users

        Raises:
            NotAuthorized: If user lacks permission to list users
            ValidationError: If pagination parameters are invalid
        """
        # Input validation
        if skip < 0:
            raise ValidationError("Skip parameter must be non-negative")
        if limit <= 0 or limit > 100:
            raise ValidationError("Limit must be between 1 and 100")

        # Delegate fetching to the repository
        tasks, total = await self.task_repository.get_all(
            db=db,
            skip=skip,
            limit=limit,
            user_id=current_user.id,
            filters=filters,
            order_by=order_by,
            order_desc=order_desc,
        )

        # Calculate pagination info
        page = (skip // limit) + 1
        total_pages = (total + limit - 1) // limit  # Ceiling division

        # Construct the response schema
        response = TaskListResponse(
            items=tasks, total=total, page=page, pages=total_pages, size=limit
        )

        return response

    async def create_task(
        self, db: AsyncSession, *, task_dict: TaskCreate, current_user: User
    ) -> Task:
        """
        Handles the business logic of creating a new task.
        """

        # 2. Prepare the user model
        task_dict = task_dict.model_dump()
        task_dict["user_id"] = current_user.id
        task_dict["created_at"] = datetime.now(timezone.utc)
        task_dict["updated_at"] = datetime.now(timezone.utc)

        task_to_create = Task(**task_dict)

        # 3. Delegate creation to the repository
        new_task = await self.task_repository.create(db=db, db_obj=task_to_create)
        self._logger.info(f"New task created: {new_task.title}")

        return new_task

    async def update_task(
        self,
        db: AsyncSession,
        *,
        task_id_to_update: uuid.UUID,
        task_data: TaskUpdate,
        current_user: User,
    ) -> Task:
        """Updates a task after performing necessary authorization checks."""

        task_to_update = await self.task_repository.get(db=db, obj_id=task_id_to_update)
        raise_for_status(
            condition=(task_to_update is None),
            exception=ResourceNotFound,
            detail=f"Task with id {task_id_to_update} not Found",
            resource_type="Task",
        )

        self._check_authorization(
            current_user=current_user, target_task=task_to_update, action="update"
        )

        update_dict = task_data.model_dump(exclude_unset=True, exclude_none=True)

        # Remove timestamp fields that should not be manually updated
        for ts_field in {"created_at", "updated_at"}:
            update_dict.pop(ts_field, None)

        updated_task = await self.task_repository.update(
            db=db,
            task=task_to_update,
            fields_to_update=update_dict,
        )

        await cache_service.invalidate(Task, task_id_to_update)

        self._logger.info(
            f"Task {task_id_to_update} updated by {current_user.id}",
            extra={
                "updated_task_id": task_id_to_update,
                "updater_id": current_user.id,
                "updated_fields": list(update_dict.keys()),
            },
        )
        return updated_task

    async def delete_task(
        self, db: AsyncSession, *, task_id_to_delete: uuid.UUID, current_user: User
    ) -> Dict[str, str]:
        """
        Permanently deletes a task.

        Args:
            db: Database session
            task_id_to_delete: ID of task to delete
            current_user: User making the request

        Returns:
            Dict with success message

        Raises:
            ResourceNotFound: If task doesn't exist
        """
        # Input validation

        # 1. Fetch the task to delete
        task_to_delete = await self.task_repository.get(db=db, obj_id=task_id_to_delete)
        raise_for_status(
            condition=(task_to_delete is None),
            exception=ResourceNotFound,
            detail=f"Task with id {task_id_to_delete} not Found",
            resource_type="Task",
        )

        # 2. Perform authorization check
        self._check_authorization(
            current_user=current_user,
            target_task=task_to_delete,
            action="delete",
        )

        # 3. Perform the deletion
        await self.task_repository.delete(db=db, obj_id=task_id_to_delete)

        # 4. Clean up cache and tokens
        await cache_service.invalidate(Task, task_id_to_delete)

        self._logger.warning(
            f"Task {task_id_to_delete} permanently deleted by {current_user.id}",
            extra={
                "deleted_task_id": task_id_to_delete,
                "deleter_id": current_user.id,
                "deleted_task_title": task_to_delete.title,
            },
        )


task_service = TaskService()
