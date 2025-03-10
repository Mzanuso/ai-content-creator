from typing import Dict, Any, Optional, List
from datetime import datetime

from .firebase import FirebaseService
from app.schemas.projects import ProjectCreate, ProjectUpdate, Project, StyleData, Screenplay, StoryboardImage, Production

COLLECTION_NAME = "projects"


class ProjectService:
    """Service for project operations."""

    @staticmethod
    async def get_project(project_id: str) -> Optional[Project]:
        """Get a project by ID."""
        project_data = FirebaseService.get_document(COLLECTION_NAME, project_id)
        if not project_data:
            return None
        return Project(id=project_id, **project_data)

    @staticmethod
    async def create_project(project_data: ProjectCreate) -> Project:
        """Create a new project."""
        # Convert Pydantic model to dict
        project_dict = project_data.dict()
        
        # Set initial values
        project_dict["status"] = "draft"
        project_dict["styleData"] = StyleData().dict()
        project_dict["screenplay"] = Screenplay().dict()
        project_dict["storyboard"] = []
        project_dict["production"] = Production().dict()
        
        # Add to Firebase
        project_id = FirebaseService.add_document(COLLECTION_NAME, project_dict)
        
        # Return created project
        return Project(id=project_id, **project_dict)

    @staticmethod
    async def update_project(project_id: str, project_data: ProjectUpdate) -> Optional[Project]:
        """Update a project."""
        # Check if project exists
        existing_project = await ProjectService.get_project(project_id)
        if not existing_project:
            return None
        
        # Convert Pydantic model to dict, excluding unset values
        update_data = project_data.dict(exclude_unset=True)
        
        # Update in Firebase
        FirebaseService.update_document(COLLECTION_NAME, project_id, update_data)
        
        # Get and return updated project
        return await ProjectService.get_project(project_id)

    @staticmethod
    async def delete_project(project_id: str) -> bool:
        """Delete a project."""
        return FirebaseService.delete_document(COLLECTION_NAME, project_id)

    @staticmethod
    async def get_user_projects(user_id: str, status: Optional[str] = None, limit: int = 50) -> List[Project]:
        """Get all projects for a user, with optional filtering by status."""
        # Setup where clauses
        where_clauses = [("userId", "==", user_id)]
        if status:
            where_clauses.append(("status", "==", status))
        
        # Get projects
        projects_data = FirebaseService.get_documents(
            COLLECTION_NAME,
            where_clauses=where_clauses,
            order_by=[("updatedAt", "desc")],
            limit=limit
        )
        
        # Convert to Project objects
        return [Project(**project_data) for project_data in projects_data]

    @staticmethod
    async def update_project_style(project_id: str, style_data: StyleData) -> Optional[Project]:
        """Update the style data of a project."""
        # Update style data
        FirebaseService.update_document(
            COLLECTION_NAME, 
            project_id, 
            {
                "styleData": style_data.dict(),
                "status": "in-progress"  # Update status
            }
        )
        
        # Return updated project
        return await ProjectService.get_project(project_id)

    @staticmethod
    async def update_project_screenplay(project_id: str, screenplay: Screenplay) -> Optional[Project]:
        """Update the screenplay of a project."""
        # Update screenplay
        FirebaseService.update_document(
            COLLECTION_NAME, 
            project_id, 
            {
                "screenplay": screenplay.dict(),
                "status": "in-progress"  # Update status
            }
        )
        
        # Return updated project
        return await ProjectService.get_project(project_id)

    @staticmethod
    async def update_project_storyboard(project_id: str, storyboard: List[StoryboardImage]) -> Optional[Project]:
        """Update the storyboard of a project."""
        # Update storyboard
        FirebaseService.update_document(
            COLLECTION_NAME, 
            project_id, 
            {
                "storyboard": [image.dict() for image in storyboard],
                "status": "in-progress"  # Update status
            }
        )
        
        # Return updated project
        return await ProjectService.get_project(project_id)

    @staticmethod
    async def update_project_production(project_id: str, production: Production) -> Optional[Project]:
        """Update the production data of a project."""
        # Update production data
        FirebaseService.update_document(
            COLLECTION_NAME, 
            project_id, 
            {
                "production": production.dict(),
                "status": "completed"  # Update status to completed when production is added
            }
        )
        
        # Return updated project
        return await ProjectService.get_project(project_id)

    @staticmethod
    async def search_projects(
        user_id: str,
        query: str,
        status: Optional[str] = None,
        limit: int = 50
    ) -> List[Project]:
        """
        Search projects by title or description.
        Note: Due to limitations of Firestore, this implementation is simplified.
        For full-text search, consider integrating Algolia or similar services.
        """
        # Get all user projects
        projects = await ProjectService.get_user_projects(user_id, status, limit)
        
        # Filter by query (client-side)
        if query:
            query = query.lower()
            return [
                p for p in projects
                if query in p.title.lower() or (p.description and query in p.description.lower())
            ]
        
        return projects
