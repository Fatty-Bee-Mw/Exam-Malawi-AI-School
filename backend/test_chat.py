import requests
import json

# Test the chat endpoint
url = "http://localhost:8000/api/chat"
data = {
    "message": "What is a Noun?",
    "user_name": "ylikagwa"
}

try:
    response = requests.post(url, json=data)
    print("Status Code:", response.status_code)
    print("Response:", json.dumps(response.json(), indent=2))
except Exception as e:
    print("Error:", e)
