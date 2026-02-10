import socket
import requests
import ssl
from urllib.parse import urlparse
import datetime

COMMON_PORTS = [80, 443, 22, 8080, 21, 25, 53, 3306]

def get_hostname(url):
    parsed = urlparse(url)
    return parsed.hostname or url

def analyze_headers(url):
    """Checks for security headers."""
    if not url.startswith('http'):
        url = 'https://' + url
        
    try:
        response = requests.get(url, timeout=5)
        headers = response.headers
        
        security_headers = {
            'Content-Security-Policy': 'Missing',
            'Strict-Transport-Security': 'Missing',
            'X-Frame-Options': 'Missing',
            'X-Content-Type-Options': 'Missing',
            'Referrer-Policy': 'Missing'
        }
        
        score = 0
        total = len(security_headers)
        
        for header, status in security_headers.items():
            if header in headers:
                security_headers[header] = 'Present'
                score += 1
                
        grade = calculate_grade(score, total)
        
        return {
            "headers": security_headers,
            "score": score,
            "grade": grade,
            "status": "success"
        }
    except Exception as e:
        return {"error": str(e), "status": "error"}

def scan_ports(hostname):
    """Scans common ports."""
    open_ports = []
    try:
        ip = socket.gethostbyname(hostname)
        for port in COMMON_PORTS:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.5)
            result = sock.connect_ex((ip, port))
            if result == 0:
                open_ports.append(port)
            sock.close()
    except Exception as e:
        pass # DNS failure or other issue
        
    return open_ports

def check_ssl(hostname):
    """Checks SSL certificate validity."""
    try:
        ctx = ssl.create_default_context()
        with ctx.wrap_socket(socket.socket(), server_hostname=hostname) as s:
            s.settimeout(5)
            s.connect((hostname, 443))
            cert = s.getpeercert()
            
            # Simple validity check
            not_after = datetime.datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
            days_left = (not_after - datetime.datetime.utcnow()).days
            
            return {
                "valid": True,
                "days_until_expiry": days_left,
                "issuer": dict(x[0] for x in cert['issuer']),
                "version": s.version()
            }
    except Exception as e:
        return {"valid": False, "error": str(e)}

def calculate_grade(score, total):
    percentage = (score / total) * 100
    if percentage >= 100: return 'A+'
    if percentage >= 90: return 'A'
    if percentage >= 80: return 'B'
    if percentage >= 60: return 'C'
    if percentage >= 40: return 'D'
    return 'F'
