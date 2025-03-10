from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from app.schemas.auth import Token, TokenPayload, UserCreate, UserLogin
from app.services.auth import create_access_token, authenticate_user, register_new_user

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate):
    """
    Register a new user.
    """
    try:
        user = await register_new_user(user_data)
        token = create_access_token(user.id)
        return {"access_token": token, "token_type": "bearer"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = create_access_token(user.id)
    return {"access_token": token, "token_type": "bearer"}


@router.post("/refresh-token", response_model=Token)
async def refresh_token(token: TokenPayload):
    """
    Refresh access token.
    """
    # Implement token refresh logic
    pass


@router.post("/logout")
async def logout():
    """
    Logout (optional, client-side).
    """
    return {"message": "Logged out successfully"}
