from __future__ import annotations

import json

import requests


def main() -> None:
    """Simple test script that calls the local /ask endpoint and prints the answer."""
    url = "http://127.0.0.1:8000/ask"
    question = "Explain the concept of photosynthesis for a Form 2 Malawian student."

    payload = {"question": question}
    print(f"[Test] Sending question to {url}...")
    print(f"[Test] Question: {question}\n")

    response = requests.post(url, json=payload, timeout=60)
    print(f"[Test] Status code: {response.status_code}")

    try:
        data = response.json()
    except json.JSONDecodeError:
        print("[Test] Response was not valid JSON:")
        print(response.text)
        return

    print("[Test] Answer:")
    print(data.get("answer"))


if __name__ == "__main__":  # pragma: no cover - manual testing
    main()
