from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, List, Optional, Any
from datetime import datetime


class DatabaseHelper:
    """Helper functions for MongoDB operations"""
    
    @staticmethod
    def serialize_datetime(doc: Dict[str, Any]) -> Dict[str, Any]:
        """Convert datetime objects to ISO strings for MongoDB storage"""
        if not doc:
            return doc
        
        serialized = doc.copy()
        for key, value in serialized.items():
            if isinstance(value, datetime):
                serialized[key] = value.isoformat()
            elif isinstance(value, list):
                serialized[key] = [
                    item.isoformat() if isinstance(item, datetime) else item
                    for item in value
                ]
        return serialized
    
    @staticmethod
    def deserialize_datetime(doc: Dict[str, Any], fields: List[str]) -> Dict[str, Any]:
        """Convert ISO strings back to datetime objects"""
        if not doc:
            return doc
        
        deserialized = doc.copy()
        for field in fields:
            if field in deserialized and isinstance(deserialized[field], str):
                try:
                    deserialized[field] = datetime.fromisoformat(deserialized[field])
                except (ValueError, AttributeError):
                    pass
        return deserialized
    
    @staticmethod
    async def find_one_or_404(collection, query: Dict[str, Any], error_msg: str = "Resource not found"):
        """Find one document or raise 404 error"""
        from fastapi import HTTPException, status
        
        doc = await collection.find_one(query, {"_id": 0})
        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error_msg)
        return doc
    
    @staticmethod
    async def check_exists(collection, query: Dict[str, Any]) -> bool:
        """Check if document exists"""
        doc = await collection.find_one(query, {"_id": 0})
        return doc is not None


async def get_user_by_id(db: AsyncIOMotorDatabase, user_id: str) -> Optional[Dict[str, Any]]:
    """Get user from GSLAB's users collection"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    return user


async def get_users_by_ids(db: AsyncIOMotorDatabase, user_ids: List[str]) -> List[Dict[str, Any]]:
    """Get multiple users by IDs"""
    if not user_ids:
        return []
    
    users = await db.users.find({"id": {"$in": user_ids}}, {"_id": 0}).to_list(length=None)
    return users


async def validate_user_exists(db: AsyncIOMotorDatabase, user_id: str) -> bool:
    """Validate that user exists in GSLAB"""
    from fastapi import HTTPException, status
    
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
    return True
