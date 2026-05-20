import os
import socket
import sys

def check_port(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def check_file(path):
    return os.path.exists(path)

def main():
    print("="*50)
    print("   AgroAI System Diagnostic Tool")
    print("="*50)
    print()

    # 1. Check Ports
    print("[1] Checking Ports...")
    backend_ok = check_port(8000)
    frontend_ok = check_port(5173)
    
    print(f"    - Backend (8000): {'RUNNING' if backend_ok else 'NOT RUNNING'}")
    print(f"    - Frontend (5173): {'RUNNING' if frontend_ok else 'NOT RUNNING'}")
    print()

    # 2. Check Models
    print("[2] Checking Models...")
    models = [
        'models/ndvi_lstm_model.h5',
        'models/ndvi_label_encoder.pkl',
        'models/image_cnn_model.h5',
        'models/image_labels_map.pkl'
    ]
    for m in models:
        exists = check_file(m)
        print(f"    - {m}: {'FOUND' if exists else 'MISSING'}")
    print()

    # 3. Check Database
    print("[3] Checking Database...")
    db_exists = check_file('crop_app.db')
    print(f"    - crop_app.db: {'FOUND' if db_exists else 'MISSING'}")
    print()

    print("="*50)
    if backend_ok and frontend_ok:
        print("   SUCCESS: System appears to be running correctly!")
        print("   Open: http://localhost:5173 in your browser.")
    else:
        print("   ISSUE DETECTED: Please run 'Launch_AgroAI.bat' first.")
        if not backend_ok:
            print("   - Backend server is not responding on port 8000.")
        if not frontend_ok:
            print("   - Frontend server is not responding on port 5173.")
    print("="*50)

if __name__ == "__main__":
    main()
