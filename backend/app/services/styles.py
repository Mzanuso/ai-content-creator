from typing import Dict, Any, Optional, List
from itertools import groupby
from operator import itemgetter

from .firebase import FirebaseService
from app.schemas.styles import StyleCreate, StyleUpdate, Style, StyleCategory

COLLECTION_NAME = "styles"


class StyleService:
    """Service for style operations."""

    @staticmethod
    async def get_style(sref_code: str) -> Optional[Style]:
        """Get a style by SREF code."""
        style_data = FirebaseService.get_document(COLLECTION_NAME, sref_code)
        if not style_data:
            return None
        return Style(srefCode=sref_code, **style_data)

    @staticmethod
    async def create_style(style_data: StyleCreate) -> Style:
        """Create a new style."""
        # Get sref_code from the data
        sref_code = style_data.srefCode
        
        # Convert Pydantic model to dict
        style_dict = style_data.dict(exclude={"srefCode"})
        
        # Add to Firebase with the sref_code as the document ID
        FirebaseService.add_document(COLLECTION_NAME, style_dict, doc_id=sref_code)
        
        # Return created style
        return Style(srefCode=sref_code, **style_dict)

    @staticmethod
    async def update_style(sref_code: str, style_data: StyleUpdate) -> Optional[Style]:
        """Update a style."""
        # Check if style exists
        existing_style = await StyleService.get_style(sref_code)
        if not existing_style:
            return None
        
        # Convert Pydantic model to dict, excluding unset values
        update_data = style_data.dict(exclude_unset=True)
        
        # Update in Firebase
        FirebaseService.update_document(COLLECTION_NAME, sref_code, update_data)
        
        # Get and return updated style
        return await StyleService.get_style(sref_code)

    @staticmethod
    async def delete_style(sref_code: str) -> bool:
        """Delete a style."""
        return FirebaseService.delete_document(COLLECTION_NAME, sref_code)

    @staticmethod
    async def list_styles(
        category: Optional[str] = None,
        tag: Optional[str] = None,
        limit: int = 100
    ) -> List[Style]:
        """List styles with optional filtering by category or tag."""
        # Setup where clauses
        where_clauses = []
        if category:
            where_clauses.append(("category", "==", category))
        if tag:
            where_clauses.append(("tags", "array_contains", tag))
        
        # Get styles
        styles_data = FirebaseService.get_documents(
            COLLECTION_NAME,
            where_clauses=where_clauses,
            order_by=[("name", "asc")],
            limit=limit
        )
        
        # Convert to Style objects
        return [Style(srefCode=data.get("id"), **data) for data in styles_data]

    @staticmethod
    async def get_style_categories() -> List[StyleCategory]:
        """Get all style categories with counts."""
        # Get all styles
        styles_data = FirebaseService.get_documents(COLLECTION_NAME)
        
        # Extract categories and count
        categories = {}
        for style in styles_data:
            category = style.get("category")
            if not category:
                continue
            
            if category not in categories:
                categories[category] = {
                    "name": category,
                    "description": "",  # Description could be added if available
                    "count": 0
                }
            categories[category]["count"] += 1
        
        # Convert to list of StyleCategory objects
        return [StyleCategory(**cat_data) for cat_data in categories.values()]

    @staticmethod
    async def get_recommended_styles(count: int = 5) -> List[Style]:
        """Get recommended styles (could be based on various criteria)."""
        # For now, just return the most recently added styles
        # In a real implementation, this could be based on popularity, etc.
        styles_data = FirebaseService.get_documents(
            COLLECTION_NAME,
            order_by=[("createdAt", "desc")],
            limit=count
        )
        
        # Convert to Style objects
        return [Style(srefCode=data.get("id"), **data) for data in styles_data]

    @staticmethod
    async def search_styles_by_keyword(keyword: str, limit: int = 20) -> List[Style]:
        """
        Search styles by keyword.
        Note: This is a simplified implementation. For better search capabilities,
        consider integrating a dedicated search service like Algolia.
        """
        # Get all styles first (not efficient for large datasets)
        styles_data = FirebaseService.get_documents(COLLECTION_NAME)
        
        # Filter by keyword (case-insensitive)
        keyword = keyword.lower()
        filtered_styles = []
        
        for style in styles_data:
            # Check if keyword is in the name
            if keyword in style.get("name", "").lower():
                filtered_styles.append(style)
                continue
            
            # Check if keyword is in the description
            if keyword in style.get("description", "").lower():
                filtered_styles.append(style)
                continue
                
            # Check if keyword matches any tags
            tags = style.get("tags", [])
            if any(keyword in tag.lower() for tag in tags):
                filtered_styles.append(style)
                continue
                
            # Check if keyword matches any recommendedKeywords
            recommended_keywords = style.get("recommendedKeywords", [])
            if any(keyword in rec_keyword.lower() for rec_keyword in recommended_keywords):
                filtered_styles.append(style)
                continue
        
        # Limit the results
        filtered_styles = filtered_styles[:limit]
        
        # Convert to Style objects
        return [Style(srefCode=data.get("id"), **data) for data in filtered_styles]

    @staticmethod
    async def import_style_from_json(sref_code: str, json_data: Dict[str, Any]) -> Style:
        """
        Import a style from JSON data.
        Expected format:
        {
            "PATTERN_ANALYSIS": "...",
            "CREATIVE_INTERPRETATION": "...",
            "CATEGORY": "...",
            "SUBCATEGORY": "...",
            "KEYWORDS": ["..."],
            "RGB": ["RGB(255,128,0)", "RGB(255,165,0)", ...],
            "SOCIAL_MEDIA": "..."
        }
        """
        # Extract data from JSON
        style_data = {
            "name": f"Style {sref_code}",  # Default name using SREF code
            "description": json_data.get("CREATIVE_INTERPRETATION", ""),
            "category": json_data.get("CATEGORY", ""),
            "tags": [json_data.get("SUBCATEGORY", "")] if json_data.get("SUBCATEGORY") else [],
            "previewUrl": "",  # Will need to be set separately
            "recommendedKeywords": json_data.get("KEYWORDS", []),
            "patternAnalysis": json_data.get("PATTERN_ANALYSIS", ""),
            "colorPalette": json_data.get("RGB", []),
            "socialMediaText": json_data.get("SOCIAL_MEDIA", "")
        }
        
        # Create style in Firebase
        style_dict = {k: v for k, v in style_data.items() if v}  # Remove empty values
        FirebaseService.add_document(COLLECTION_NAME, style_dict, doc_id=sref_code)
        
        # Return created style
        return Style(srefCode=sref_code, **style_dict)
