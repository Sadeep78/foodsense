from typing import List, Dict, Any
from sqlalchemy.orm import Session
from ..models.entities import Recipe, RecipeIngredient, Product, InventoryBatch, ForecastCache

def seed_recipes_if_empty(db: Session):
    count = db.query(Recipe).count()
    if count == 0:
        # Dish 1: Special Chicken Kottu Roti
        r1 = Recipe(
            dish_product_id="PRD-CKD-002",
            dish_name="Special Chicken Kottu Roti",
            category="Cooked Meals",
            yield_portions=1,
            prep_time_mins=15,
            instructions="Sauté shredded godamba roti on flat griddle with marinated chicken, chopped leeks, carrots, eggs and curry gravy.",
        )
        db.add(r1)
        db.flush()

        db.add_all([
            RecipeIngredient(recipe_id=r1.id, ingredient_product_id="PRD-MEA-001", ingredient_name="Fresh Broiler Chicken", quantity_per_portion=0.15, unit="kg"),
            RecipeIngredient(recipe_id=r1.id, ingredient_product_id="PRD-BAK-002", ingredient_name="Wood-Fired Roast Paan / Roti", quantity_per_portion=0.25, unit="loaves"),
            RecipeIngredient(recipe_id=r1.id, ingredient_product_id="PRD-VEG-001", ingredient_name="Nuwara Eliya Carrots", quantity_per_portion=0.06, unit="kg"),
            RecipeIngredient(recipe_id=r1.id, ingredient_product_id="PRD-VEG-003", ingredient_name="Sri Lankan Red Onions", quantity_per_portion=0.08, unit="kg"),
        ])

        # Dish 2: Chicken Rice & Curry Pack
        r2 = Recipe(
            dish_product_id="PRD-CKD-001",
            dish_name="Chicken Rice & Curry Pack (Basmati)",
            category="Cooked Meals",
            yield_portions=1,
            prep_time_mins=25,
            instructions="Basmati steamed rice paired with Sri Lankan chicken curry, dhal, carrot sambol and fried okra.",
        )
        db.add(r2)
        db.flush()

        db.add_all([
            RecipeIngredient(recipe_id=r2.id, ingredient_product_id="PRD-MEA-001", ingredient_name="Fresh Broiler Chicken", quantity_per_portion=0.18, unit="kg"),
            RecipeIngredient(recipe_id=r2.id, ingredient_product_id="PRD-VEG-001", ingredient_name="Nuwara Eliya Carrots", quantity_per_portion=0.08, unit="kg"),
            RecipeIngredient(recipe_id=r2.id, ingredient_product_id="PRD-VEG-002", ingredient_name="Bandakka / Okra", quantity_per_portion=0.07, unit="kg"),
            RecipeIngredient(recipe_id=r2.id, ingredient_product_id="PRD-VEG-003", ingredient_name="Sri Lankan Red Onions", quantity_per_portion=0.05, unit="kg"),
        ])

        # Dish 3: Sri Lankan Fish Cutlets
        r3 = Recipe(
            dish_product_id="PRD-CKD-003",
            dish_name="Sri Lankan Fish Cutlet (Pack of 4)",
            category="Cooked Meals",
            yield_portions=1,
            prep_time_mins=20,
            instructions="Spiced tuna potato croquettes crumbed and golden fried with ginger, garlic and black pepper.",
        )
        db.add(r3)
        db.flush()

        db.add_all([
            RecipeIngredient(recipe_id=r3.id, ingredient_product_id="PRD-MEA-002", ingredient_name="Fresh Balaya / Tuna Steaks", quantity_per_portion=0.14, unit="kg"),
            RecipeIngredient(recipe_id=r3.id, ingredient_product_id="PRD-VEG-003", ingredient_name="Sri Lankan Red Onions", quantity_per_portion=0.06, unit="kg"),
            RecipeIngredient(recipe_id=r3.id, ingredient_product_id="PRD-DAI-003", ingredient_name="Pelwatte Salted Butter", quantity_per_portion=0.03, unit="packs"),
        ])

        db.commit()

def get_recipes_with_ingredients(db: Session) -> List[Dict[str, Any]]:
    seed_recipes_if_empty(db)
    recipes = db.query(Recipe).all()
    results = []

    for r in recipes:
        ingredients = db.query(RecipeIngredient).filter(RecipeIngredient.recipe_id == r.id).all()
        results.append({
            "id": r.id,
            "dish_product_id": r.dish_product_id,
            "dish_name": r.dish_name,
            "category": r.category,
            "yield_portions": r.yield_portions,
            "prep_time_mins": r.prep_time_mins,
            "instructions": r.instructions,
            "ingredients": [
                {
                    "id": ing.id,
                    "ingredient_product_id": ing.ingredient_product_id,
                    "ingredient_name": ing.ingredient_name,
                    "quantity_per_portion": ing.quantity_per_portion,
                    "unit": ing.unit,
                }
                for ing in ingredients
            ],
        })
    return results

def get_ingredient_demand_explosion(forecast_days: int, db: Session) -> Dict[str, Any]:
    seed_recipes_if_empty(db)
    recipes = db.query(Recipe).all()

    dish_forecasts = {}
    for r in recipes:
        forecast_entries = (
            db.query(ForecastCache)
            .filter(ForecastCache.product_id == r.dish_product_id)
            .order_by(ForecastCache.forecast_date.asc())
            .limit(forecast_days)
            .all()
        )
        total_dish_demand = sum(f.forecasted_demand for f in forecast_entries)
        if total_dish_demand <= 0:
            total_dish_demand = 35.0 * forecast_days  # Realistic daily portion baseline
        dish_forecasts[r.id] = {
            "dish_name": r.dish_name,
            "dish_product_id": r.dish_product_id,
            "projected_portions": round(total_dish_demand, 0),
        }

    # Aggregate exploded ingredient demand
    ingredient_map = {}
    for r in recipes:
        portions = dish_forecasts[r.id]["projected_portions"]
        ingredients = db.query(RecipeIngredient).filter(RecipeIngredient.recipe_id == r.id).all()
        for ing in ingredients:
            required_qty = portions * ing.quantity_per_portion
            if ing.ingredient_product_id not in ingredient_map:
                prod = db.query(Product).filter(Product.product_id == ing.ingredient_product_id).first()
                batches = db.query(InventoryBatch).filter(InventoryBatch.product_id == ing.ingredient_product_id).all()
                current_stock = sum(b.quantity_received - b.quantity_wasted for b in batches)
                total_wasted = sum(b.quantity_wasted for b in batches)

                ingredient_map[ing.ingredient_product_id] = {
                    "product_id": ing.ingredient_product_id,
                    "name": ing.ingredient_name,
                    "unit": ing.unit,
                    "unit_cost": prod.unit_cost if prod else 500.0,
                    "current_stock": round(max(0.0, current_stock), 1),
                    "required_quantity": 0.0,
                    "prep_trim_waste_historical": round(total_wasted, 1),
                    "used_in_dishes": [],
                }
            ingredient_map[ing.ingredient_product_id]["required_quantity"] += required_qty
            ingredient_map[ing.ingredient_product_id]["used_in_dishes"].append(r.dish_name)

    exploded_list = []
    for ing_id, val in ingredient_map.items():
        val["required_quantity"] = round(val["required_quantity"], 1)
        # Recommended procurement order = required - current_stock + 15% kitchen safety buffer
        safety_buffer = round(val["required_quantity"] * 0.15, 1)
        recommended_order = max(0.0, val["required_quantity"] + safety_buffer - val["current_stock"])
        val["safety_buffer"] = safety_buffer
        val["recommended_order_quantity"] = round(recommended_order, 1)
        val["estimated_cost_lkr"] = round(recommended_order * val["unit_cost"], 2)
        exploded_list.append(val)

    exploded_list.sort(key=lambda x: -x["required_quantity"])

    return {
        "forecast_days": forecast_days,
        "dish_forecasts": list(dish_forecasts.values()),
        "exploded_ingredients": exploded_list,
    }
