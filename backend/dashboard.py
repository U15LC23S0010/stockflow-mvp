from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Organization, Product, User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    organization = (
        db.query(Organization)
        .filter(Organization.id == current_user.organization_id)
        .first()
    )

    products = (
        db.query(Product)
        .filter(Product.organization_id == current_user.organization_id)
        .all()
    )

    total_products = len(products)
    total_quantity = sum(product.quantity_on_hand for product in products)

    low_stock_products = [
        product
        for product in products
        if product.quantity_on_hand
        <= (
            product.low_stock_threshold
            if product.low_stock_threshold is not None
            else organization.default_low_stock_threshold
        )
    ]

    return {
        "total_products": total_products,
        "total_quantity": total_quantity,
        "low_stock_count": len(low_stock_products),
        "low_stock_products": low_stock_products,
    }