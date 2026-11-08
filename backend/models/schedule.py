from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
from uuid import uuid4


class ScheduleBase(BaseModel):
    task_id: str
    assignee_id: str
    start_time: datetime
    end_time: datetime
    title: Optional[str] = None
    description: Optional[str] = None
    status: str = "scheduled"  # scheduled, in_progress, completed, cancelled
    has_conflict: bool = False
    conflict_details: Optional[str] = None


class ScheduleCreate(ScheduleBase):
    created_by: str


class ScheduleUpdate(BaseModel):
    task_id: Optional[str] = None
    assignee_id: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    has_conflict: Optional[bool] = None
    conflict_details: Optional[str] = None


class Schedule(ScheduleBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid4()))
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Conflict(BaseModel):
    schedule_ids: List[str]
    assignee_id: str
    conflict_type: str  # time_overlap, capacity_overload, skill_mismatch
    description: str
    severity: str  # low, medium, high
    resolution_suggestions: List[str] = Field(default_factory=list)
