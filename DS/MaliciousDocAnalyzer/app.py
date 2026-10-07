import http.server
import socketserver
import json
import subprocess
import os
import platform

PORT = 5000

# In-memory storage for the frontend state to pass to C
data_store = {
    "docs": [
        {"name": "suspicious.pdf", "hash": "A12B45"},
        {"name": "report.pdf", "hash": "C78D21"},
        {"name": "suspicious_copy.pdf", "hash": "A12B45"}
    ],
    "devices": ["D1", "D2", "D3", "D4"],
    "connections": [
        {"u": "D1", "v": "D2"},
        {"u": "D2", "v": "D3"},
        {"u": "D1", "v": "D4"}
    ],
    "incidents": [
        {"id": "INC001", "doc": "suspicious.pdf", "hash": "A12B45", "src": "D1", "dest": "D2", "status": "Suspicious", "date": "2026-10-06"},
        {"id": "INC002", "doc": "suspicious.pdf", "hash": "A12B45", "src": "D2", "dest": "D3", "status": "Suspicious", "date": "2026-10-06"},
        {"id": "INC003", "doc": "suspicious.pdf", "hash": "A12B45", "src": "D1", "dest": "D4", "status": "Suspicious", "date": "2026-10-06"}
    ]
}

def build_c_backend():
    compiler = "gcc"
    exe_name = "backend.exe" if platform.system() == "Windows" else "./backend"
    try:
        subprocess.run([compiler, "backend.c", "-o", exe_name], check=True)
        return exe_name
    except Exception as e:
        print("Error compiling C code:", e)
        return None

EXE_PATH = build_c_backend()

def run_c_backend(cmd, args):
    if not EXE_PATH:
        return ["Error: C backend not compiled. Make sure gcc is installed."]
    
    # Prepare input for C program
    input_lines = []
    input_lines.append(str(len(data_store["docs"])))
    for d in data_store["docs"]:
        input_lines.append(f"{d['name']} {d['hash']}")
    
    input_lines.append(str(len(data_store["devices"])))
    for d in data_store["devices"]:
        input_lines.append(d)
        
    input_lines.append(str(len(data_store["connections"])))
    for c in data_store["connections"]:
        input_lines.append(f"{c['u']} {c['v']}")
        
    input_lines.append(str(len(data_store["incidents"])))
    for i in data_store["incidents"]:
        input_lines.append(f"{i['id']} {i['doc']} {i['hash']} {i['src']} {i['dest']} {i['status']} {i['date']}")
        
    input_lines.append(cmd)
    input_lines.extend(args)
    
    input_text = "\n".join(input_lines) + "\n"
    
    try:
        result = subprocess.run([EXE_PATH], input=input_text, text=True, capture_output=True, check=True)
        output = result.stdout
        lines = output.split('\n')
        start_marker = f"{cmd}_RESULT_START"
        end_marker = f"{cmd}_RESULT_END"
        
        start_idx = lines.index(start_marker) if start_marker in lines else -1
        end_idx = lines.index(end_marker) if end_marker in lines else -1
        
        if start_idx != -1 and end_idx != -1:
            return lines[start_idx+1:end_idx]
        return ["Error parsing output"]
    except subprocess.CalledProcessError as e:
        return [f"Error: {e.stderr}"]

class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = '/templates/index.html'
        elif self.path == '/api/state':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(data_store).encode())
            return
        return super().do_GET()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        if self.path == '/api/search_hash':
            h = data.get("hash", "")
            res = run_c_backend("SEARCH", [h]) if "SEARCH" in "SEARCH_HASH" else run_c_backend("SEARCH_HASH", [h])
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"result": res}).encode())
            
        elif self.path == '/api/bfs':
            start = data.get("start", "D1")
            res = run_c_backend("BFS", [start])
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"result": res}).encode())
            
        elif self.path == '/api/dfs':
            start = data.get("start", "D1")
            res = run_c_backend("DFS", [start])
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"result": res}).encode())
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), RequestHandler) as httpd:
        print(f"Serving at http://127.0.0.1:{PORT}")
        httpd.serve_forever()
