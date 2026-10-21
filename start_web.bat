@echo off
rem 開機時在背景(無視窗)啟動網站伺服器，Cloudflare Tunnel 會把網址轉到 127.0.0.1:8080
start "" /B "C:\Users\za135\AppData\Local\Programs\Python\Python311\pythonw.exe" "D:\db_backups\overnight_stockcode_online\serve.py"
