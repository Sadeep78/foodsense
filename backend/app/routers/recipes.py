from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from ..database import get_db
from .auth import get_current_user
from ..models import User
from ..models.entities import Recipe, RecipeIngredient
from ..services.recipes import get_recipes_with_ingredients, get_ingredient_demand_explosion, seed_recipes_if_empty

router = APIRouter(prefix="/recipes", tags=["Recipes & BOM Ingredient Explosion"])

class IngredientItem(BaseModel):
    ingredient_product_id: str
    ingredient_name: str
    quantity_per_portion: float
    unit: str

class RecipeCreateRequest(BaseModel):
    dish_product_id: str
    dish_name: str
    category: str = "Cooked Meals"
    yield_portions: int = 1
    prep_time_mins: int = 15
    instructions: Optional[str] = None
    ingredients: List[IngredientItem]

@router.get("")
def get_all_recipes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all recipe formulas with nested ingredient specifications."""
    seed_recipes_if_empty(db)
    return get_recipes_with_ingredients(db)

@router.get("/forecast-ingredients")
def get_exploded_ingredients(
    forecast_days: int = Query(default=7, ge=1, le=28),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Explodes dish forecasts into raw ingredient requirements and procurement purchase advice."""
    seed_recipes_if_empty(db)
    return get_ingredient_demand_explosion(forecast_days, db)

@router.post("")
def create_recipe(
    req: RecipeCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Registers a new dish recipe and BOM bill of materials."""
    existing = db.query(Recipe).filter(Recipe.dish_product_id == req.dish_product_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Recipe for dish already exists")

    new_recipe = Recipe(
        dish_product_id=req.dish_product_id,
        dish_name=req.dish_name,
        category=req.category,
        yield_portions=req.yield_portions,
        prep_time_mins=req.prep_time_mins,
        instructions=req.instructions,
    )
    db.add(new_recipe)
    db.flush()

    for ing in req.ingredients:
        db.add(
            RecipeIngredient(
                recipe_id=new_recipe.id,
                ingredient_product_id=ing.ingredient_product_id,
                ingredient_name=ing.ingredient_name,
                quantity_per_portion=ing.quantity_per_portion,
                unit=ing.unit,
            )
        )
    db.commit()
    db.refresh(new_recipe)
    return {"message": "Recipe saved successfully", "id": new_recipe.id}
