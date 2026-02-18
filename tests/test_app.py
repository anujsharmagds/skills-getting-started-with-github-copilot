"""
Tests for the Mergington High School API
"""

import pytest
from fastapi.testclient import TestClient
from src.app import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI app"""
    return TestClient(app)


class TestActivitiesEndpoint:
    """Tests for GET /activities endpoint"""

    def test_get_activities_returns_200(self, client):
        """Test that GET /activities returns a 200 status code"""
        response = client.get("/activities")
        assert response.status_code == 200

    def test_get_activities_returns_dict(self, client):
        """Test that GET /activities returns a dictionary"""
        response = client.get("/activities")
        data = response.json()
        assert isinstance(data, dict)

    def test_get_activities_contains_expected_activities(self, client):
        """Test that activities response contains expected activities"""
        response = client.get("/activities")
        data = response.json()
        assert "Chess Club" in data
        assert "Programming Class" in data
        assert "Gym Class" in data

    def test_activity_has_required_fields(self, client):
        """Test that each activity has required fields"""
        response = client.get("/activities")
        data = response.json()
        
        for activity_name, activity_data in data.items():
            assert "description" in activity_data
            assert "schedule" in activity_data
            assert "max_participants" in activity_data
            assert "participants" in activity_data
            assert isinstance(activity_data["participants"], list)


class TestSignupEndpoint:
    """Tests for POST /activities/{activity_name}/signup endpoint"""

    def test_signup_for_activity_success(self, client):
        """Test successful signup for an activity"""
        response = client.post(
            "/activities/Chess%20Club/signup?email=test@example.com"
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "signed up" in data["message"].lower()

    def test_signup_adds_participant(self, client):
        """Test that signup adds participant to activity"""
        email = "newstudent@example.com"
        client.post(f"/activities/Chess%20Club/signup?email={email}")
        
        response = client.get("/activities")
        activities = response.json()
        assert email in activities["Chess Club"]["participants"]

    def test_signup_for_nonexistent_activity(self, client):
        """Test signup for non-existent activity returns 404"""
        response = client.post(
            "/activities/Nonexistent%20Club/signup?email=test@example.com"
        )
        assert response.status_code == 404

    def test_signup_duplicate_email(self, client):
        """Test that signing up with same email twice returns 400"""
        email = "duplicate@example.com"
        # First signup should succeed
        response1 = client.post(
            f"/activities/Basketball/signup?email={email}"
        )
        assert response1.status_code == 200
        
        # Second signup should fail
        response2 = client.post(
            f"/activities/Basketball/signup?email={email}"
        )
        assert response2.status_code == 400


class TestUnregisterEndpoint:
    """Tests for POST /activities/{activity_name}/unregister endpoint"""

    def test_unregister_success(self, client):
        """Test successful unregistration from an activity"""
        email = "unregister@example.com"
        # First signup
        client.post(f"/activities/Tennis%20Club/signup?email={email}")
        
        # Then unregister
        response = client.post(
            f"/activities/Tennis%20Club/unregister?email={email}"
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "unregistered" in data["message"].lower()

    def test_unregister_removes_participant(self, client):
        """Test that unregister removes participant from activity"""
        email = "remove@example.com"
        # Signup
        client.post(f"/activities/Drama%20Club/signup?email={email}")
        
        # Unregister
        client.post(f"/activities/Drama%20Club/unregister?email={email}")
        
        # Verify removal
        response = client.get("/activities")
        activities = response.json()
        assert email not in activities["Drama Club"]["participants"]

    def test_unregister_nonexistent_activity(self, client):
        """Test unregister from non-existent activity returns 404"""
        response = client.post(
            "/activities/Fake%20Club/unregister?email=test@example.com"
        )
        assert response.status_code == 404

    def test_unregister_not_signed_up(self, client):
        """Test unregister for someone not signed up returns 400"""
        response = client.post(
            "/activities/Art%20Studio/unregister?email=notsignedup@example.com"
        )
        assert response.status_code == 400


class TestRootEndpoint:
    """Tests for GET / endpoint"""

    def test_root_redirects(self, client):
        """Test that root endpoint redirects to static HTML"""
        response = client.get("/", follow_redirects=False)
        assert response.status_code == 307
        assert "/static/index.html" in response.headers["location"]
