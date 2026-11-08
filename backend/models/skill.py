from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import date


class SkillBase(BaseModel):
    user_id: str
    skill_name: str
    proficiency: str = "intermediate"  # beginner, intermediate, expert
    years_experience: Optional[float] = None
    certifications: List[str] = Field(default_factory=list)
    last_used: Optional[date] = None


class SkillCreate(SkillBase):
    pass


class SkillUpdate(BaseModel):
    skill_name: Optional[str] = None
    proficiency: Optional[str] = None
    years_experience: Optional[float] = None
    certifications: Optional[List[str]] = None
    last_used: Optional[date] = None


class Skill(SkillBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(__import__('uuid').uuid4()))


class SkillMatch(BaseModel):
    user_id: str
    user_name: str
    matched_skills: List[str]
    missing_skills: List[str]
    match_score: float  # 0.0 to 1.0
    proficiency_level: str
    availability: str
