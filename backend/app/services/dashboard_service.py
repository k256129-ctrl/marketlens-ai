from sqlalchemy.orm import Session, joinedload
from app.models.domain import (
    ActivityLog,
    Business,
    Category,
    InventoryItem,
    LocationMetric,
    Product,
)
from app.schemas.dashboard import (
    ActivityLogOut,
    BusinessPerformancePoint,
    CategoryDistributionPoint,
    DashboardOverviewOut,
    KpiMetrics,
    LowStockAlertItem,
)


def build_dashboard_overview(db: Session) -> DashboardOverviewOut:
    businesses = db.query(Business).all()
    categories = db.query(Category).all()
    products = db.query(Product).all()
    inventory_items = (
        db.query(InventoryItem)
        .options(
            joinedload(InventoryItem.business),
            joinedload(InventoryItem.product).joinedload(Product.category),
        )
        .all()
    )
    locations = db.query(LocationMetric).all()
    activities = (
        db.query(ActivityLog)
        .order_by(ActivityLog.created_at.desc(), ActivityLog.id.desc())
        .limit(12)
        .all()
    )

    total_businesses = len(businesses)
    active_businesses = sum(1 for b in businesses if b.status == "active")
    total_products = len(products)
    total_inventory_items = len(inventory_items)
    total_units = sum(i.quantity for i in inventory_items)
    total_value = round(sum(float(i.unit_price) * i.quantity for i in inventory_items), 2)
    low_stock_count = sum(1 for i in inventory_items if 0 < i.quantity <= i.min_stock_level)
    out_of_stock_count = sum(1 for i in inventory_items if i.quantity <= 0)
    avg_opp = round(sum(l.opportunity_score for l in locations) / len(locations), 1) if locations else 0.0

    # Category aggregation
    cat_map = {
        c.id: {
            "category_id": c.id,
            "category_name": c.name,
            "color_hex": c.color_hex,
            "product_ids": set(),
            "total_units": 0,
            "inventory_value": 0.0,
        }
        for c in categories
    }
    for p in products:
        if p.category_id in cat_map:
            cat_map[p.category_id]["product_ids"].add(p.id)

    for inv in inventory_items:
        cid = inv.product.category_id
        if cid in cat_map:
            cat_map[cid]["total_units"] += inv.quantity
            cat_map[cid]["inventory_value"] += float(inv.unit_price) * inv.quantity

    category_distribution = [
        CategoryDistributionPoint(
            category_id=v["category_id"],
            category_name=v["category_name"],
            color_hex=v["color_hex"],
            product_count=len(v["product_ids"]),
            total_units=v["total_units"],
            inventory_value=round(v["inventory_value"], 2),
        )
        for v in cat_map.values()
    ]
    category_distribution.sort(key=lambda x: x.inventory_value, reverse=True)

    # Business performance aggregation
    biz_map = {
        b.id: {
            "business_id": b.id,
            "business_name": b.name,
            "city": b.city,
            "category": b.category,
            "sku_count": 0,
            "total_units": 0,
            "inventory_value": 0.0,
            "low_stock_count": 0,
        }
        for b in businesses
    }
    for inv in inventory_items:
        if inv.business_id in biz_map:
            entry = biz_map[inv.business_id]
            entry["sku_count"] += 1
            entry["total_units"] += inv.quantity
            entry["inventory_value"] += float(inv.unit_price) * inv.quantity
            if inv.quantity <= inv.min_stock_level:
                entry["low_stock_count"] += 1

    business_performance = [
        BusinessPerformancePoint(
            business_id=v["business_id"],
            business_name=v["business_name"],
            city=v["city"],
            category=v["category"],
            sku_count=v["sku_count"],
            total_units=v["total_units"],
            inventory_value=round(v["inventory_value"], 2),
            low_stock_count=v["low_stock_count"],
        )
        for v in biz_map.values()
    ]
    business_performance.sort(key=lambda x: x.inventory_value, reverse=True)

    # Low-stock action list
    low_stock_alerts = [
        LowStockAlertItem(
            inventory_id=inv.id,
            sku=inv.product.sku,
            product_name=inv.product.name,
            business_name=inv.business.name,
            city=inv.business.city,
            quantity=inv.quantity,
            min_stock_level=inv.min_stock_level,
            deficit=max(inv.min_stock_level - inv.quantity, 0),
            unit_price=float(inv.unit_price),
        )
        for inv in inventory_items
        if inv.quantity <= inv.min_stock_level
    ]
    low_stock_alerts.sort(key=lambda x: (x.quantity, -x.deficit))

    # Data-driven analytical insights derived strictly from DB state
    insights = []
    if business_performance:
        top_biz = business_performance[0]
        share = (top_biz.inventory_value / total_value * 100) if total_value > 0 else 0
        insights.append(
            f"{top_biz.business_name} ({top_biz.city}) holds the largest inventory valuation at "
            f"${top_biz.inventory_value:,.2f} ({share:.1f}% of tracked capital)."
        )
    if category_distribution and category_distribution[0].inventory_value > 0:
        top_cat = category_distribution[0]
        insights.append(
            f"'{top_cat.category_name}' leads category valuation with ${top_cat.inventory_value:,.2f} "
            f"across {top_cat.total_units:,} stocked units."
        )
    if low_stock_alerts:
        insights.append(
            f"{len(low_stock_alerts)} SKU placement(s) require replenishment attention, led by "
            f"'{low_stock_alerts[0].product_name}' at {low_stock_alerts[0].business_name} ({low_stock_alerts[0].quantity} left)."
        )
    else:
        insights.append("All tracked inventory positions are currently above minimum reorder thresholds.")

    return DashboardOverviewOut(
        kpis=KpiMetrics(
            total_businesses=total_businesses,
            active_businesses=active_businesses,
            total_products=total_products,
            total_inventory_items=total_inventory_items,
            total_units_in_stock=total_units,
            total_inventory_value=total_value,
            low_stock_products=low_stock_count,
            out_of_stock_products=out_of_stock_count,
            avg_opportunity_score=avg_opp,
        ),
        category_distribution=category_distribution,
        business_performance=business_performance,
        low_stock_alerts=low_stock_alerts[:8],
        recent_activities=[ActivityLogOut.model_validate(a) for a in activities],
        analytical_insights=insights,
    )
