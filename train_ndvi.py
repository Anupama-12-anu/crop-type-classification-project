import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.utils import to_categorical
import matplotlib.pyplot as plt
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, 'dataset', 'ndvi_dataset.csv')
MODEL_DIR = os.path.join(BASE_DIR, 'models')

def train_ndvi_model():
    print("Training NDVI LSTM Model...")
    
    if not os.path.exists(DATASET_PATH):
        print(f"Error: Dataset not found at {DATASET_PATH}. Run generate_data.py first.")
        return
        
    df = pd.read_csv(DATASET_PATH)
    
    X = df[['ndvi_1', 'ndvi_2', 'ndvi_3', 'ndvi_4', 'ndvi_5', 'ndvi_6']].values
    y_raw = df['crop_type'].values
    
    # Reshape X for LSTM: [samples, time steps, features]
    X = X.reshape((X.shape[0], X.shape[1], 1))
    
    # Encode labels
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y_raw)
    y_categorical = to_categorical(y_encoded)
    
    os.makedirs(MODEL_DIR, exist_ok=True)
    # Save label encoder
    joblib.dump(label_encoder, os.path.join(MODEL_DIR, 'ndvi_label_encoder.pkl'))
    
    X_train, X_test, y_train, y_test = train_test_split(X, y_categorical, test_size=0.2, random_state=42)
    
    # Build LSTM Model
    model = Sequential([
        LSTM(64, activation='relu', input_shape=(6, 1), return_sequences=True),
        Dropout(0.2),
        LSTM(32, activation='relu'),
        Dropout(0.2),
        Dense(32, activation='relu'),
        Dense(len(label_encoder.classes_), activation='softmax')
    ])
    
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    
    print("Starting training...")
    history = model.fit(X_train, y_train, epochs=20, batch_size=32, validation_split=0.2, verbose=1)
    
    # Evaluate
    loss, accuracy = model.evaluate(X_test, y_test, verbose=0)
    print(f"Test Accuracy: {accuracy:.4f}")
    
    # Save Model
    model_path = os.path.join(MODEL_DIR, 'ndvi_lstm_model.h5')
    model.save(model_path)
    print(f"Model saved to {model_path}")
    
if __name__ == "__main__":
    train_ndvi_model()
