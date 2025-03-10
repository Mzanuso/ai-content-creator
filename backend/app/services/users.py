from typing import Dict, Any, Optional, List
from firebase_admin import auth

from .firebase import FirebaseService
from app.schemas.users import UserCreate, UserUpdate, User

COLLECTION_NAME = "users"


class UserService:
    """Service for user operations."""

    @staticmethod
    async def get_user(user_id: str) -> Optional[User]:
        """Get a user by ID."""
        user_data = FirebaseService.get_document(COLLECTION_NAME, user_id)
        if not user_data:
            return None
        return User(id=user_id, **user_data)

    @staticmethod
    async def get_user_by_email(email: str) -> Optional[User]:
        """Get a user by email."""
        users = FirebaseService.get_documents(
            COLLECTION_NAME, 
            where_clauses=[("email", "==", email)],
            limit=1
        )
        if not users:
            return None
        return User(**users[0])

    @staticmethod
    async def create_user(user_data: UserCreate) -> User:
        """Create a new user."""
        # Create user in Firebase Auth
        try:
            firebase_auth_user = auth.create_user(
                email=user_data.email,
                password=user_data.password,
                display_name=user_data.displayName or "",
                disabled=False
            )
        except auth.EmailAlreadyExistsError:
            raise ValueError("Email already in use")
        
        # Prepare user data for Firestore
        user_id = firebase_auth_user.uid
        user_dict = {
            "email": user_data.email,
            "displayName": user_data.displayName or "",
            "photoURL": user_data.photoURL or "",
            "subscription": "free",
            "credits": 100,
        }
        
        # Add user to Firestore
        FirebaseService.add_document(COLLECTION_NAME, user_dict)
        
        # Return user object
        return User(id=user_id, **user_dict)

    @staticmethod
    async def update_user(user_id: str, user_data: UserUpdate) -> Optional[User]:
        """Update a user."""
        # Check if user exists
        existing_user = await UserService.get_user(user_id)
        if not existing_user:
            return None
        
        # Prepare update data
        update_data = user_data.dict(exclude_unset=True)
        
        # If displayName is updated, also update in Auth
        if "displayName" in update_data:
            auth.update_user(
                user_id, 
                display_name=update_data["displayName"]
            )
        
        # Update in Firestore
        FirebaseService.update_document(COLLECTION_NAME, user_id, update_data)
        
        # Get and return updated user
        return await UserService.get_user(user_id)

    @staticmethod
    async def delete_user(user_id: str) -> bool:
        """Delete a user."""
        # Delete from Firebase Auth
        auth.delete_user(user_id)
        
        # Delete from Firestore
        return FirebaseService.delete_document(COLLECTION_NAME, user_id)

    @staticmethod
    async def list_users(limit: int = 100, offset: int = 0) -> List[User]:
        """List users with pagination."""
        users_data = FirebaseService.get_documents(
            COLLECTION_NAME,
            order_by=[("createdAt", "desc")],
            limit=limit
        )
        return [User(**user_data) for user_data in users_data]

    @staticmethod
    async def update_user_credits(user_id: str, credits_change: int) -> bool:
        """
        Update user credits by adding or subtracting the specified amount.
        
        Parameters:
            user_id: The user ID
            credits_change: The amount to change (positive to add, negative to subtract)
            
        Returns:
            True if successful, False otherwise
        """
        # Get current user
        user = await UserService.get_user(user_id)
        if not user:
            return False
        
        # Calculate new credits amount
        new_credits = user.credits + credits_change
        
        # Ensure credits don't go below zero
        if new_credits < 0:
            return False
        
        # Update user
        FirebaseService.update_document(COLLECTION_NAME, user_id, {"credits": new_credits})
        return True
