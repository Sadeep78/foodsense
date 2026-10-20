import io
from datetime import datetime, date
from typing import Dict, List, Tuple, Any
import pandas as pd

from ..schemas.dtos import UploadValidationResult, ValidationIssue

REQUIRED_SALES_COLUMNS = [
    "date",
    "product_id",
    "product_name",
    "category",
    "quantity_sold",
    "unit_price",
    "unit_cost",
]

REQUIRED_INVENTORY_COLUMNS = [
    "product_id",
    "batch_id",
    "quantity_received",
    "received_date",
    "expiry_date",
    "quantity_wasted",
    "waste_reason",
]

def parse_file_to_dataframe(file_bytes: bytes, filename: str) -> pd.DataFrame:
    """
    Parses CSV or Excel bytes into a clean pandas DataFrame.
    """
    if filename.endswith(".xlsx") or filename.endswith(".xls"):
        df = pd.read_excel(io.BytesIO(file_bytes))
    else:
        # CSV parsing with various encodings fallback
        try:
            df = pd.read_csv(io.BytesIO(file_bytes), encoding="utf-8")
        except UnicodeDecodeError:
            df = pd.read_csv(io.BytesIO(file_bytes), encoding="latin1")

    # Strip column names of whitespace
    df.columns = [str(c).strip().lower() for c in df.columns]
    return df

def validate_sales_dataframe(df: pd.DataFrame) -> UploadValidationResult:
    issues: List[ValidationIssue] = []
    
    # 1. Check required columns
    missing_cols = [c for c in REQUIRED_SALES_COLUMNS if c not in df.columns]
    if missing_cols:
        for mc in missing_cols:
            issues.append(
                ValidationIssue(
                    row=0,
                    column=mc,
                    value=None,
                    message=f"Required column '{mc}' is missing from the uploaded file.",
                    severity="error",
                )
            )
        return UploadValidationResult(
            valid=False,
            total_rows=len(df),
            valid_rows=0,
            error_count=len(issues),
            warning_count=0,
            issues=issues,
            preview_data=df.head(10).to_dict(orient="records") if not df.empty else [],
            dataset_type="sales",
        )

    # 2. Row by row checks
    valid_rows_count = 0
    seen_keys = set()

    for idx, row in df.iterrows():
        row_num = idx + 2  # 1-based header + 1
        has_row_error = False

        # Date validation
        dt_val = row.get("date")
        if pd.isna(dt_val) or str(dt_val).strip() == "":
            issues.append(
                ValidationIssue(
                    row=row_num,
                    column="date",
                    value=str(dt_val),
                    message="Date cannot be empty.",
                    severity="error",
                )
            )
            has_row_error = True
        else:
            try:
                pd.to_datetime(dt_val)
            except Exception:
                issues.append(
                    ValidationIssue(
                        row=row_num,
                        column="date",
                        value=str(dt_val),
                        message=f"Invalid date format '{dt_val}'. Expected YYYY-MM-DD.",
                        severity="error",
                    )
                )
                has_row_error = True

        # Product ID validation
        pid = row.get("product_id")
        if pd.isna(pid) or str(pid).strip() == "":
            issues.append(
                ValidationIssue(
                    row=row_num,
                    column="product_id",
                    value=str(pid),
                    message="Product ID cannot be blank.",
                    severity="error",
                )
            )
            has_row_error = True

        # Duplicate check (date + product_id)
        if not pd.isna(dt_val) and not pd.isna(pid):
            key = (str(dt_val)[:10], str(pid).strip().upper())
            if key in seen_keys:
                issues.append(
                    ValidationIssue(
                        row=row_num,
                        column="date/product_id",
                        value=f"{key[0]} - {key[1]}",
                        message="Duplicate entry: sale for this product on this date already exists in file.",
                        severity="warning",
                    )
                )
            else:
                seen_keys.add(key)

        # Quantity sold validation
        qty = row.get("quantity_sold")
        if pd.isna(qty):
            issues.append(
                ValidationIssue(
                    row=row_num,
                    column="quantity_sold",
                    value=None,
                    message="Quantity sold cannot be missing.",
                    severity="error",
                )
            )
            has_row_error = True
        else:
            try:
                num_qty = float(qty)
                if num_qty < 0:
                    issues.append(
                        ValidationIssue(
                            row=row_num,
                            column="quantity_sold",
                            value=num_qty,
                            message=f"Quantity sold cannot be negative ({num_qty}).",
                            severity="error",
                        )
                    )
                    has_row_error = True
            except ValueError:
                issues.append(
                    ValidationIssue(
                        row=row_num,
                        column="quantity_sold",
                        value=str(qty),
                        message="Quantity sold must be a numeric value.",
                        severity="error",
                    )
                )
                has_row_error = True

        # Unit price & unit cost validation
        for field in ("unit_price", "unit_cost"):
            val = row.get(field)
            if not pd.isna(val):
                try:
                    num_val = float(val)
                    if num_val < 0:
                        issues.append(
                            ValidationIssue(
                                row=row_num,
                                column=field,
                                value=num_val,
                                message=f"{field} cannot be negative ({num_val}).",
                                severity="error",
                            )
                        )
                        has_row_error = True
                except ValueError:
                    issues.append(
                        ValidationIssue(
                            row=row_num,
                            column=field,
                            value=str(val),
                            message=f"{field} must be numeric.",
                            severity="error",
                        )
                    )
                    has_row_error = True

        if not has_row_error:
            valid_rows_count += 1

    error_count = len([i for i in issues if i.severity == "error"])
    warning_count = len([i for i in issues if i.severity == "warning"])

    # Prepare preview records (clean nulls)
    preview_df = df.head(15).fillna("")
    preview_data = preview_df.to_dict(orient="records")

    return UploadValidationResult(
        valid=(error_count == 0),
        total_rows=len(df),
        valid_rows=valid_rows_count,
        error_count=error_count,
        warning_count=warning_count,
        issues=issues[:50],  # Return up to 50 issues
        preview_data=preview_data,
        dataset_type="sales",
    )

def validate_inventory_dataframe(df: pd.DataFrame) -> UploadValidationResult:
    issues: List[ValidationIssue] = []

    # 1. Required columns
    missing_cols = [c for c in REQUIRED_INVENTORY_COLUMNS if c not in df.columns]
    if missing_cols:
        for mc in missing_cols:
            issues.append(
                ValidationIssue(
                    row=0,
                    column=mc,
                    value=None,
                    message=f"Required column '{mc}' is missing from the uploaded file.",
                    severity="error",
                )
            )
        return UploadValidationResult(
            valid=False,
            total_rows=len(df),
            valid_rows=0,
            error_count=len(issues),
            warning_count=0,
            issues=issues,
            preview_data=df.head(10).to_dict(orient="records") if not df.empty else [],
            dataset_type="inventory",
        )

    valid_rows_count = 0
    seen_batches = set()

    for idx, row in df.iterrows():
        row_num = idx + 2
        has_row_error = False

        batch_id = row.get("batch_id")
        if pd.isna(batch_id) or str(batch_id).strip() == "":
            issues.append(
                ValidationIssue(
                    row=row_num,
                    column="batch_id",
                    value=str(batch_id),
                    message="Batch ID cannot be blank.",
                    severity="error",
                )
            )
            has_row_error = True
        else:
            bid = str(batch_id).strip()
            if bid in seen_batches:
                issues.append(
                    ValidationIssue(
                        row=row_num,
                        column="batch_id",
                        value=bid,
                        message=f"Duplicate batch ID '{bid}' found in uploaded file.",
                        severity="warning",
                    )
                )
            seen_batches.add(bid)

        # Dates: received_date and expiry_date
        rec_dt = None
        exp_dt = None
        for col_name in ("received_date", "expiry_date"):
            val = row.get(col_name)
            if pd.isna(val) or str(val).strip() == "":
                issues.append(
                    ValidationIssue(
                        row=row_num,
                        column=col_name,
                        value=str(val),
                        message=f"{col_name} cannot be empty.",
                        severity="error",
                    )
                )
                has_row_error = True
            else:
                try:
                    parsed_dt = pd.to_datetime(val)
                    if col_name == "received_date":
                        rec_dt = parsed_dt
                    else:
                        exp_dt = parsed_dt
                except Exception:
                    issues.append(
                        ValidationIssue(
                            row=row_num,
                            column=col_name,
                            value=str(val),
                            message=f"Invalid date format '{val}' in {col_name}.",
                            severity="error",
                        )
                    )
                    has_row_error = True

        # Logical check: expiry date >= received date
        if rec_dt and exp_dt and exp_dt < rec_dt:
            issues.append(
                ValidationIssue(
                    row=row_num,
                    column="expiry_date",
                    value=f"{exp_dt.strftime('%Y-%m-%d')} < {rec_dt.strftime('%Y-%m-%d')}",
                    message="Expiry date cannot precede received date.",
                    severity="error",
                )
            )
            has_row_error = True

        # Quantity checks
        for qty_col in ("quantity_received", "quantity_wasted"):
            q_val = row.get(qty_col)
            if not pd.isna(q_val):
                try:
                    num_q = float(q_val)
                    if num_q < 0:
                        issues.append(
                            ValidationIssue(
                                row=row_num,
                                column=qty_col,
                                value=num_q,
                                message=f"{qty_col} cannot be negative ({num_q}).",
                                severity="error",
                            )
                        )
                        has_row_error = True
                except ValueError:
                    issues.append(
                        ValidationIssue(
                            row=row_num,
                            column=qty_col,
                            value=str(q_val),
                            message=f"{qty_col} must be numeric.",
                            severity="error",
                        )
                    )
                    has_row_error = True

        # quantity_wasted cannot exceed quantity_received
        try:
            q_rec = float(row.get("quantity_received", 0))
            q_wst = float(row.get("quantity_wasted", 0))
            if q_wst > q_rec:
                issues.append(
                    ValidationIssue(
                        row=row_num,
                        column="quantity_wasted",
                        value=f"{q_wst} > {q_rec}",
                        message="Quantity wasted cannot exceed quantity received.",
                        severity="error",
                    )
                )
                has_row_error = True
        except Exception:
            pass

        if not has_row_error:
            valid_rows_count += 1

    error_count = len([i for i in issues if i.severity == "error"])
    warning_count = len([i for i in issues if i.severity == "warning"])

    preview_df = df.head(15).fillna("")
    preview_data = preview_df.to_dict(orient="records")

    return UploadValidationResult(
        valid=(error_count == 0),
        total_rows=len(df),
        valid_rows=valid_rows_count,
        error_count=error_count,
        warning_count=warning_count,
        issues=issues[:50],
        preview_data=preview_data,
        dataset_type="inventory",
    )
