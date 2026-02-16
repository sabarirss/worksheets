# 🌐 Local Network Server Setup

## Quick Start

### Start the server:
```bash
cd /home/sabari/kumon-claude
./start-server.sh
```

### Stop the server:
Press `Ctrl+C` in the terminal

---

## Access Your App

Once the server is running, you'll see the access URLs. Use these from any device on your local network:

**From this computer:**
- http://localhost:8000

**From phone, tablet, or other computers:**
- http://YOUR-LOCAL-IP:8000 (shown when server starts)

---

## Step-by-Step Instructions

### 1. Start the Server

Open a terminal and run:
```bash
cd /home/sabari/kumon-claude
./start-server.sh
```

You'll see something like:
```
🌐 Starting Local Web Server...
================================

📡 Your local IP address: 192.168.1.100
🔌 Server will run on port: 8000

📱 Access from any device on your network:

   🖥️  This computer:    http://localhost:8000
   📱 Phone/Tablet:     http://192.168.1.100:8000
   💻 Other computers:  http://192.168.1.100:8000
```

### 2. Open in Browser

**On the same computer:**
- Open browser and go to: http://localhost:8000

**On your phone/tablet:**
- Make sure device is on the SAME WiFi network
- Open browser and go to the IP shown (e.g., http://192.168.1.100:8000)

**On another computer:**
- Make sure it's on the SAME network
- Open browser and go to the IP shown

### 3. Use the App

Everything works exactly the same as before:
- Login/signup
- Create child profiles
- Generate worksheets
- All data saved to Firebase (accessible from any device)

---

## Alternative Server Options

### Option 1: Python HTTP Server (Current - Simplest)
```bash
cd /home/sabari/kumon-claude
python3 -m http.server 8000
```

### Option 2: Node.js HTTP Server
```bash
# Install http-server (one time)
npm install -g http-server

# Run server
cd /home/sabari/kumon-claude
http-server -p 8000 -o
```

### Option 3: PHP Server
```bash
cd /home/sabari/kumon-claude
php -S 0.0.0.0:8000
```

---

## Troubleshooting

### "Address already in use" error

Port 8000 is already taken. Try a different port:
```bash
# Use port 8080 instead
python3 -m http.server 8080
```

Then access at: http://localhost:8080

### Can't access from other devices

**Check firewall:**
```bash
# Allow port 8000 through firewall (Ubuntu/Debian)
sudo ufw allow 8000/tcp

# Or temporarily disable firewall
sudo ufw disable
```

**Verify you're on the same network:**
- Both devices must be on the same WiFi network
- Check your phone's WiFi settings

**Find your IP again:**
```bash
ip addr show | grep "inet "
# Look for the 192.168.x.x or 10.0.x.x address
```

### Connection refused / Timeout

Make sure the server is still running in the terminal. You should see logs like:
```
192.168.1.100 - - [16/Feb/2026 10:30:45] "GET / HTTP/1.1" 200 -
```

### Firebase not connecting

If you see Firebase errors, check:
1. You have internet connection (Firebase requires internet)
2. Firebase config is correct in `firebase-config.js`
3. Check browser console for specific errors (F12)

---

## Accessing from Specific Devices

### From iPad/iPhone
1. Open Safari (or Chrome)
2. Type: http://YOUR-IP:8000
3. Can add to Home Screen for app-like experience:
   - Tap Share button → Add to Home Screen

### From Android Phone/Tablet
1. Open Chrome (or any browser)
2. Type: http://YOUR-IP:8000
3. Can add to Home Screen:
   - Menu → Add to Home Screen

### From Another Laptop/Desktop
1. Open any browser
2. Type: http://YOUR-IP:8000
3. Works on Windows, Mac, Linux

---

## Making it Auto-Start (Optional)

### Create a desktop shortcut

**Linux:**
Create `start-worksheets.desktop`:
```ini
[Desktop Entry]
Type=Application
Name=Worksheets Server
Exec=/home/sabari/kumon-claude/start-server.sh
Terminal=true
Icon=applications-education
```

### Auto-start on boot (systemd)

Create service file `/etc/systemd/system/worksheets.service`:
```ini
[Unit]
Description=Educational Worksheets Local Server
After=network.target

[Service]
Type=simple
User=sabari
WorkingDirectory=/home/sabari/kumon-claude
ExecStart=/usr/bin/python3 -m http.server 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable worksheets
sudo systemctl start worksheets
```

---

## Security Notes

### Local Network Only
- Server is only accessible on your local network
- Not accessible from the internet (safe)
- Only people on your WiFi can access it

### To Make It Internet-Accessible (NOT recommended)
- Would require port forwarding on your router
- Need dynamic DNS for changing IP
- Security risks - not recommended for this setup

### Firewall Recommendations
- Keep firewall enabled
- Only allow port 8000 temporarily when using
- Block port 8000 when not in use:
```bash
sudo ufw deny 8000/tcp
```

---

## Checking Server Status

### View server logs
The terminal will show all requests:
```
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
192.168.1.101 - - [16/Feb/2026 10:30:45] "GET /index.html HTTP/1.1" 200 -
192.168.1.101 - - [16/Feb/2026 10:30:46] "GET /styles.css HTTP/1.1" 200 -
```

### Check if port is open
```bash
netstat -tuln | grep 8000
# Should show: tcp 0 0 0.0.0.0:8000 0.0.0.0:* LISTEN
```

### Test from this computer
```bash
curl http://localhost:8000
# Should return HTML content
```

---

## Performance Tips

### Keep Server Running
- Don't close the terminal window
- Server stops if terminal closes
- Use `screen` or `tmux` to keep it running in background

### Multiple Users
- Server can handle 10-20 concurrent users easily
- For more users, consider upgrading to nginx or Apache

---

## Next Steps

Once you've tested locally and everything works:

1. ✅ **Current**: Local network access only
2. 🌐 **Future**: Deploy to Firebase Hosting for internet access
3. 🔒 **Later**: Move to backend for implementation protection

For now, enjoy using your app on all your local devices! 🎉
