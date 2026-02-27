from pydantic import BaseModel, Field, constr, field_validator
from typing import List, Tuple

class PredictRequest(BaseModel):
    """
    Input schema for the Virality Engine prediction endpoint.
    Forces string input, prevents empty strings, max length 2000 chars.
    """
    post_text: constr(max_length=2000) = Field(
        ..., 
        description="The social media text/caption to evaluate.",
        example="AI is taking over tech! What a crazy time to be alive no cap."
    )

    @field_validator("post_text")
    def validate_non_empty(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Input text cannot be empty or solely whitespace.")
        return stripped

class PredictResponse(BaseModel):
    """
    Output schema for the Virality Engine prediction endpoint.
    """
    virality_index: float = Field(
        ...,
        description="The predicted Virality Index (0-100) scaled for dashboards."
    )
    sentiment_score: float = Field(
        ...,
        description="The VADER compound sentiment score (-1 to 1)."
    )
    top_features: List[Tuple[str, float]] = Field(
        ...,
        description="Top 3 contributing features and their relative weights for explainability."
    )
    
class HealthResponse(BaseModel):
    """Basic health check response."""
    status: str = "ok"

class ModelInfoResponse(BaseModel):
    """Output schema for model metadata registry details."""
    model_version: str
    trained_at: str
    validation_r2: float
    dataset_size: int
    feature_count: int
