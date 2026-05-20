# AgroAI: Crop Type Classification Using Satellite Time Series & Deep Learning
## Master Code Demonstration Guide

This document compiles the core, high-impact code snippets from the **AgroAI** codebase. These snippets demonstrate the implementation of your deep learning architectures, FastAPI endpoints, diagnostic systems, and programmatic scripts. They are thoroughly documented and formatted for easy insertion into your presentation slides (PPT) or final project report.

---

## 📂 Table of Contents
1. [🧠 Module 1: The Machine Learning Architectures](#-module-1-the-machine-learning-architectures)
   - [A. Temporal NDVI LSTM Classifier (`ml/train_ndvi.py`)](#a-temporal-ndvi-lstm-classifier-mltrain_ndvipy)
   - [B. Spatial Satellite Image CNN Classifier (`ml/train_image.py`)](#b-spatial-satellite-image-cnn-classifier-mltrain_imagepy)
2. [⚙️ Module 2: The FastAPI Backend Controller](#-module-2-the-fastapi-backend-controller)
   - [A. Time-Series NDVI Inference Route (`backend/main.py`)](#a-time-series-ndvi-inference-route-backendmainpy)
   - [B. Satellite Image Preprocessing & Inference Route (`backend/main.py`)](#b-satellite-image-preprocessing--inference-route-backendmainpy)
3. [💻 Module 3: Standalone Verification & Diagnostic Scripts](#-module-3-standalone-verification--diagnostic-scripts)
   - [A. Programmatic API Integration Test (`scratch/test_prediction.py`)](#a-programmatic-api-integration-test-scratchtest_predictionpy)
   - [B. Interactive System Health Diagnostic Tool (`Diagnostic_Tool.py`)](#b-interactive-system-health-diagnostic-tool-diagnostic_toolpy)
   - [C. One-Click Launcher Script (`Launch_AgroAI.bat`)](#c-one-click-launcher-script-launch_agroaibat)

---

## 🧠 Module 1: The Machine Learning Architectures

Your project uses a dual-model paradigm to classify crops:
* **LSTM (Long Short-Term Memory)**: Classifies crop types based on a 6-month time-series sequence of NDVI (Normalized Difference Vegetation Index) values.
* **CNN (Convolutional Neural Network)**: Classifies crop types based on 128x128 pixel spatial satellite imagery.

### A. Temporal NDVI LSTM Classifier (`ml/train_ndvi.py`)
This snippet shows the definition of the Keras `Sequential` LSTM network. The model is designed to read a sequence of 6 values representing the monthly agricultural growth signature of a crop.

```python
# File Path: ml/train_ndvi.py
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

def build_ndvi_lstm_model(num_classes):
    """
    Builds a deep LSTM recurrent network optimized for 6-month temporal sequences.
    
    - Input shape is (6, 1): 6 time steps (months) and 1 feature (NDVI index).
    - Uses 'relu' activation for the temporal state transitions.
    - Dropout is applied between LSTM layers to prevent overfitting.
    """
    model = Sequential([
        # Layer 1: Recurrent LSTM layer with 64 memory cells
        LSTM(64, activation='relu', input_shape=(6, 1), return_sequences=True),
        Dropout(0.2),  # Regularization to prevent overfitting
        
        # Layer 2: Final recurrent layer returning a dense state
        LSTM(32, activation='relu'),
        Dropout(0.2),
        
        # Layer 3: Fully Connected Layer
        Dense(32, activation='relu'),
        
        # Layer 4: Softmax Output Layer yielding class probabilities
        Dense(num_classes, activation='softmax')
    ])
    
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    return model
```

### B. Spatial Satellite Image CNN Classifier (`ml/train_image.py`)
This snippet shows your deep CNN model, which automatically extracts features like spatial geometries, crop patterns, and field borders from satellite photos.

```python
# File Path: ml/train_image.py
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout

def build_spatial_cnn_model(num_classes, image_size=(128, 128)):
    """
    Builds a 2D Convolutional Neural Network for spatial satellite image classification.
    
    - Accepts 128x128 RGB images (3 channels).
    - Progressive feature extraction using Convolution + Max Pooling blocks.
    - Flattening and fully connected classification with Dropout regularization.
    """
    model = Sequential([
        # Convolution Block 1: Extracts low-level features (edges, lines)
        Conv2D(32, (3, 3), activation='relu', input_shape=(image_size[0], image_size[1], 3)),
        MaxPooling2D(2, 2),  # Halves spatial dimensions
        
        # Convolution Block 2: Extracts mid-level features (textures, curves)
        Conv2D(64, (3, 3), activation='relu'),
        MaxPooling2D(2, 2),
        
        # Convolution Block 3: Extracts high-level features (shapes, field layouts)
        Conv2D(128, (3, 3), activation='relu'),
        MaxPooling2D(2, 2),
        
        # Flattening: Translates 2D feature maps into a 1D vector
        Flatten(),
        
        # Dense Layer with Dropout for robust classification
        Dense(128, activation='relu'),
        Dropout(0.5),
        
        # Output Layer: Softmax distribution across crop types
        Dense(num_classes, activation='softmax')
    ])
    
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    return model
```

---

## ⚙️ Module 2: The FastAPI Backend Controller

The FastAPI backend securely verifies incoming requests using **JWT (JSON Web Tokens)**, loads the `.h5` deep learning models into memory, performs data preprocessing, runs inference, and logs history into the SQLite database.

### A. Time-Series NDVI Inference Route (`backend/main.py`)
This endpoint accepts a POST request containing exactly 6 NDVI values, authenticates the active user, reshapes the data to meet the LSTM's 3D requirement, predicts the crop type, and saves the history log.

```python
# File Path: backend/main.py (NDVI Route)
import numpy as np
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, database, auth

app = FastAPI()

# Loaded globally during startup
ndvi_model = ...  # Loaded via tensorflow.keras.models.load_model
ndvi_label_encoder = ...  # Loaded via joblib.load

@app.post("/predict-ndvi", response_model=models.PredictionResponse)
def predict_ndvi(
    request: models.NDVIPredictRequest, 
    current_user: models.User = Depends(auth.get_current_user), 
    db: Session = Depends(database.get_db)
):
    """
    Receives 6 monthly NDVI values, reshapes for the LSTM model,
    returns crop classification with probability logs, and persists records.
    """
    if ndvi_model is None or ndvi_label_encoder is None:
        raise HTTPException(status_code=503, detail="NDVI LSTM model not loaded.")
    
    if len(request.ndvi_values) != 6:
        raise HTTPException(status_code=400, detail="Exactly 6 NDVI values are required")
        
    try:
        # Step 1: Reshape 1D input [x1, x2... x6] into 3D LSTM tensor: [1, 6, 1]
        input_data = np.array(request.ndvi_values).reshape((1, 6, 1))
        
        # Step 2: Perform Model Inference
        prediction = ndvi_model.predict(input_data)
        
        # Step 3: Extract predicted class index and confidence percentage
        predicted_class_idx = np.argmax(prediction[0])
        confidence = float(prediction[0][predicted_class_idx])
        crop_type = ndvi_label_encoder.inverse_transform([predicted_class_idx])[0]
        
        # Step 4: Generate a dictionary mapping of all crop probabilities
        probabilities = {
            ndvi_label_encoder.inverse_transform([i])[0]: float(prob) 
            for i, prob in enumerate(prediction[0])
        }
        
        # Step 5: Save transaction details to SQLite database
        history_entry = models.PredictionHistory(
            user_id=current_user.id,
            input_type="ndvi",
            prediction=crop_type,
            confidence=confidence
        )
        db.add(history_entry)
        db.commit()
        
        # Step 6: Return structured response
        return models.PredictionResponse(
            crop_type=crop_type,
            confidence=confidence,
            probabilities=probabilities
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference Error: {str(e)}")
```

### B. Satellite Image Preprocessing & Inference Route (`backend/main.py`)
This route processes high-resolution satellite imagery. It handles file upload, reads the file bytes into an image array via OpenCV, rescales, resizes, runs CNN inference, and logs details.

```python
# File Path: backend/main.py (Image Route)
import cv2
import numpy as np
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from . import models, database, auth

app = FastAPI()
image_model = ...  # Loaded via tensorflow.keras.models.load_model
image_labels_map = ...  # Loaded via joblib.load

@app.post("/predict-image", response_model=models.PredictionResponse)
async def predict_image(
    file: UploadFile = File(...), 
    current_user: models.User = Depends(auth.get_current_user), 
    db: Session = Depends(database.get_db)
):
    """
    Receives an uploaded spatial crop image, decodes and pre-processes 
    it via OpenCV, runs CNN inference, and logs transaction history.
    """
    if image_model is None or image_labels_map is None:
        raise HTTPException(status_code=503, detail="Image CNN Model is not available")
        
    try:
        # Step 1: Read raw upload bytes
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        
        # Step 2: Decode image using OpenCV
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file structure.")
            
        # Step 3: Align color channels (BGR -> RGB) & resize to match CNN model inputs (128x128)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, (128, 128))
        
        # Step 4: Rescale pixel intensities to [0, 1] range & expand dimensions for batch size [1, 128, 128, 3]
        img = img / 255.0
        img = np.expand_dims(img, axis=0)
        
        # Step 5: Run CNN Model Inference
        prediction = image_model.predict(img)
        predicted_class_idx = np.argmax(prediction[0])
        confidence = float(prediction[0][predicted_class_idx])
        crop_type = image_labels_map[predicted_class_idx]
        
        # Step 6: Map classes to prediction probabilities
        probabilities = {
            image_labels_map[i]: float(prob) 
            for i, prob in enumerate(prediction[0])
        }
        
        # Step 7: Record transaction log
        history_entry = models.PredictionHistory(
            user_id=current_user.id,
            input_type="image",
            prediction=crop_type,
            confidence=confidence
        )
        db.add(history_entry)
        db.commit()
        
        return models.PredictionResponse(
            crop_type=crop_type,
            confidence=confidence,
            probabilities=probabilities
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image Processing Error: {str(e)}")
```

---

## 💻 Module 3: Standalone Verification & Diagnostic Scripts

These helper files are used to test and verify the operational integrity of the system in staging/testing environments.

### A. Programmatic API Integration Test (`scratch/test_prediction.py`)
This simple standalone script shows how client applications (like external mobile apps or automation scripts) authenticate via JWT and hit prediction endpoints. It is perfect for demonstrating direct backend interactions.

```python
# File Path: scratch/test_prediction.py
import requests

# Step 1: Securely Log in to get Authorization Token
login_url = "http://localhost:8000/login"
login_data = {
    "email": "test@example.com", 
    "password": "password123"
}
login_response = requests.post(login_url, json=login_data)
token = login_response.json()["access_token"]

# Setup request headers with secure Bearer Token
headers = {"Authorization": f"Bearer {token}"}
print("[SUCCESS] JWT Session Authenticated.")

# Step 2: Send monthly NDVI values to the LSTM prediction service
predict_url = "http://localhost:8000/predict-ndvi"
predict_data = {
    # Sequence of 6 months NDVI: Sowing -> Growth -> Peak -> Ripening -> Harvest
    "ndvi_values": [0.12, 0.24, 0.38, 0.52, 0.67, 0.71]
}
predict_response = requests.post(predict_url, json=predict_data, headers=headers)
print("\nNDVI Prediction Result:")
print(predict_response.json())

# Step 3: Fetch past user prediction queries
history_url = "http://localhost:8000/history"
history_response = requests.get(history_url, headers=headers)
print("\nPrediction History Logs:")
print(history_response.json()[:3])  # Displays the 3 most recent entries
```

### B. Interactive System Health Diagnostic Tool (`Diagnostic_Tool.py`)
A custom verification script designed to test socket port bindings, locate neural network weight files, and verify SQLite table initialization.

```python
# File Path: Diagnostic_Tool.py
import os
import socket

def check_port(port):
    """Probes local socket ports to see if the server processes are active."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def main():
    print("==================================================")
    print("       AgroAI System Diagnostic Utility")
    print("==================================================")

    # 1. Probe Active Ports
    backend_ok = check_port(8000)
    frontend_ok = check_port(5173)
    print(f"[1] Backend Port 8000:  {'[ACTIVE]' if backend_ok else '[FAILED]'}")
    print(f"[2] Frontend Port 5173: {'[ACTIVE]' if frontend_ok else '[FAILED]'}")

    # 2. Check TensorFlow Model Files
    models = [
        'models/ndvi_lstm_model.h5',
        'models/ndvi_label_encoder.pkl',
        'models/image_cnn_model.h5',
        'models/image_labels_map.pkl'
    ]
    print("\n[3] Checking AI weights:")
    for m in models:
        exists = os.path.exists(m)
        print(f"    - {m}: {'FOUND' if exists else 'MISSING'}")

    # 3. Check Local Database Connection
    db_exists = os.path.exists('crop_app.db')
    print(f"\n[4] Local Database (SQLite): {'ONLINE' if db_exists else 'NOT CREATED'}")
    print("==================================================")

if __name__ == "__main__":
    main()
```

### C. One-Click Launcher Script (`Launch_AgroAI.bat`)
This Windows Batch file is what allows the entire complex system to spin up with a single double-click, launching FastAPI in the background and starting React.

```batch
:: File Path: Launch_AgroAI.bat
@echo off
title AgroAI Launcher
echo ==========================================
echo    AgroAI: One-Click System Launcher
echo ==========================================

:: 1. Check & Activate Python Virtual Environment
set PYTHON_EXE=python
if exist "venv\Scripts\python.exe" (
    echo [INFO] Virtual environment detected. Activating...
    set PYTHON_EXE=venv\Scripts\python.exe
)

:: 2. Launch FastAPI Backend on Port 8000 (Asynchronous ASGI server)
echo [1/3] Starting Backend Server (Port 8000)...
start "AgroAI Backend" cmd /k "%PYTHON_EXE% -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"

:: 3. Launch React Frontend using Vite
echo [2/3] Starting Frontend Dev Server...
cd frontend
start "AgroAI Frontend" cmd /k "npm run dev"

:: 4. Delay and Launch Client Browser Window
echo [3/3] Opening Browser in 10 seconds...
timeout /t 10 /nobreak > nul
start http://localhost:5173
echo ==========================================
echo    System is now LIVE!
echo ==========================================
pause
```
