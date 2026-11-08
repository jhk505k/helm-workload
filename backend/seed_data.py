"""
Seed data script for Helm HR Ops
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone, timedelta
from uuid import uuid4
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
DB_NAME = os.environ.get('DB_NAME', 'helm_hr_ops')

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]


async def create_test_users():
    """Create test users if they don't exist"""
    print("\n1. Creating test users...")
    
    users = [
        {"id": "user_001", "email": "alice@gslab.com", "name": "Alice Chen", "role": "developer"},
        {"id": "user_002", "email": "bob@gslab.com", "name": "Bob Martinez", "role": "designer"},
        {"id": "user_003", "email": "carol@gslab.com", "name": "Carol Williams", "role": "developer"},
        {"id": "user_004", "email": "david@gslab.com", "name": "David Kim", "role": "manager"}
    ]
    
    for user in users:
        existing = await db.users.find_one({"id": user["id"]})
        if not existing:
            await db.users.insert_one(user)
            print(f"   Created user: {user['name']}")
        else:
            print(f"   User exists: {user['name']}")
    
    return [u["id"] for u in users]


async def create_projects(user_ids):
    """Create sample projects"""
    print("\n2. Creating projects...")
    
    projects = [
        {
            "id": str(uuid4()),
            "name": "Website Redesign",
            "client_name": "Acme Corp",
            "description": "Complete overhaul of company website",
            "status": "active",
            "start_date": datetime.now(timezone.utc).isoformat(),
            "end_date": (datetime.now(timezone.utc) + timedelta(days=90)).isoformat(),
            "budget_hours": 200,
            "owner_id": user_ids[3],
            "team_ids": user_ids[:3],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    project_ids = []
    for project in projects:
        await db.projects.insert_one(project)
        project_ids.append(project["id"])
        print(f"   Created project: {project['name']}")
    
    return project_ids


async def create_tasks(project_ids, user_ids):
    """Create sample tasks"""
    print("\n3. Creating tasks...")
    
    tasks = [
        {
            "id": str(uuid4()),
            "project_id": project_ids[0],
            "title": "Design homepage mockup",
            "description": "Create high-fidelity mockup in Figma",
            "status": "open",
            "priority": "high",
            "assignee_ids": [],
            "skills_required": ["UI Design", "Figma"],
            "estimated_hours": 8,
            "due_date": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "department": "Design",
            "created_by": user_ids[3],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid4()),
            "project_id": project_ids[0],
            "title": "Build React component library",
            "description": "Create reusable components for the website",
            "status": "open",
            "priority": "high",
            "assignee_ids": [],
            "skills_required": ["React", "TypeScript", "CSS"],
            "estimated_hours": 16,
            "due_date": (datetime.now(timezone.utc) + timedelta(days=14)).isoformat(),
            "department": "Engineering",
            "created_by": user_ids[3],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    task_ids = []
    for task in tasks:
        await db.tasks.insert_one(task)
        task_ids.append(task["id"])
        print(f"   Created task: {task['title']}")
    
    return task_ids


async def create_skills(user_ids):
    """Create sample skills for users"""
    print("\n4. Creating user skills...")
    
    skills = [
        {"id": str(uuid4()), "user_id": user_ids[0], "skill_name": "React", "proficiency": "expert", "years_experience": 5},
        {"id": str(uuid4()), "user_id": user_ids[0], "skill_name": "TypeScript", "proficiency": "expert", "years_experience": 4},
        {"id": str(uuid4()), "user_id": user_ids[1], "skill_name": "UI Design", "proficiency": "expert", "years_experience": 6},
        {"id": str(uuid4()), "user_id": user_ids[1], "skill_name": "Figma", "proficiency": "expert", "years_experience": 5},
        {"id": str(uuid4()), "user_id": user_ids[1], "skill_name": "CSS", "proficiency": "expert", "years_experience": 7},
        {"id": str(uuid4()), "user_id": user_ids[2], "skill_name": "Python", "proficiency": "expert", "years_experience": 6},
    ]
    
    for skill in skills:
        await db.skills.insert_one(skill)
    
    print(f"   Created {len(skills)} skills")


async def main():
    """Main seed function"""
    print("=" * 60)
    print("Helm HR Ops - Seed Data Script")
    print("=" * 60)
    
    try:
        user_ids = await create_test_users()
        project_ids = await create_projects(user_ids)
        task_ids = await create_tasks(project_ids, user_ids)
        await create_skills(user_ids)
        
        print("\n" + "=" * 60)
        print("Seed data created successfully!")
        print("=" * 60)
        
        print(f"\nUsers: {len(user_ids)}")
        print(f"Projects: {len(project_ids)}")
        print(f"Tasks: {len(task_ids)}")
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(main())
