import pytest
import math

def calculate_order_quantity(lead_time_demand: float, safety_pct: float, usable_stock: float, pack_size: int):
    safety_stock = lead_time_demand * (safety_pct / 100.0)
    gross = lead_time_demand + safety_stock
    deficit = gross - usable_stock
    if deficit <= 0:
        return 0, "Skip"
    order = int(math.ceil(deficit / pack_size) * pack_size)
    priority = "Urgent" if usable_stock <= safety_stock * 0.5 else "Normal"
    return order, priority

def test_recommendation_logic_zero_deficit():
    # If usable stock is 100, lead time demand is 50, safety stock is 10 (total needed 60)
    order, priority = calculate_order_quantity(50, 20, 100, 10)
    assert order == 0
    assert priority == "Skip"

def test_recommendation_logic_urgent_deficit():
    # Lead time demand 100, safety 20 (gross 120), usable stock only 5 (below 10)
    order, priority = calculate_order_quantity(100, 20, 5, 10)
    assert order == 120  # (120 - 5 = 115) rounded up to pack size 10 -> 120
    assert priority == "Urgent"

def test_recommendation_logic_pack_rounding():
    # Deficit is 21, pack size is 6 -> rounds up to 24
    order, priority = calculate_order_quantity(30, 10, 12, 6) # gross = 33, deficit = 21
    assert order == 24
    assert order % 6 == 0
