"""
Full End-to-End Test Suite for HorizonCare AI Medical Center
Tests: Auth, AI Chat, Patient, Doctor, Receptionist, Admin endpoints
"""
import urllib.request
import json
import sys
import os

# Fix encoding for Windows terminal
os.environ["PYTHONIOENCODING"] = "utf-8"
sys.stdout.reconfigure(encoding='utf-8')

BASE = "http://127.0.0.1:8000"
results = []

def req(method, path, body=None, token=None):
    url = BASE + path
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as res:
            return res.status, json.loads(res.read().decode())
    except urllib.error.HTTPError as e:
        try:
            detail = json.loads(e.read().decode())
        except:
            detail = str(e)
        return e.code, detail

def test(name, status, expected_status, check_key=None, response=None):
    ok = status == expected_status
    if ok and check_key and isinstance(response, dict):
        ok = check_key in response
    symbol = "PASS" if ok else "FAIL"
    print(f"  [{symbol}] {name} | HTTP {status}")
    results.append((name, ok))
    return ok

print("\n" + "="*65)
print("  HorizonCare AI Medical Center -- Full E2E Test Suite")
print("="*65)

# ─────────────────────────────────────────────
# 1. HEALTH CHECK
# ─────────────────────────────────────────────
print("\n[1] Health Check")
status, body = req("GET", "/api/health")
test("GET /api/health", status, 200, "status", body)

# ─────────────────────────────────────────────
# 2. AUTH
# ─────────────────────────────────────────────
print("\n[2] Authentication")
status, body = req("POST", "/api/auth/login", {"username": "admin", "password": "admin123"})
test("POST /api/auth/login (Admin)", status, 200, "access_token", body)
admin_token = body.get("access_token") if status == 200 else None

status, body = req("POST", "/api/auth/login", {"username": "priya", "password": "admin123"})
test("POST /api/auth/login (Doctor priya)", status, 200, "access_token", body)
doctor_token = body.get("access_token") if status == 200 else None

status, body = req("POST", "/api/auth/login", {"username": "test_pat_user", "password": "admin123"})
test("POST /api/auth/login (Patient)", status, 200, "access_token", body)
patient_token = body.get("access_token") if status == 200 else None

status, body = req("POST", "/api/auth/login", {"username": "reception1", "password": "admin123"})
test("POST /api/auth/login (Receptionist)", status, 200, "access_token", body)
recep_token = body.get("access_token") if status == 200 else None

status, body = req("POST", "/api/auth/login", {"username": "admin", "password": "wrongpass"})
test("POST /api/auth/login (wrong password -> 401)", status, 401)

# ─────────────────────────────────────────────
# 3. PATIENT ENDPOINTS
# ─────────────────────────────────────────────
print("\n[3] Patient Endpoints")
if patient_token:
    status, body = req("GET", "/api/patients/profile", token=patient_token)
    test("GET /api/patients/profile", status, 200)

    status, body = req("GET", "/api/patients/appointments", token=patient_token)
    test("GET /api/patients/appointments", status, 200)

    status, body = req("GET", "/api/patients/notifications", token=patient_token)
    test("GET /api/patients/notifications", status, 200)
else:
    print("  SKIP -- patient_token not available")

# ─────────────────────────────────────────────
# 4. DOCTOR ENDPOINTS
# ─────────────────────────────────────────────
print("\n[4] Doctor Endpoints")
if doctor_token:
    status, body = req("GET", "/api/doctors/profile", token=doctor_token)
    test("GET /api/doctors/profile", status, 200)

    status, body = req("GET", "/api/doctors/today-appointments", token=doctor_token)
    test("GET /api/doctors/today-appointments", status, 200)

    status, body = req("GET", "/api/doctors/upcoming-appointments", token=doctor_token)
    test("GET /api/doctors/upcoming-appointments", status, 200)

    status, body = req("GET", "/api/doctors/waiting-queue", token=doctor_token)
    test("GET /api/doctors/waiting-queue", status, 200)
else:
    print("  SKIP -- doctor_token not available")

# ─────────────────────────────────────────────
# 5. RECEPTIONIST ENDPOINTS
# ─────────────────────────────────────────────
print("\n[5] Receptionist Endpoints")
if recep_token:
    status, body = req("GET", "/api/receptionists/profile", token=recep_token)
    test("GET /api/receptionists/profile", status, 200)

    status, body = req("GET", "/api/receptionists/today-queue", token=recep_token)
    test("GET /api/receptionists/today-queue", status, 200)
else:
    print("  SKIP -- recep_token not available")

# ─────────────────────────────────────────────
# 6. ADMIN ENDPOINTS
# ─────────────────────────────────────────────
print("\n[6] Admin Endpoints")
if admin_token:
    status, body = req("GET", "/api/admin/dashboard-stats", token=admin_token)
    test("GET /api/admin/dashboard-stats", status, 200)

    status, body = req("GET", "/api/admin/doctors", token=admin_token)
    test("GET /api/admin/doctors", status, 200)

    status, body = req("GET", "/api/admin/departments", token=admin_token)
    test("GET /api/admin/departments", status, 200)

    status, body = req("GET", "/api/admin/patients", token=admin_token)
    test("GET /api/admin/patients", status, 200)
else:
    print("  SKIP -- admin_token not available")

# ─────────────────────────────────────────────
# 7. HOSPITAL INFO
# ─────────────────────────────────────────────
print("\n[7] Hospital Information Endpoints")
status, body = req("GET", "/api/hospital/info")
test("GET /api/hospital/info", status, 200)

# ─────────────────────────────────────────────
# 8. AI ASSISTANT
# ─────────────────────────────────────────────
print("\n[8] AI Assistant Endpoints")
if patient_token:
    status, body = req("GET", "/api/ai/history", token=patient_token)
    test("GET /api/ai/history", status, 200)

    status, body = req("POST", "/api/ai/chat", {"message": "Where is the MRI room?"}, token=patient_token)
    test("POST /api/ai/chat -- MRI navigation", status, 200, "response", body)
    if status == 200:
        resp_text = body.get("response", "")
        print(f"    Response: {resp_text[:150]}")

    status, body = req("POST", "/api/ai/chat", {"message": "I have chest pain, which doctor should I see?"}, token=patient_token)
    test("POST /api/ai/chat -- symptom routing", status, 200, "response", body)
    if status == 200:
        print(f"    Response: {body.get('response','')[:150]}")
else:
    print("  SKIP -- patient_token not available")

# ─────────────────────────────────────────────
# SUMMARY
# ─────────────────────────────────────────────
print("\n" + "="*65)
passed = sum(1 for _, ok in results if ok)
failed = sum(1 for _, ok in results if not ok)
print(f"  TOTAL: {len(results)} tests | PASS: {passed} | FAIL: {failed}")
if failed:
    print("\n  FAILED TESTS:")
    for name, ok in results:
        if not ok:
            print(f"    [FAIL] {name}")
print("="*65 + "\n")
sys.exit(0 if failed == 0 else 1)
