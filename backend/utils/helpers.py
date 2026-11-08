from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any


def calculate_utilization_rate(assigned_hours: float, capacity_hours: float = 40.0) -> float:
    """Calculate utilization rate (0.0 to 1.0+)"""
    if capacity_hours == 0:
        return 0.0
    return round(assigned_hours / capacity_hours, 2)


def get_utilization_status(utilization_rate: float) -> str:
    """Get status based on utilization rate"""
    if utilization_rate < 0.7:
        return "available"
    elif utilization_rate <= 1.0:
        return "busy"
    else:
        return "overloaded"


def get_week_start(date_obj: datetime = None) -> datetime:
    """Get the start of the week (Monday) for a given date"""
    if date_obj is None:
        date_obj = datetime.now(timezone.utc)
    
    # Get the start of the week (Monday)
    start = date_obj - timedelta(days=date_obj.weekday())
    return start.replace(hour=0, minute=0, second=0, microsecond=0)


def check_time_overlap(start1: datetime, end1: datetime, start2: datetime, end2: datetime) -> bool:
    """Check if two time ranges overlap"""
    return start1 < end2 and end1 > start2


def calculate_hours_between(start: datetime, end: datetime) -> float:
    """Calculate hours between two datetimes"""
    if start >= end:
        return 0.0
    delta = end - start
    return round(delta.total_seconds() / 3600, 2)


def format_time_slot(start: datetime, end: datetime) -> str:
    """Format time slot as readable string"""
    return f"{start.strftime('%A %H:%M')} - {end.strftime('%H:%M')}"


def get_priority_score(priority: str) -> int:
    """Convert priority string to numeric score"""
    priority_map = {
        "low": 1,
        "medium": 2,
        "high": 3,
    }
    return priority_map.get(priority.lower(), 2)
