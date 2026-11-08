from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
from uuid import uuid4


class ProjectBase(BaseModel):
    name: str
    client_name: Optional[str] = None
    description: Optional[str] = None
    status: str = "planning"  # planning, active, completed, on_hold
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    budget_hours: Optional[float] = None
    owner_id: str
    team_ids: List[str] = Field(default_factory=list)


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    client_name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    budget_hours: Optional[float] = None
    owner_id: Optional[str] = None
    team_ids: Optional[List[str]] = None


class Project(ProjectBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Computed fields (not stored)
    total_tasks: Optional[int] = 0
    completed_tasks: Optional[int] = 0
    team_utilization: Optional[float] = 0.0
