from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
from uuid import uuid4


class TaskBase(BaseModel):
    project_id: str
    title: str
    description: Optional[str] = None
    status: str = "open"  # open, in_progress, blocked, completed
    priority: str = "medium"  # low, medium, high
    assignee_ids: List[str] = Field(default_factory=list)
    skills_required: List[str] = Field(default_factory=list)
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    due_date: Optional[datetime] = None
    department: Optional[str] = None
    blocked_reason: Optional[str] = None


class TaskCreate(TaskBase):
    created_by: str


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee_ids: Optional[List[str]] = None
    skills_required: Optional[List[str]] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    due_date: Optional[datetime] = None
    department: Optional[str] = None
    blocked_reason: Optional[str] = None


class TaskAssign(BaseModel):
    assignee_ids: List[str]


class Task(TaskBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid4()))
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
