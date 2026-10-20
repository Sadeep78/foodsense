import pytest
import numpy as np
import pandas as pd
from datetime import date, timedelta
from app.services.forecasting import calculate_metrics, DemandForecaster

def test_calculate_metrics():
    actual = np.array([10.0, 20.0, 30.0, 40.0])
    predicted = np.array([12.0, 18.0, 33.0, 38.0])

    mae, rmse, mape, accuracy = calculate_metrics(actual, predicted)

    # MAE = (|2| + |2| + |3| + |2|) / 4 = 9/4 = 2.25
    assert mae == 2.25
    assert rmse > 0
    assert 0 <= mape <= 100
    assert 0 <= accuracy <= 100
    assert round(accuracy, 1) == round(100.0 - mape, 1)

def test_calculate_metrics_zero_actual():
    actual = np.array([0.0, 0.0, 0.0])
    predicted = np.array([1.0, 1.0, 1.0])
    mae, rmse, mape, accuracy = calculate_metrics(actual, predicted)
    assert mae == 1.0
    assert 0 <= accuracy <= 100

def test_forecast_naive_seasonal():
    # 14 days of repeating weekly pattern
    dates = [date(2026, 1, 1) + timedelta(days=i) for i in range(14)]
    pattern = [10, 12, 11, 13, 20, 25, 22] * 2
    series = pd.Series(pattern, index=pd.to_datetime(dates))

    forecaster = DemandForecaster(db=None)
    preds = forecaster.forecast_naive_seasonal(series, horizon=7)
    assert len(preds) == 7
    # Should repeat last 7 days: [10, 12, 11, 13, 20, 25, 22]
    np.testing.assert_array_equal(preds, np.array([10, 12, 11, 13, 20, 25, 22]))

def test_forecast_moving_average():
    dates = [date(2026, 1, 1) + timedelta(days=i) for i in range(14)]
    pattern = [20.0] * 14
    series = pd.Series(pattern, index=pd.to_datetime(dates))

    forecaster = DemandForecaster(db=None)
    preds = forecaster.forecast_moving_average(series, horizon=7)
    assert len(preds) == 7
    assert all(p > 0 for p in preds)
