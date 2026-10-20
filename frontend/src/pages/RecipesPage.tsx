import React, { useState, useEffect } from 'react';
import client from '../api/client';
import {
  UtensilsCrossed,
  Layers,
  Clock,
  Sparkles,
  PlusCircle,
  X,
  AlertTriangle,
  ShoppingCart,
  CheckCircle2,
  ChevronRight,
  Flame,
  Info,
} from 'lucide-react';

interface RecipeIngredient {
  id: number;
  ingredient_product_id: string;
  ingredient_name: string;
  quantity_per_portion: number;
  unit: string;
}

interface RecipeItem {
  id: number;
  dish_product_id: string;
  dish_name: string;
  category: string;
  yield_portions: number;
  prep_time_mins: number;
  instructions: string;
  ingredients: RecipeIngredient[];
}

interface ExplodedIngredient {
  product_id: string;
  name: string;
  unit: string;
  unit_cost: number;
  current_stock: number;
  required_quantity: number;
  prep_trim_waste_historical: number;
  safety_buffer: number;
  recommended_order_quantity: number;
  estimated_cost_lkr: number;
  used_in_dishes: string[];
}

interface DishForecast {
  dish_name: string;
  dish_product_id: string;
  projected_portions: number;
}

interface ExplosionData {
  forecast_days: number;
  dish_forecasts: DishForecast[];
  exploded_ingredients: ExplodedIngredient[];
}

export const RecipesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'explosion' | 'recipes'>('explosion');
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [explosionData, setExplosionData] = useState<ExplosionData | null>(null);
  const [forecastHorizon, setForecastHorizon] = useState<number>(7);
  const [loading, setLoading] = useState(true);
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);

  const fetchRecipes = async () => {
    try {
      const res = await client.get<RecipeItem[]>('/recipes');
      setRecipes(res.data);
    } catch (err) {
      console.error('Failed to load recipes:', err);
    }
  };

  const fetchExplosion = async (days: number) => {
    try {
      setLoading(true);
      const res = await client.get<ExplosionData>(`/recipes/forecast-ingredients?forecast_days=${days}`);
      setExplosionData(res.data);
    } catch (err) {
      console.error('Failed to load ingredient explosion:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
    fetchExplosion(forecastHorizon);
  }, [forecastHorizon]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Restaurant Kitchen Operations</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Recipe & Ingredient-Level Forecasting
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Convert forecasted sales of dishes (Kottu, Rice & Curry, Cutlets) into precise raw ingredient procurement requirements.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-700/60 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setActiveTab('explosion')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'explosion'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Ingredient Explosion
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'recipes'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Recipe Formulas ({recipes.length})
          </button>
        </div>
      </div>

      {activeTab === 'explosion' ? (
        <div className="space-y-6">
          {/* Horizon Toggle & Summary Cards */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                Forecast Window:
              </span>
              <div className="flex items-center gap-1">
                {[7, 14].map((days) => (
                  <button
                    key={days}
                    onClick={() => setForecastHorizon(days)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      forecastHorizon === days
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Next {days} Days
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <Info className="w-4 h-4 text-emerald-600" />
              <span>Includes +15% kitchen safety buffer for unexpected catering spikes.</span>
            </div>
          </div>

          {/* Dish Forecasts Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {explosionData?.dish_forecasts.map((df) => (
              <div
                key={df.dish_product_id}
                className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Forecasted Dish Sales
                  </span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {df.dish_name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {df.projected_portions}
                  </span>
                  <span className="text-xs text-slate-500 block">portions</span>
                </div>
              </div>
            ))}
          </div>

          {/* Exploded Ingredients Table */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700/60">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Aggregated Raw Ingredient Purchase Orders ({forecastHorizon}-Day Cycle)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3">Ingredient</th>
                    <th className="px-4 py-3">Used In Dishes</th>
                    <th className="px-4 py-3 text-right">Current Stock</th>
                    <th className="px-4 py-3 text-right">Required Demand</th>
                    <th className="px-4 py-3 text-right">Safety Buffer</th>
                    <th className="px-4 py-3 text-right font-bold text-emerald-700 dark:text-emerald-400">
                      Recommended Order
                    </th>
                    <th className="px-4 py-3 text-right">Est. Cost (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {explosionData?.exploded_ingredients.map((ing) => (
                    <tr key={ing.product_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        <div>
                          <span>{ing.name}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {ing.product_id}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {ing.used_in_dishes.map((dish, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            >
                              {dish}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                        {ing.current_stock} {ing.unit}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                        {ing.required_quantity} {ing.unit}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-500">
                        +{ing.safety_buffer} {ing.unit}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                        {ing.recommended_order_quantity} {ing.unit}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        Rs. {ing.estimated_cost_lkr.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Recipe Formulas Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recipes.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {r.dish_product_id}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{r.prep_time_mins} mins</span>
                  </div>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                  {r.dish_name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                  {r.instructions}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Ingredient Specification (BOM)
                  </span>
                  {r.ingredients.map((ing) => (
                    <div
                      key={ing.id}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-850"
                    >
                      <span className="text-slate-800 dark:text-slate-200 font-medium">
                        {ing.ingredient_name}
                      </span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        {ing.quantity_per_portion} {ing.unit} / portion
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
