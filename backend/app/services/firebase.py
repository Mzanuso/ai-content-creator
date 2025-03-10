import json
import os
import firebase_admin
from firebase_admin import credentials, auth, firestore, storage
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List

from app.core.config import settings

# Initialize Firebase Admin SDK
cred = None

if settings.firebase_credentials:
    cred = credentials.Certificate(settings.firebase_credentials)
elif os.path.exists(settings.FIREBASE_SERVICE_ACCOUNT_PATH):
    cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
else:
    # Try to initialize with the app running in a Firebase environment
    try:
        cred = credentials.ApplicationDefault()
    except Exception as e:
        print(f"Failed to initialize Firebase: {e}")
        raise

firebase_app = firebase_admin.initialize_app(
    cred,
    {
        'projectId': settings.FIREBASE_PROJECT_ID,
        'storageBucket': f"{settings.FIREBASE_PROJECT_ID}.appspot.com"
    }
)

# Get services
db = firestore.client()
bucket = storage.bucket()


class FirebaseService:
    """Base service for Firebase operations."""
    
    @staticmethod
    def get_document(collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
        """Get a document from Firestore."""
        doc_ref = db.collection(collection).document(doc_id)
        doc = doc_ref.get()
        if doc.exists:
            return doc.to_dict()
        return None
    
    @staticmethod
    def get_documents(
        collection: str, 
        where_clauses: Optional[List[tuple]] = None,
        order_by: Optional[List[tuple]] = None,
        limit: Optional[int] = None,
        start_after: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Get documents from Firestore with filtering, ordering, and pagination.
        
        Parameters:
            collection: The collection name
            where_clauses: List of tuples (field, operator, value)
            order_by: List of tuples (field, direction)
            limit: Maximum number of documents to return
            start_after: Document to start after (for pagination)
            
        Returns:
            List of document dictionaries
        """
        query = db.collection(collection)
        
        # Apply where clauses
        if where_clauses:
            for field, op, value in where_clauses:
                query = query.where(field, op, value)
        
        # Apply ordering
        if order_by:
            for field, direction in order_by:
                if direction == "desc":
                    query = query.order_by(field, direction=firestore.Query.DESCENDING)
                else:
                    query = query.order_by(field)
        
        # Apply pagination
        if start_after:
            query = query.start_after(start_after)
        
        # Apply limit
        if limit:
            query = query.limit(limit)
        
        # Execute query
        docs = query.stream()
        return [doc.to_dict() | {"id": doc.id} for doc in docs]
    
    @staticmethod
    def add_document(collection: str, data: Dict[str, Any]) -> str:
        """
        Add a document to Firestore.
        
        Returns:
            The ID of the created document
        """
        # Add timestamps
        now = datetime.utcnow()
        data["createdAt"] = now
        data["updatedAt"] = now
        
        # Add to Firestore
        doc_ref = db.collection(collection).document()
        doc_ref.set(data)
        return doc_ref.id
    
    @staticmethod
    def update_document(collection: str, doc_id: str, data: Dict[str, Any]) -> bool:
        """
        Update a document in Firestore.
        
        Returns:
            True if successful, False otherwise
        """
        # Add updated timestamp
        data["updatedAt"] = datetime.utcnow()
        
        # Update in Firestore
        doc_ref = db.collection(collection).document(doc_id)
        doc_ref.update(data)
        return True
    
    @staticmethod
    def delete_document(collection: str, doc_id: str) -> bool:
        """
        Delete a document from Firestore.
        
        Returns:
            True if successful, False otherwise
        """
        doc_ref = db.collection(collection).document(doc_id)
        doc_ref.delete()
        return True
    
    @staticmethod
    def upload_file(file_data: bytes, file_path: str, content_type: Optional[str] = None) -> str:
        """
        Upload a file to Firebase Storage.
        
        Parameters:
            file_data: The file content in bytes
            file_path: The path where to store the file
            content_type: The content type of the file
            
        Returns:
            Public URL of the uploaded file
        """
        blob = bucket.blob(file_path)
        if content_type:
            blob.content_type = content_type
        blob.upload_from_string(file_data)
        blob.make_public()
        return blob.public_url
    
    @staticmethod
    def delete_file(file_path: str) -> bool:
        """
        Delete a file from Firebase Storage.
        
        Returns:
            True if successful, False otherwise
        """
        blob = bucket.blob(file_path)
        blob.delete()
        return True
    
    @staticmethod
    def verify_token(token: str) -> Dict[str, Any]:
        """
        Verify a Firebase ID token.
        
        Returns:
            The decoded token claims
        
        Raises:
            HTTPException if token is invalid
        """
        try:
            decoded_token = auth.verify_id_token(token)
            return decoded_token
        except Exception as e:
            raise Exception(f"Invalid token: {str(e)}")
