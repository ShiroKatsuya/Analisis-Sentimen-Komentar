#!/usr/bin/env python3
"""
Startup script for Arianalyze services
This script starts both the FastAPI sentiment analysis service and the Flask web application.
"""

import subprocess
import sys
import time
import requests
import os
from pathlib import Path

def check_service(url, service_name):
    """Check if a service is running"""
    try:
        response = requests.get(url, timeout=5)
        return response.status_code == 200
    except:
        return False

def start_fastapi_service():
    """Start the FastAPI sentiment analysis service"""
    print("Starting FastAPI sentiment analysis service...")
    
    # Check if service is already running
    if check_service("http://127.0.0.1:8888/", "FastAPI"):
        print("✓ FastAPI service is already running")
        return True
    
    try:
        # Start FastAPI service in background
        process = subprocess.Popen([
            sys.executable, "server.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait for service to start
        for i in range(10):
            time.sleep(1)
            if check_service("http://127.0.0.1:8888/", "FastAPI"):
                print("✓ FastAPI service started successfully")
                return True
        
        print("✗ Failed to start FastAPI service")
        return False
        
    except Exception as e:
        print(f"✗ Error starting FastAPI service: {e}")
        return False

def start_flask_app():
    """Start the Flask web application"""
    print("Starting Flask web application...")
    
    # Check if service is already running
    if check_service("http://127.0.0.1:5000/", "Flask"):
        print("✓ Flask application is already running")
        return True
    
    try:
        # Start Flask app in background
        process = subprocess.Popen([
            sys.executable, "app.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait for service to start
        for i in range(10):
            time.sleep(1)
            if check_service("http://127.0.0.1:5000/", "Flask"):
                print("✓ Flask application started successfully")
                return True
        
        print("✗ Failed to start Flask application")
        return False
        
    except Exception as e:
        print(f"✗ Error starting Flask application: {e}")
        return False

def main():
    """Main function to start all services"""
    print("🚀 Starting Arianalyze Services...")
    print("=" * 50)
    
    # Start FastAPI service
    fastapi_success = start_fastapi_service()
    
    # Start Flask application
    flask_success = start_flask_app()
    
    print("=" * 50)
    if fastapi_success and flask_success:
        print("🎉 All services started successfully!")
        print("\n📱 Access your application at:")
        print("   Web Interface: http://127.0.0.1:5000")
        print("   FastAPI Service: http://127.0.0.1:8888")
        print("\n💡 To stop the services, press Ctrl+C in each terminal window")
    else:
        print("❌ Some services failed to start")
        if not fastapi_success:
            print("   - FastAPI service failed to start")
        if not flask_success:
            print("   - Flask application failed to start")
        print("\n🔧 Please check the error messages above and try again")

if __name__ == "__main__":
    main()
