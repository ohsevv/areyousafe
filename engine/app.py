import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import scanner
import firebase_admin
from firebase_admin import credentials, firestore, app_check
from datetime import datetime, timezone
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from functools import wraps

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Rate Limiter
limiter = Limiter(
    get_remote_address,
    app=app,
    storage_uri="memory://",
    default_limits=["200 per day", "50 per hour"]
)

if not os.environ.get('K_SERVICE'):
    # Telling firebase admin to accept localhost
    os.environ['FIREBASE_APP_CHECK_DEBUG_TOKEN'] = 'True'
    # setting FLASK_ENV for the decorator
    os.environ['FLASK_ENV'] = 'development'
    print("Local development: App check Debug")

def require_app_check(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):

        is_dev = os.environ.get('FLASK_ENV') == 'development'

        app_check_token = request.headers.get("X-Firebase-AppCheck")

        #if no token is found and we aren't in dev, block it

        if not app_check_token and not is_dev:
            return jsonify({"error": "Unauthorized (Missing App Check Token)"}), 401
        
        if app_check_token:
            try:
                app_check.verify_token(app_check_token)
            except Exception as e:
                if not is_dev:
                    print(f"App check Verification failed: {e}")
                    return jsonify({"error": "Unauthrorized (Invalid Token)"}), 401
                else:
                    print(f"Dev warning: Token verificaiton failed, but allowing due to dev mode.")
                
        return f(*args, **kwargs)
        
    return decorated_function

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
@limiter.limit("5 per 10 minutes")
@require_app_check
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
