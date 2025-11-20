# PM2 Quick Reference

## 🚀 Quick Start

```bash
# Start server
pm2 start backend/ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs smart-bio-farm-backend
```

## 📊 Essential Commands

| Command | Description |
|---------|-------------|
| `pm2 list` | Show all processes |
| `pm2 logs smart-bio-farm-backend` | View real-time logs |
| `pm2 restart smart-bio-farm-backend` | Restart server |
| `pm2 stop smart-bio-farm-backend` | Stop server |
| `pm2 delete smart-bio-farm-backend` | Remove from PM2 |
| `pm2 monit` | Interactive monitoring |
| `pm2 show smart-bio-farm-backend` | Detailed process info |

## 📝 Log Commands

| Command | Description |
|---------|-------------|
| `pm2 logs` | All logs (real-time) |
| `pm2 logs --lines 100` | Last 100 lines |
| `pm2 logs --err` | Only errors |
| `pm2 flush` | Clear all logs |

## 🔄 Process Management

| Command | Description |
|---------|-------------|
| `pm2 restart all` | Restart all processes |
| `pm2 stop all` | Stop all processes |
| `pm2 delete all` | Remove all processes |
| `pm2 save` | Save current process list |
| `pm2 resurrect` | Restore saved processes |

## 🛠️ Troubleshooting

```bash
# Server not responding?
pm2 restart smart-bio-farm-backend

# Check for errors
pm2 logs smart-bio-farm-backend --err --lines 50

# Complete reset
pm2 kill
pm2 start backend/ecosystem.config.js
pm2 save
```

## 📍 Current Configuration

- **Name**: smart-bio-farm-backend
- **Port**: 5000
- **Auto-restart**: ✅ Enabled
- **Logs**: `backend/logs/`
- **Config**: `backend/ecosystem.config.js`

## 🌐 Test Server

```bash
# PowerShell
curl http://localhost:5000

# Or open in browser
start http://localhost:5000
```

Expected response:
```json
{
  "status": "Server is running",
  "timestamp": "2025-11-19T06:57:50.162Z"
}
```

---

For complete documentation, see [PM2_GUIDE.md](./PM2_GUIDE.md)
