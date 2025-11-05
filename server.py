#!/usr/bin/env python3
"""
Simple HTTP server to run the Grocery Management System
Run this script to start a local server
"""

import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def get_local_ip():
    """Get the local IP address"""
    try:
        import socket
        # Connect to a remote server to get local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        try:
            hostname = socket.gethostname()
            return socket.gethostbyname(hostname)
        except:
            return "localhost"

def main():
    # Change to the directory where this script is located
    os.chdir(Path(__file__).parent)
    
    Handler = MyHTTPRequestHandler
    
    # Bind to 0.0.0.0 to accept connections from any network interface
    host = "0.0.0.0"
    
    try:
        with socketserver.TCPServer((host, PORT), Handler) as httpd:
            local_ip = get_local_ip()
            
            print("=" * 60)
            print("🚀 Ligma - Grocery Management System Server Started!")
            print("=" * 60)
            print(f"📁 Serving from: {os.getcwd()}")
            print(f"🔗 Local access:  http://localhost:{PORT}")
            print(f"🌐 Network access: http://{local_ip}:{PORT}")
            print("=" * 60)
            print("⚠️  Note: If you can't access from other devices:")
            print("   1. Check Windows Firewall settings")
            print("   2. Allow Python through firewall")
            print("   3. Make sure devices are on the same network")
            print("=" * 60)
            print("Press Ctrl+C to stop the server")
            print()
            
            # Try to open browser automatically
            try:
                webbrowser.open(f'http://localhost:{PORT}')
            except:
                pass
            
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\n👋 Server stopped")
    except OSError as e:
        if "Address already in use" in str(e) or "Only one usage of each socket address" in str(e):
            print(f"❌ Error: Port {PORT} is already in use!")
            print(f"   Please close the application using port {PORT} or change the PORT in server.py")
        else:
            print(f"❌ Error starting server: {e}")
        input("Press Enter to exit...")

if __name__ == "__main__":
    main()

