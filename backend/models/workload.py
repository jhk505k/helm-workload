from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Optional
from datetime import date


class ProjectHours(BaseModel):
    project_id: str
    project_name: str
    hours: float


class WorkloadBase(BaseModel):
    user_id: str
    week_start: date
    total_hours: float = 0.0
    utilization_rate: float = 0.0  # 0.0 to 1.0+
    tasks_count: int = 0
    projects: List[ProjectHours] = Field(default_factory=list)


class WorkloadCreate(WorkloadBase):
    pass


class Workload(WorkloadBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(__import__('uuid').uuid4()))


class UserCapacity(BaseModel):
    user_id: str
    user_name: str
    total_assigned_hours: float
    available_capacity: float  # hours per week (default 40)
    utilization_rate: float
    status: str  # available, busy, overloaded
    current_tasks: int
    upcoming_deadlines: int


class TeamCapacityAnalysis(BaseModel):
    week_start: date
    total_capacity: float
    total_allocated: float
    team_utilization: float
    members: List[UserCapacity]
    overloaded_members: List[str]
    available_members: List[str]
