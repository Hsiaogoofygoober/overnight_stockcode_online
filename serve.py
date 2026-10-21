import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

HOST = "127.0.0.1"
PORT = 8080
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")


class PublicHandler(SimpleHTTPRequestHandler):
    """只服務 public/ 資料夾；不列目錄、不快取，Cloudflare Tunnel 從 127.0.0.1 轉進來。"""

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def list_directory(self, path):
        self.send_error(404, "Not Found")
        return None

    def log_message(self, format, *args):
        pass


if __name__ == "__main__":
    handler = partial(PublicHandler, directory=PUBLIC_DIR)
    with ThreadingHTTPServer((HOST, PORT), handler) as server:
        print(f"Serving {PUBLIC_DIR} on http://{HOST}:{PORT}")
        server.serve_forever()
