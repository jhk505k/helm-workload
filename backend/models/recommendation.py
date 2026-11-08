from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Optional, Any
from datetime import datetime, timezone
from uuid import uuid4


class ImpactMetrics(BaseModel):
    utilization_change: Optional[float] = None
    overtime_reduction: Optional[float] = None
    skill_match: Optional[float] = None
    availability_fit: Optional[float] = None
    estimated_completion: Optional[str] = None


class BeforeAfterState(BaseModel):
    assignee: str
    time_slot: str
    workload: str
    utilization_rate: float


class RecommendationDetails(BaseModel):
    current_state: BeforeAfterState
    proposed_state: BeforeAfterState
    impact: ImpactMetrics
    reasoning: List[str] = Field(default_factory=list)
    data_sources: List[str] = Field(default_factory=list)


class RecommendationBase(BaseModel):
    type: str  # assignment, schedule, resolution
    task_id: Optional[str] = None
    title: str
    reason: str
    recommended_assignee: Optional[str] = None
    recommended_time_slot: Optional[str] = None
    confidence: float  # 0.0 to 1.0
    badge: str  # Schedule, Assignment, Optimization
    details: Optional[RecommendationDetails] = None
    alternative_options: List[Dict[str, Any]] = Field(default_factory=list)


class RecommendationCreate(RecommendationBase):
    generated_by: str  # user_id who triggered generation


class Recommendation(RecommendationBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid4()))
    status: str = "pending"  # pending, applied, dismissed
    generated_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    applied_at: Optional[datetime] = None
    applied_by: Optional[str] = None
