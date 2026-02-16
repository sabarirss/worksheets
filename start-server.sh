#!/bin/bash

# Local Web Server Startup Script
# Access from any device on your local network

clear
echo "🌐 Starting Local Web Server..."
echo "================================"
echo ""

# Get local IP address
LOCAL_IP=$(ip addr show | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | cut -d/ -f1 | head -1)

if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

PORT=8000

echo "📡 Your local IP address: $LOCAL_IP"
echo "🔌 Server will run on port: $PORT"
echo ""
echo "📱 Access from any device on your network:"
echo ""
echo "   🖥️  This computer:    http://localhost:$PORT"
echo "   📱 Phone/Tablet:     http://$LOCAL_IP:$PORT"
echo "   💻 Other computers:  http://$LOCAL_IP:$PORT"
echo ""
echo "================================"
echo "⚠️  Keep this terminal window open while using the app"
echo "🛑 Press Ctrl+C to stop the server"
echo "================================"
echo ""

# Start Python HTTP server
cd /home/sabari/kumon-claude
python3 -m http.server $PORT
