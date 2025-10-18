import logging
import uuid

from typing import Dict
from fastapi import APIRouter, Depends, status

from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.config import settings
from app.schemas.task_schema import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
)
from app.models.user_model import User
from app.db.session import get_session
from app.utils.deps import (
    get_current_user,
    rate_limit_api,
)
from app.services.task_service import task_service

logger = logging.getLogger(__name__)

router = APIRouter(
    tags=["Task"],
    prefix=f"{settings.API_V1_STR}/tasks",
)


@router.get(
    "/{task_id}",
    status_code=status.HTTP_200_OK,
    response_model=TaskResponse,
    summary="Get task details",
    description="Get task information by it's ID",
    dependencies=[Depends(rate_limit_api)],
)
async def get_task_by_id(
    task_id: uuid.UUID,
    *,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Fetch a task details by it's ID"""

    task = await task_service.get_task_by_id(
        db=db, current_user=current_user, task_id=task_id
    )

    return task


@router.post(
    "/",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a task",
    description="Create a task for authenticated user",
    dependencies=[Depends(rate_limit_api)],
)
async def create_task(
    *,
    task_data: TaskCreate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Create a task, only for authenticated user"""

    task = await task_service.create_task(
        db=db, current_user=current_user, task_dict=task_data
    )

    return task


@router.patch(
    "/{task_id}",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a task",
    description="Update a task for authenticated user",
    dependencies=[Depends(rate_limit_api)],
)
async def update_task(
    task_id: uuid.UUID,
    *,
    task_data: TaskUpdate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Update a task, only for authenticated user"""

    update_task = await task_service.update_task(
        db=db, task_data=task_data, task_id_to_update=task_id, current_user=current_user
    )

    return update_task


@router.delete(
    "/{task_id}",
    response_model=Dict[str, str],
    status_code=status.HTTP_200_OK,
    summary="Delete a task",
    description="Delete a task for authenticated user",
    dependencies=[Depends(rate_limit_api)],
)
async def delete_task(
    task_id: uuid.UUID,
    *,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Update a task, only for authenticated user"""

    await task_service.delete_task(
        db=db, task_id_to_delete=task_id, current_user=current_user
    )

    return {"message": "Task deleted successfully."}
