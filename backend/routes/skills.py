from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from motor.motor_asyncio import AsyncIOMotorClient

from models import Skill, SkillCreate, SkillUpdate, SkillMatch
from middleware import get_current_user, CurrentUser
from utils import DatabaseHelper, validate_user_exists, get_user_by_id

import os

# Database connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'gslab')]

router = APIRouter(prefix="/api/skills", tags=["Skills"])


@router.get("/user/{user_id}", response_model=List[Skill])
async def get_user_skills(
    user_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Get all skills for a user"""
    
    # Validate user exists
    await validate_user_exists(db, user_id)
    
    skills = await db.skills.find({"user_id": user_id}, {"_id": 0}).to_list(length=None)
    
    return skills


@router.post("/user/{user_id}", response_model=Skill, status_code=status.HTTP_201_CREATED)
async def add_user_skill(
    user_id: str,
    skill_data: SkillCreate,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Add a skill to a user"""
    
    # Validate user exists
    await validate_user_exists(db, user_id)
    
    # Check if skill already exists
    existing = await db.skills.find_one(
        {"user_id": user_id, "skill_name": skill_data.skill_name},
        {"_id": 0}
    )
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has this skill"
        )
    
    # Create skill
    skill = Skill(**skill_data.model_dump())
    
    # Insert
    doc = skill.model_dump()
    await db.skills.insert_one(doc)
    
    return skill


@router.put("/user/{user_id}/skill/{skill_id}", response_model=Skill)
async def update_user_skill(
    user_id: str,
    skill_id: str,
    skill_data: SkillUpdate,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Update a user's skill"""
    
    # Check skill exists
    existing = await DatabaseHelper.find_one_or_404(
        db.skills,
        {"id": skill_id, "user_id": user_id},
        "Skill not found"
    )
    
    # Prepare update data
    update_data = {k: v for k, v in skill_data.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")
    
    # Update in database
    await db.skills.update_one(
        {"id": skill_id, "user_id": user_id},
        {"$set": update_data}
    )
    
    # Fetch updated skill
    updated_skill = await db.skills.find_one({"id": skill_id}, {"_id": 0})
    
    return updated_skill


@router.delete("/user/{user_id}/skill/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_skill(
    user_id: str,
    skill_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Delete a user's skill"""
    
    # Check skill exists
    await DatabaseHelper.find_one_or_404(
        db.skills,
        {"id": skill_id, "user_id": user_id},
        "Skill not found"
    )
    
    # Delete skill
    await db.skills.delete_one({"id": skill_id, "user_id": user_id})
    
    return None


@router.get("/match/{task_id}", response_model=List[SkillMatch])
async def match_skills_for_task(
    task_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Find users whose skills match a task's requirements"""
    
    # Get task
    task = await DatabaseHelper.find_one_or_404(
        db.tasks,
        {"id": task_id},
        "Task not found"
    )
    
    required_skills = task.get("skills_required", [])
    
    if not required_skills:
        return []
    
    # Get all users with skills
    all_skills = await db.skills.find({}, {"_id": 0}).to_list(length=None)
    
    # Group by user
    user_skills = {}
    for skill in all_skills:
        user_id = skill["user_id"]
        if user_id not in user_skills:
            user_skills[user_id] = []
        user_skills[user_id].append(skill)
    
    matches = []
    
    for user_id, skills in user_skills.items():
        user_skill_names = [s["skill_name"].lower() for s in skills]
        required_lower = [s.lower() for s in required_skills]
        
        # Find matched and missing skills
        matched = [s for s in required_skills if s.lower() in user_skill_names]
        missing = [s for s in required_skills if s.lower() not in user_skill_names]
        
        # Calculate match score
        match_score = len(matched) / len(required_skills) if required_skills else 0
        
        if match_score > 0:  # Only include users with at least one matching skill
            # Get user info
            user = await get_user_by_id(db, user_id)
            
            if user:
                # Calculate average proficiency
                matched_skill_objs = [s for s in skills if s["skill_name"] in matched]
                proficiency_map = {"beginner": 1, "intermediate": 2, "expert": 3}
                avg_proficiency = sum(proficiency_map.get(s["proficiency"], 2) for s in matched_skill_objs) / len(matched_skill_objs) if matched_skill_objs else 2
                
                if avg_proficiency < 1.5:
                    proficiency_level = "beginner"
                elif avg_proficiency < 2.5:
                    proficiency_level = "intermediate"
                else:
                    proficiency_level = "expert"
                
                matches.append(SkillMatch(
                    user_id=user_id,
                    user_name=user.get("name", user.get("email", "Unknown")),
                    matched_skills=matched,
                    missing_skills=missing,
                    match_score=round(match_score, 2),
                    proficiency_level=proficiency_level,
                    availability="available"  # TODO: Check actual availability
                ))
    
    # Sort by match score (highest first)
    matches.sort(key=lambda x: x.match_score, reverse=True)
    
    return matches
