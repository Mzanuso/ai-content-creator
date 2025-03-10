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
        # Get all styles
        styles_data = FirebaseService.get_documents(COLLECTION_NAME)
        
        # Extract categories
        categories = [style.get("category", "Uncategorized") for style in styles_data]
        
        # Count styles per category
        category_counts = {}
        for category in categories:
            if category in category_counts:
                category_counts[category] += 1
            else:
                category_counts[category] = 1
        
        # Convert to StyleCategory objects
        return [
            StyleCategory(name=category, count=count)
            for category, count in category_counts.items()
        ]

    @staticmethod
    async def get_recommended_styles(limit: int = 10) -> List[Style]:
        """Get recommended styles."""
        # In a real implementation, this would use some algorithm
        # to select recommended styles based on user preferences,
        # popular styles, etc. For now, we'll just return the most
        # recently added styles.
        styles_data = FirebaseService.get_documents(
            COLLECTION_NAME,
            order_by=[("createdAt", "desc")],
            limit=limit
        )
        
        return [Style(**style_data) for style_data in styles_data]

    @staticmethod
    async def search_styles_by_keyword(keyword: str, limit: int = 20) -> List[Style]:
        """
        Search styles by keyword.
        Note: Due to limitations of Firestore, this implementation is simplified.
        For full-text search, consider integrating Algolia or similar services.
        """
        # Get all styles (in a real app, this should be paginated)
        styles_data = FirebaseService.get_documents(
            COLLECTION_NAME,
            limit=100  # Limit to prevent loading too many documents
        )
        
        # Filter by keyword (client-side)
        keyword = keyword.lower()
        filtered_styles = []
        
        for style_data in styles_data:
            # Check in name and description
            if (keyword in style_data.get("name", "").lower() or 
                keyword in style_data.get("description", "").lower()):
                filtered_styles.append(style_data)
                continue
            
            # Check in recommended keywords
            if any(keyword in kw.lower() for kw in style_data.get("recommendedKeywords", [])):
                filtered_styles.append(style_data)
                continue
            
            # Check in tags
            if any(keyword in tag.lower() for tag in style_data.get("tags", [])):
                filtered_styles.append(style_data)
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
        Import a style from analysis data (e.g., from a JSON file).
        This is useful for bulk importing styles.
        """
        # Extract data from analysis
        category = analysis_data.get("CATEGORY", "").strip()
        subcategory = analysis_data.get("SUBCATEGORY", "").strip()
        
        # Extract keywords
        keywords = []
        for i in range(1, 21):  # Assuming keywords are numbered 1-20
            key = str(i)
            if key in analysis_data.get("KEYWORDS", {}):
                kw = analysis_data["KEYWORDS"][key].strip()
                if kw:  # Only add non-empty keywords
                    keywords.append(kw)
        
        # Extract RGB colors
        rgb_colors = []
        for i in range(25, 30):  # Assuming RGB colors are numbered 25-29
            key = str(i)
            if key in analysis_data.get("KEYWORDS", {}):
                color = analysis_data["KEYWORDS"][key].strip()
                if color.startswith("RGB"):
                    rgb_colors.append(color)
        
        # Extract social media text
        social_media = analysis_data.get("KEYWORDS", {}).get("23", "").strip()
        
        # Create style data
        style_data = StyleCreate(
            srefCode=sref_code,
            name=f"Style {sref_code}",
            description=analysis_data.get("CREATIVE_INTERPRETATION", ""),
            category=category,
            tags=[subcategory] + keywords[:10],  # Use top 10 keywords as tags
            recommendedKeywords=keywords,
            exampleUrls=[]  # These would need to be added separately
        )
        
        # Create style
        return await StyleService.create_style(style_data)
