import urllib.request
import json

def test_chat():
    login_url = "http://127.0.0.1:8000/api/auth/login"
    login_data = json.dumps({"username": "test_pat_user", "password": "admin123"}).encode("utf-8")
    req = urllib.request.Request(login_url, data=login_data, headers={"Content-Type": "application/json"})
    
    try:
        with urllib.request.urlopen(req) as res:
            res_data = json.loads(res.read().decode("utf-8"))
            token = res_data["access_token"]
            print("Login successful! Token acquired.")
    except Exception as e:
        print("Login failed:", e)
        return

    chat_url = "http://127.0.0.1:8000/api/ai/chat"
    chat_data = json.dumps({"message": "Where is the MRI room?"}).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    req_chat = urllib.request.Request(chat_url, data=chat_data, headers=headers)
    
    try:
        with urllib.request.urlopen(req_chat) as res:
            print("Chat response:")
            print(res.read().decode("utf-8"))
    except Exception as e:
        print("Chat failed:", e)
        if hasattr(e, "read"):
            print("Error details:", e.read().decode("utf-8"))

if __name__ == "__main__":
    test_chat()
