from datetime import date, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from ..models.entities import Supplier, SupplierPriceHistory, Product

def seed_suppliers_if_empty(db: Session):
    count = db.query(Supplier).count()
    if count == 0:
        suppliers = [
            Supplier(
                supplier_id="SUP-001",
                name="Lanka Fresh Agro Distributors (Dambulla Central)",
                category="Vegetables & Fruits",
                contact_name="Gamini Senanayake",
                phone="+94 66 228 4100",
                email="orders@lankafreshargo.lk",
                lead_time_days=2,
                on_time_delivery_pct=96.5,
                quality_score=9.4,
                is_active=True,
            ),
            Supplier(
                supplier_id="SUP-002",
                name="Bairaha & Crysbro Poultry Farms",
                category="Meat & Poultry",
                contact_name="Mohamed Rizvi",
                phone="+94 11 257 8890",
                email="wholesale@crysbro.lk",
                lead_time_days=1,
                on_time_delivery_pct=98.2,
                quality_score=9.6,
                is_active=True,
            ),
            Supplier(
                supplier_id="SUP-003",
                name="Peliyagoda Central Fishery Network",
                category="Fresh Seafood",
                contact_name="Jude Fernando",
                phone="+94 11 291 0044",
                email="supply@peliyagodafish.lk",
                lead_time_days=1,
                on_time_delivery_pct=91.0,
                quality_score=9.1,
                is_active=True,
            ),
            Supplier(
                supplier_id="SUP-004",
                name="Highland & Pelwatte Dairy Cooperative",
                category="Dairy Products",
                contact_name="Anura Bandara",
                phone="+94 11 285 5400",
                email="corporate@highlandmilk.lk",
                lead_time_days=2,
                on_time_delivery_pct=97.0,
                quality_score=9.5,
                is_active=True,
            ),
            Supplier(
                supplier_id="SUP-005",
                name="Serendib Flour Mills & Prima Ceylon",
                category="Bakery Essentials & Grains",
                contact_name="Dinesh Jayasuriya",
                phone="+94 11 472 8200",
                email="sales@serendibflour.com",
                lead_time_days=3,
                on_time_delivery_pct=99.0,
                quality_score=9.8,
                is_active=True,
            ),
        ]
        db.add_all(suppliers)
        db.commit()

        # Seed realistic weekly price trends over the last 12 weeks
        base_prices = {
            ("SUP-001", "PRD-VEG-001"): [420, 430, 440, 435, 450, 460, 470, 490, 520, 540, 580, 620],  # Nuwara Eliya Carrots (monsoon spike)
            ("SUP-002", "PRD-MEA-001"): [1200, 1220, 1200, 1210, 1230, 1240, 1220, 1250, 1260, 1280, 1300, 1320], # Fresh Broiler Chicken
            ("SUP-003", "PRD-MEA-002"): [1650, 1680, 1700, 1690, 1720, 1750, 1800, 1850, 1920, 2050, 2180, 2300], # Balaya / Tuna (rough sea spike)
            ("SUP-004", "PRD-DAI-001"): [450, 450, 450, 460, 460, 460, 470, 470, 480, 480, 490, 500], # Highland Milk
        }

        today = date.today()
        price_records = []
        for (s_id, p_id), prices in base_prices.items():
            for i, pr in enumerate(prices):
                dt = today - timedelta(weeks=(len(prices) - 1 - i))
                price_records.append(
                    SupplierPriceHistory(
                        supplier_id=s_id,
                        product_id=p_id,
                        price=float(pr),
                        effective_date=dt,
                    )
                )
        db.add_all(price_records)
        db.commit()

def get_suppliers_directory(db: Session) -> List[Dict[str, Any]]:
    seed_suppliers_if_empty(db)
    suppliers = db.query(Supplier).filter(Supplier.is_active == True).all()
    results = []

    for s in suppliers:
        # Check for price spike in recent 4 weeks
        recent_prices = (
            db.query(SupplierPriceHistory)
            .filter(SupplierPriceHistory.supplier_id == s.supplier_id)
            .order_by(SupplierPriceHistory.effective_date.desc())
            .limit(6)
            .all()
        )
        has_spike = False
        spike_detail = None
        if len(recent_prices) >= 2:
            latest = recent_prices[0].price
            prev = recent_prices[-1].price
            pct_change = ((latest - prev) / prev) * 100.0 if prev > 0 else 0.0
            if pct_change >= 15.0:
                has_spike = True
                spike_detail = f"+{pct_change:.1f}% inflation over recent weeks (monsoon supply squeeze)"

        results.append({
            "id": s.id,
            "supplier_id": s.supplier_id,
            "name": s.name,
            "category": s.category,
            "contact_name": s.contact_name,
            "phone": s.phone,
            "email": s.email,
            "lead_time_days": s.lead_time_days,
            "on_time_delivery_pct": s.on_time_delivery_pct,
            "quality_score": s.quality_score,
            "has_price_spike": has_spike,
            "spike_detail": spike_detail,
        })

    return results

def get_supplier_price_trend(supplier_id: str, db: Session) -> Dict[str, Any]:
    records = (
        db.query(SupplierPriceHistory)
        .filter(SupplierPriceHistory.supplier_id == supplier_id)
        .order_by(SupplierPriceHistory.effective_date.asc())
        .all()
    )

    history = [
        {
            "effective_date": r.effective_date.strftime("%Y-%m-%d"),
            "product_id": r.product_id,
            "price": r.price,
        }
        for r in records
    ]

    return {
        "supplier_id": supplier_id,
        "price_history": history,
    }
