from typing import Dict, Any, Optional, List
from itertools import groupby
from operator import itemgetter
import math

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
        
        # Group by category
        categories = {}
        for style in styles_data:
            category = style.get("category", "Uncategorized")
            if category not in categories:
                categories[category] = {
                    "name": category,
                    "count": 0,
                    "description": ""  # This could be fetched from a categories collection
                }
            categories[category]["count"] += 1
        
        # Convert to list of StyleCategory objects
        return [StyleCategory(**cat_data) for cat_data in categories.values()]

    @staticmethod
    async def find_styles_by_keywords(keywords: List[str], limit: int = 10) -> List[Style]:
        """Find styles by keywords."""
        # Get all styles - in a real implementation, this should use a proper search index
        styles_data = FirebaseService.get_documents(COLLECTION_NAME)
        
        # Score each style based on keyword matches
        scored_styles = []
        for style in styles_data:
            score = 0
            style_keywords = style.get("tags", []) + style.get("recommendedKeywords", [])
            
            for keyword in keywords:
                # Check if the keyword exactly matches any of the style's keywords
                if keyword.lower() in [k.lower() for k in style_keywords]:
                    score += 10  # Higher score for exact matches
                
                # Check for partial matches
                for style_keyword in style_keywords:
                    if keyword.lower() in style_keyword.lower():
                        score += 5  # Lower score for partial matches
            
            if score > 0:
                scored_styles.append((style, score))
        
        # Sort by score (descending) and take the top 'limit' styles
        top_styles = sorted(scored_styles, key=lambda x: x[1], reverse=True)[:limit]
        
        # Convert to Style objects
        return [Style(**style_data[0]) for style_data in top_styles]

    @staticmethod
    async def find_styles_by_colors(rgb_colors: List[List[int]], limit: int = 10) -> List[Style]:
        """
        Find styles that match or are close to the provided RGB colors.
        
        Parameters:
            rgb_colors: List of RGB color triplets, e.g., [[255, 0, 0], [0, 255, 0]]
            limit: Maximum number of styles to return
            
        Returns:
            List of Style objects
        """
        # Get all styles
        styles_data = FirebaseService.get_documents(COLLECTION_NAME)
        
        # Score each style based on color similarity
        scored_styles = []
        for style in styles_data:
            score = 0
            style_colors = []
            
            # Extract colors from style data
            # Assuming colors are stored as RGB values in a format like:
            # "colors": ["RGB(255,0,0)", "RGB(0,255,0)"]
            for color_str in style.get("colors", []):
                if color_str.startswith("RGB(") and color_str.endswith(")"):
                    # Extract RGB values
                    rgb_str = color_str[4:-1]
                    try:
                        rgb = [int(val) for val in rgb_str.split(",")]
                        if len(rgb) == 3:
                            style_colors.append(rgb)
                    except ValueError:
                        continue
            
            # If no valid colors found, skip this style
            if not style_colors:
                continue
            
            # Compare each input color with each style color
            for input_color in rgb_colors:
                best_match_distance = float('inf')
                for style_color in style_colors:
                    # Calculate Euclidean distance in RGB space
                    distance = math.sqrt(
                        (input_color[0] - style_color[0]) ** 2 +
                        (input_color[1] - style_color[1]) ** 2 +
                        (input_color[2] - style_color[2]) ** 2
                    )
                    best_match_distance = min(best_match_distance, distance)
                
                # Score inversely proportional to distance (closer = higher score)
                # Max RGB distance is sqrt(255^2 * 3) ≈ 441.7
                score += max(0, 100 - (best_match_distance / 4.417))
            
            # Normalize by number of input colors
            score = score / len(rgb_colors)
            
            if score > 0:
                scored_styles.append((style, score))
        
        # Sort by score (descending) and take the top 'limit' styles
        top_styles = sorted(scored_styles, key=lambda x: x[1], reverse=True)[:limit]
        
        # Convert to Style objects
        return [Style(**style_data[0]) for style_data in top_styles]

    @staticmethod
    async def get_recommended_styles(limit: int = 10) -> List[Style]:
        """Get recommended styles for the gallery."""
        # In a real implementation, this could be based on popularity, featured status, etc.
        styles_data = FirebaseService.get_documents(
            COLLECTION_NAME,
            order_by=[("createdAt", "desc")],  # Newest styles
            limit=limit
        )
        
        return [Style(**style_data) for style_data in styles_data]
