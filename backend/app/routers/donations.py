from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from typing import List

from ..database import get_db
from ..models.entities import DonationRecord, DonationPartner, InventoryBatch, Product
from ..schemas.dtos import (
    DonationRecordCreate,
    DonationRecordResponse,
    DonationPartnerCreate,
    DonationPartnerResponse,
    DonationsOverviewResponse,
)

router = APIRouter(prefix="/donations", tags=["Donations & Food Redistribution"])

def seed_sample_partners_and_donations(db: Session):
    """Seeds Sri Lankan food charities and initial donation history for live demos."""
    if db.query(DonationPartner).count() == 0:
        sample_partners = [
            DonationPartner(
                name="Sahana Community Kitchen Colombo",
                contact_person="Pastor Ravi Fernando",
                phone="+94 11 258 4421",
                email="outreach@sahanakitchen.lk",
                address="124 Kotahena Street, Colombo 13",
                partner_type="Community Kitchen",
                is_active=True,
                total_meals_received=450,
            ),
            DonationPartner(
                name="Robin Hood Army Colombo",
                contact_person="Minoli Wickremasinghe",
                phone="+94 77 334 8910",
                email="colombo@robinhoodarmy.com",
                address="Havelock Town, Colombo 05",
                partner_type="Volunteer Food Rescue",
                is_active=True,
                total_meals_received=820,
            ),
            DonationPartner(
                name="Food for All Sri Lanka",
                contact_person="Dr. Anura Jayasuriya",
                phone="+94 11 445 6780",
                email="info@foodforall.lk",
                address="45 Nawala Road, Nugegoda",
                partner_type="Food Bank NGO",
                is_active=True,
                total_meals_received=540,
            ),
            DonationPartner(
                name="Voice for Voiceless Foundation",
                contact_person="Nadeesha Perera",
                phone="+94 71 889 0021",
                email="relief@voiceforvoiceless.org",
                address="Dehiwala, Western Province",
                partner_type="Children & Elderly Relief",
                is_active=True,
                total_meals_received=310,
            ),
        ]
        db.add_all(sample_partners)
        db.commit()

    if db.query(DonationRecord).count() == 0:
        today = date.today()
        sample_donations = [
            DonationRecord(
                product_id="PRD-BAK-002",
                product_name="Wood-Fired Roast Paan",
                quantity=35.0,
                unit="loaves",
                estimated_value_lkr=6300.0,
                recipient_ngo="Sahana Community Kitchen Colombo",
                date=today - timedelta(days=2),
                receipt_note="Fresh evening surplus diverted for night soup kitchen service.",
            ),
            DonationRecord(
                product_id="PRD-MEA-002",
                product_name="Chicken Biryani Special Tray",
                quantity=18.0,
                unit="packs",
                estimated_value_lkr=21600.0,
                recipient_ngo="Robin Hood Army Colombo",
                date=today - timedelta(days=5),
                receipt_note="Prepared batch with 1 day shelf-life chilled and distributed to low-income families in Wanathamulla.",
            ),
            DonationRecord(
                product_id="PRD-DAI-001",
                product_name="Highland Fresh Milk 1L",
                quantity=20.0,
                unit="cartons",
                estimated_value_lkr=10400.0,
                recipient_ngo="Voice for Voiceless Foundation",
                date=today - timedelta(days=9),
                receipt_note="Delivered directly to St. John's children's home morning breakfast.",
            ),
            DonationRecord(
                product_id="PRD-BAK-001",
                product_name="Kimbula Banis (Pack of 5)",
                quantity=15.0,
                unit="packs",
                estimated_value_lkr=6750.0,
                recipient_ngo="Food for All Sri Lanka",
                date=today - timedelta(days=14),
                receipt_note="Redistributed to flood-affected community shelter in Wellampitiya.",
            ),
        ]
        db.add_all(sample_donations)
        db.commit()

@router.get("", response_model=DonationsOverviewResponse)
def get_donations_overview(db: Session = Depends(get_db)):
    """
    Returns total redistribution impact metrics, recent donation logs, and partner directory.
    """
    seed_sample_partners_and_donations(db)

    donations = db.query(DonationRecord).order_by(DonationRecord.date.desc(), DonationRecord.id.desc()).all()
    partners = db.query(DonationPartner).filter(DonationPartner.is_active == True).all()

    total_qty = sum(d.quantity for d in donations)
    total_val = sum(d.estimated_value_lkr for d in donations)
    # Estimate meals as quantity / 0.4 kg or portions
    total_meals = int(total_qty / 0.35)

    return {
        "total_meals_donated": total_meals,
        "total_kg_diverted": round(total_qty, 1),
        "total_value_lkr": round(total_val, 2),
        "partner_count": len(partners),
        "recent_donations": donations,
        "partners": partners,
    }

@router.post("", response_model=DonationRecordResponse)
def log_donation(payload: DonationRecordCreate, db: Session = Depends(get_db)):
    """
    Logs a surplus food donation to an NGO partner and updates batch stock if linked.
    """
    donation_date = payload.date or date.today()
    record = DonationRecord(
        batch_id=payload.batch_id,
        product_id=payload.product_id,
        product_name=payload.product_name,
        quantity=payload.quantity,
        unit=payload.unit,
        estimated_value_lkr=payload.estimated_value_lkr,
        recipient_ngo=payload.recipient_ngo,
        date=donation_date,
        receipt_note=payload.receipt_note,
    )
    db.add(record)

    # If linked to an inventory batch, deduct remaining quantity
    if payload.batch_id:
        batch = db.query(InventoryBatch).filter(InventoryBatch.batch_id == payload.batch_id).first()
        if batch:
            batch.current_quantity = max(0.0, batch.current_quantity - payload.quantity)
            batch.status = "Donated" if batch.current_quantity == 0 else batch.status
            batch.waste_reason = f"Donated to {payload.recipient_ngo}"

    # Update partner meal counter
    partner = db.query(DonationPartner).filter(DonationPartner.name == payload.recipient_ngo).first()
    if partner:
        partner.total_meals_received += int(payload.quantity / 0.4) or 1

    db.commit()
    db.refresh(record)
    return record

@router.get("/partners", response_model=List[DonationPartnerResponse])
def get_partners(db: Session = Depends(get_db)):
    """Returns directory of registered NGO partners."""
    seed_sample_partners_and_donations(db)
    return db.query(DonationPartner).filter(DonationPartner.is_active == True).all()

@router.post("/partners", response_model=DonationPartnerResponse)
def add_partner(payload: DonationPartnerCreate, db: Session = Depends(get_db)):
    """Adds a new verified community charity or food bank."""
    partner = DonationPartner(
        name=payload.name,
        contact_person=payload.contact_person,
        phone=payload.phone,
        email=payload.email,
        address=payload.address,
        partner_type=payload.partner_type,
    )
    db.add(partner)
    db.commit()
    db.refresh(partner)
    return partner
