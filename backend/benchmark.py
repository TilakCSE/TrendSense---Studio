import requests
import time
import numpy as np

# Change if running on different host/port
API_URL = "http://127.0.0.1:8000/predict"

def run_benchmark(num_requests=100):
    print(f"Starting Benchmark: {num_requests} rapid requests to {API_URL}...")
    
    payload = {
        "post_text": "This is a standard text payload to test the ML inference speed with some slang like cap and skibidi."
    }
    
    delays = []
    errors = 0
    
    # Warm up request (often slower due to first-time socket overhead)
    try:
        requests.post(API_URL, json=payload)
    except Exception:
        print("Server not reachable. Ensure uvicorn is running.")
        return

    print("Warmup complete. Firing requests...")
    
    for i in range(num_requests):
        start = time.time()
        try:
            resp = requests.post(API_URL, json=payload)
            if resp.status_code == 200:
                duration = (time.time() - start) * 1000
                delays.append(duration)
            else:
                errors += 1
        except Exception:
            errors += 1
            
    if not delays:
        print("All requests failed.")
        return
        
    avg_ping = np.mean(delays)
    p95_ping = np.percentile(delays, 95)
    max_ping = np.max(delays)
    min_ping = np.min(delays)
    
    print("\n=== Benchmark Results ===")
    print(f"Total Requests: {num_requests}")
    print(f"Errors: {errors}")
    print(f"Average Latency: {avg_ping:.2f} ms")
    print(f"Min Latency: {min_ping:.2f} ms")
    print(f"Max Latency: {max_ping:.2f} ms")
    print(f"95th Percentile: {p95_ping:.2f} ms")
    
    if avg_ping < 300:
        print("\n✅ SLA MET: Average latency is well under 300ms!")
    else:
        print("\n❌ SLA FAILED: Average latency exceeds 300ms limit.")

if __name__ == "__main__":
    run_benchmark(100)
