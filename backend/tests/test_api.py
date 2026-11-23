from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    with TestClient(app) as c:
        res = c.get("/api/v1/health")
        assert res.status_code == 200
        body = res.json()
        assert body["status"] == "healthy"
        assert body["database_connected"] is True


def test_dashboard_overview_and_crud_lifecycle():
    with TestClient(app) as c:
        dash = c.get("/api/v1/dashboard/overview")
        assert dash.status_code == 200
        data = dash.json()
        assert data["kpis"]["total_businesses"] >= 5
        assert data["kpis"]["total_inventory_value"] > 0

        # Create business
        biz_res = c.post(
            "/api/v1/businesses",
            json={
                "name": "Test Flagship Roastery",
                "category": "Specialty Coffee",
                "city": "Portland",
                "district": "Pearl District",
                "address": "1120 NW Couch St, Portland, OR",
                "owner_name": "Alex Rivera",
                "status": "active",
                "rating": 4.9,
            },
        )
        assert biz_res.status_code == 201
        biz_id = biz_res.json()["id"]

        # Update business
        upd_res = c.put(f"/api/v1/businesses/{biz_id}", json={"rating": 5.0})
        assert upd_res.status_code == 200
        assert upd_res.json()["rating"] == 5.0

        # Delete business
        del_res = c.delete(f"/api/v1/businesses/{biz_id}")
        assert del_res.status_code == 204
