# PM2 Process Manager Guide

## What is PM2?

PM2 is a production-ready process manager for Node.js applications. It keeps your backend server running continuously, automatically restarts it if it crashes, and provides monitoring capabilities.

## Current Status

✅ **PM2 is configured and running!**

Your backend server is now managed by PM2 with the following configuration:
- **App Name**: smart-bio-farm-backend
- **Port**: 5000
- **Auto-restart**: Enabled
- **Max Memory**: 1GB
- **Logs**: Stored in `backend/logs/`

## Common PM2 Commands

### View Running Processes
```bash
pm2 list
```
Shows all PM2-managed processes with their status, CPU, and memory usage.

### View Logs
```bash
# View real-time logs
pm2 logs smart-bio-farm-backend

# View last 50 lines
pm2 logs smart-bio-farm-backend --lines 50

# View only errors
pm2 logs smart-bio-farm-backend --err
```

### Restart Server
```bash
pm2 restart smart-bio-farm-backend
```

### Stop Server
```bash
pm2 stop smart-bio-farm-backend
```

### Start Server (if stopped)
```bash
pm2 start backend/ecosystem.config.js
```

### Delete Process from PM2
```bash
pm2 delete smart-bio-farm-backend
```

### Monitor in Real-Time
```bash
pm2 monit
```
Opens an interactive monitoring dashboard.

### View Detailed Info
```bash
pm2 show smart-bio-farm-backend
```

## Configuration File

The PM2 configuration is stored in `backend/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'smart-bio-farm-backend',
    script: './server.js',
    cwd: './backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    merge_logs: true
  }]
};
```

## Starting on Windows Boot

On Windows, PM2's `pm2 startup` command doesn't work. Instead, you have two options:

### Option 1: Task Scheduler (Recommended)

1. Open **Task Scheduler** (search in Start menu)
2. Click **Create Basic Task**
3. Name: "Smart Bio Farm Backend"
4. Trigger: **When the computer starts**
5. Action: **Start a program**
6. Program: `C:\Program Files\nodejs\node.exe`
7. Arguments: `C:\Users\[YourUsername]\AppData\Roaming\npm\node_modules\pm2\bin\pm2 resurrect`
8. Start in: `D:\work\smart-bio-farm`
9. Check "Run with highest privileges"
10. Finish

### Option 2: pm2-windows-startup (Alternative)

```bash
npm install -g pm2-windows-startup
pm2-startup install
```

## Logs Location

All logs are stored in `backend/logs/`:
- `out.log` - Standard output (console.log)
- `err.log` - Error output (console.error)
- `combined.log` - Both combined

## Troubleshooting

### Server not responding
```bash
pm2 restart smart-bio-farm-backend
```

### Check if server is running
```bash
pm2 status
```

### View recent errors
```bash
pm2 logs smart-bio-farm-backend --err --lines 50
```

### Clear logs
```bash
pm2 flush
```

### Completely reset PM2
```bash
pm2 kill
pm2 start backend/ecosystem.config.js
pm2 save
```

## Production Deployment

When deploying to production, use:

```bash
pm2 start backend/ecosystem.config.js --env production
```

This will use the `env_production` settings from the config file.

## Benefits of Using PM2

✅ **Auto-restart** - Server restarts automatically if it crashes
✅ **Log management** - All logs saved to files with timestamps
✅ **Monitoring** - Real-time CPU and memory monitoring
✅ **Zero-downtime reload** - Update code without stopping the server
✅ **Process persistence** - Server state saved and restored
✅ **Cluster mode** - Can run multiple instances for load balancing

## Next Steps

Your backend is now running with PM2! You can:

1. Check status anytime with `pm2 list`
2. View logs with `pm2 logs smart-bio-farm-backend`
3. Monitor performance with `pm2 monit`
4. Set up Windows Task Scheduler for auto-start on boot (optional)

---

**Status**: ✅ PM2 is configured and running!
