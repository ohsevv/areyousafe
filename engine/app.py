import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import scanner
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timezone

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Firebase
# Note: In production, use application default credentials or a service account path from env
try:
    if not firebase_admin._apps:
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase Cloud Firestore initialized successfully.")
except Exception as e:
    # This is expected locally if no credentials are set up
    print(f"info: Firebase logging disabled (No credentials found). This is normal for local development.")
    db = None

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "areyousafe-engine"}), 200

@app.route('/scan', methods=['POST'])
def scan():
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({"error": "URL is required"}), 400
    
    target_url = data['url']
    hostname = scanner.get_hostname(target_url)
    
    # Perform scans
    header_results = scanner.analyze_headers(target_url)
    open_ports = scanner.scan_ports(hostname)
    ssl_results = scanner.check_ssl(hostname)
    
    results = {
        "target": target_url,
        "security_score": header_results.get('grade', 'F'), 
        "headers": header_results.get('headers', {}),
        "ports": open_ports,
        "ssl": ssl_results,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    # Log to Firestore
    if db:
        try:
            db.collection('scans').add(results)
        except Exception as e:
            print(f"Failed to log to Firestore: {e}")
    
    return jsonify(results), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(debug=True, host='0.0.0.0', port=port)
