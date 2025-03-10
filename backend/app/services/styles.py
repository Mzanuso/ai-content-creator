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
        return [Style(**style_data) for style_data in styles_data]

    @staticmethod
    async def get_style_categories() -> List[StyleCategory]:
        """Get all style categories with counts."""
        # Get all styles (we need to aggregate on client side)
        styles_data = FirebaseService.get_documents(COLLECTION_NAME)
        
        # Extract and count categories
        categories_dict = {}
        for style in styles_data:
            category = style.get("category")
            if category:
                if category not in categories_dict:
                    categories_dict[category] = {
                        "name": category,
                        "description": "",  # Could be stored elsewhere
                        "count": 1
                    }
                else:
                    categories_dict[category]["count"] += 1
        
        # Convert to list of StyleCategory objects
        return [StyleCategory(**cat_data) for cat_data in categories_dict.values()]

    @staticmethod
    async def get_recommended_styles(count: int = 10) -> List[Style]:
        """Get recommended styles (could be based on popularity, quality, etc.)."""
        # In a real app, this would likely use more sophisticated logic
        # For now, we'll just grab recent styles
        styles_data = FirebaseService.get_documents(
            COLLECTION_NAME,
            order_by=[("createdAt", "desc")],
            limit=count
        )
        
        # Convert to Style objects
        return [Style(**style_data) for style_data in styles_data]

    @staticmethod
    async def search_styles(query: str, limit: int = 50) -> List[Style]:
        """
        Search styles by name, description, or keywords.
        Note: Due to limitations of Firestore, this implementation is simplified.
        For full-text search, consider integrating Algolia or similar services.
        """
        # Get all styles (limited to a reasonable number)
        styles_data = FirebaseService.get_documents(
            COLLECTION_NAME,
            limit=100  # Limiting to avoid performance issues
        )
        
        # Filter client-side
        query = query.lower()
        filtered_styles = []
        
        for style in styles_data:
            # Check name and description
            if (query in style.get("name", "").lower() or 
                query in style.get("description", "").lower()):
                filtered_styles.append(style)
                continue
            
            # Check keywords
            keywords = style.get("recommendedKeywords", [])
            if any(query in keyword.lower() for keyword in keywords):
                filtered_styles.append(style)
                continue
            
            # Check tags
            tags = style.get("tags", [])
            if any(query in tag.lower() for tag in tags):
                filtered_styles.append(style)
                continue
        
        # Limit results
        filtered_styles = filtered_styles[:limit]
        
        # Convert to Style objects
        return [Style(**style_data) for style_data in filtered_styles]

    @staticmethod
    async def import_style_from_analysis(
        sref_code: str, 
        analysis_data: Dict[str, Any]
    ) -> Style:
        """
        Import a new style from an analysis file format.
        
        The analysis_data is expected to contain sections like:
        - PATTERN_ANALYSIS
        - CREATIVE_INTERPRETATION
        - CATEGORY
        - SUBCATEGORY
        - KEYWORDS
        - RGB
        """
        # Extract data from analysis
        category = analysis_data.get("CATEGORY", "")
        subcategory = analysis_data.get("SUBCATEGORY", "")
        
        # Extract keywords
        keywords = []
        if "KEYWORDS" in analysis_data:
            # The format seems to be a list of numbered keywords
            keyword_data = analysis_data["KEYWORDS"]
            if isinstance(keyword_data, list):
                keywords = [k for k in keyword_data if isinstance(k, str) and k]
            elif isinstance(keyword_data, str):
                # Attempt to parse from string format if needed
                pass
        
        # Extract RGB colors
        rgb_colors = []
        if "RGB" in analysis_data:
            rgb_data = analysis_data["RGB"]
            if isinstance(rgb_data, list):
                rgb_colors = [c for c in rgb_data if isinstance(c, str) and c]
            elif isinstance(rgb_data, str):
                # Attempt to parse from string format if needed
                pass
        
        # Create style data
        style_data = {
            "name": f"Style {sref_code}",
            "description": analysis_data.get("CREATIVE_INTERPRETATION", ""),
            "category": category,
            "tags": [subcategory] if subcategory else [],
            "previewUrl": f"/styles/{sref_code}/preview.jpg",  # Assumed path
            "exampleUrls": [f"/styles/{sref_code}/example_{i}.jpg" for i in range(1, 4)],
            "recommendedKeywords": keywords
        }
        
        # Create style
        style = StyleCreate(srefCode=sref_code, **style_data)
        return await StyleService.create_style(style)
