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
        """Get all unique style categories with counts."""
        # Get all styles
        styles_data = FirebaseService.get_documents(COLLECTION_NAME)
        
        # Group by category and count
        categories_dict = {}
        for style in styles_data:
            category = style.get("category", "Uncategorized")
            if category in categories_dict:
                categories_dict[category]["count"] += 1
            else:
                categories_dict[category] = {
                    "name": category,
                    "count": 1,
                    "description": ""  # Could be updated with actual descriptions if available
                }
        
        # Convert to list of StyleCategory objects
        return [StyleCategory(**data) for data in categories_dict.values()]
    
    @staticmethod
    async def get_recommended_styles(limit: int = 10) -> List[Style]:
        """Get recommended styles based on popularity or editorial selection."""
        # This is a simplified implementation
        # In a real app, you might want to implement more sophisticated recommendation logic
        styles_data = FirebaseService.get_documents(
            COLLECTION_NAME,
            # Example: You could have a 'recommended' or 'featured' field in your styles
            where_clauses=[("recommended", "==", True)],
            limit=limit
        )
        
        if not styles_data:
            # Fallback to just returning some styles
            styles_data = FirebaseService.get_documents(
                COLLECTION_NAME,
                limit=limit
            )
        
        return [Style(**style_data) for style_data in styles_data]
    
    @staticmethod
    async def search_styles_by_keywords(keywords: List[str], limit: int = 20) -> List[Style]:
        """
        Search styles that match any of the given keywords.
        Note: This is a simplified implementation that would work better with
        a dedicated search service like Algolia.
        """
        if not keywords:
            return []
        
        # Get all styles - in a real app with many styles, this would be inefficient
        all_styles = await StyleService.list_styles(limit=1000)
        
        # Filter styles that match any keyword
        keywords_lower = [k.lower() for k in keywords]
        matched_styles = []
        
        for style in all_styles:
            # Check if any of the style's keywords match the search keywords
            style_keywords = [k.lower() for k in (style.recommendedKeywords or [])]
            style_tags = [t.lower() for t in (style.tags or [])]
            
            if any(k in keywords_lower for k in style_keywords) or \
               any(t in keywords_lower for t in style_tags) or \
               any(k in style.name.lower() for k in keywords_lower) or \
               (style.description and any(k in style.description.lower() for k in keywords_lower)):
                matched_styles.append(style)
            
            if len(matched_styles) >= limit:
                break
        
        return matched_styles
    
    @staticmethod
    async def import_style_from_analysis(
        sref_code: str,
        analysis_data: Dict[str, Any],
        preview_url: str
    ) -> Style:
        """
        Import a style from an analysis file like the one shown in the example.
        
        Parameters:
            sref_code: The reference code for the style (e.g., "sref_96616859_001")
            analysis_data: The parsed content of the analysis file
            preview_url: URL to the preview image for this style
            
        Returns:
            The created Style object
        """
        # Extract relevant data from the analysis
        category = analysis_data.get("CATEGORY", "").replace("_", "/")
        subcategory = analysis_data.get("SUBCATEGORY", "")
        
        # Extract keywords
        keywords = []
        for i in range(1, 21):  # Keywords 1-20
            key = str(i)
            if key in analysis_data.get("KEYWORDS", {}):
                keyword = analysis_data["KEYWORDS"][key]
                if keyword and keyword.strip():
                    keywords.append(keyword.strip())
        
        # Extract color palette
        color_palette = []
        for i in range(26, 31):  # RGB values 26-30
            key = str(i)
            if key in analysis_data.get("KEYWORDS", {}):
                color_info = analysis_data["KEYWORDS"][key]
                if color_info and "RGB(" in color_info:
                    # Extract just the RGB value
                    rgb_part = color_info.split(" - ")[0].strip()
                    color_palette.append(rgb_part)
        
        # Extract social media caption
        social_media = ""
        if "23" in analysis_data.get("KEYWORDS", {}):
            social_media = analysis_data["KEYWORDS"]["23"]
        
        # Create style data
        style_data = StyleCreate(
            srefCode=sref_code,
            name=f"Style {sref_code}",
            description=analysis_data.get("CREATIVE_INTERPRETATION", ""),
            category=category,
            tags=[subcategory] + keywords[:10],  # Use top 10 keywords as tags
            previewUrl=preview_url,
            exampleUrls=[preview_url],
            recommendedKeywords=keywords
        )
        
        # Create style
        return await StyleService.create_style(style_data)
