from .projects import router as projects_router
from .tasks import router as tasks_router
from .schedules import router as schedules_router
from .skills import router as skills_router
from .workload import router as workload_router

__all__ = [
    "projects_router",
    "tasks_router",
    "schedules_router",
    "skills_router",
    "workload_router",
]
