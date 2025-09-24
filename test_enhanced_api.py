import requests
import json

# Test the enhanced processing endpoint
url = "http://127.0.0.1:5000/api/process-enhanced"
data = {
    "text": "President John F. Kennedy established the Apollo Program in 1961 to land Americans on the Moon.",
    "options": {
        "use_enhanced_pipeline": True,
        "batch_size": {
            "entities_per_batch": 20,
            "keywords_per_batch": 30,
            "relationships_per_batch": 25
        }
    }
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
