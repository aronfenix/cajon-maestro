curl -s -o /dev/null localhost:8765 || { setsid nohup python3 -m http.server 8765 --directory /home/claude/cajon/public >/tmp/srv.log 2>&1 < /dev/null & sleep 1.2; }
