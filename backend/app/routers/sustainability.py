from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from ..database import get_db
from .auth import get_current_user
from ..models import User
from ..services.sustainability import get_sustainability_scorecard, generate_sustainability_pdf

router = APIRouter(prefix="/sustainability", tags=["Sustainability & ESG"])

@router.get("/scorecard")
def get_scorecard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns ESG metrics, environmental equivalencies, badges, and 6-month trend."""
    return get_sustainability_scorecard(db)

@router.get("/download-report")
def download_audit_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generates and downloads a branded 1-page executive Sustainability Audit PDF."""
    pdf_bytes = generate_sustainability_pdf(db)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=FoodSense_Sustainability_Impact_Audit.pdf"
        },
    )
