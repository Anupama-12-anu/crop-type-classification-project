import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGE_DIR = os.path.join(BASE_DIR, 'dataset', 'images')
MODEL_DIR = os.path.join(BASE_DIR, 'models')
IMAGE_SIZE = (128, 128)
BATCH_SIZE = 32

def train_image_model():
    print("Training CNN Image Model...")
    
    if not os.path.exists(IMAGE_DIR):
        print(f"Error: Dataset not found at {IMAGE_DIR}. Run generate_data.py first.")
        return

    # Data Augmentation & Generators
    datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.2,
        rotation_range=20,
        horizontal_flip=True
    )
    
    train_generator = datagen.flow_from_directory(
        IMAGE_DIR,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training'
    )
    
    val_generator = datagen.flow_from_directory(
        IMAGE_DIR,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation'
    )
    
    # Save class indices mapping
    os.makedirs(MODEL_DIR, exist_ok=True)
    class_indices = train_generator.class_indices
    # Reverse mapping for prediction
    labels_map = {v: k for k, v in class_indices.items()}
    joblib.dump(labels_map, os.path.join(MODEL_DIR, 'image_labels_map.pkl'))
    
    num_classes = len(class_indices)
    
    # Build CNN Model
    model = Sequential([
        Conv2D(32, (3, 3), activation='relu', input_shape=(IMAGE_SIZE[0], IMAGE_SIZE[1], 3)),
        MaxPooling2D(2, 2),
        Conv2D(64, (3, 3), activation='relu'),
        MaxPooling2D(2, 2),
        Conv2D(128, (3, 3), activation='relu'),
        MaxPooling2D(2, 2),
        Flatten(),
        Dense(128, activation='relu'),
        Dropout(0.5),
        Dense(num_classes, activation='softmax')
    ])
    
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    
    print("Starting training...")
    history = model.fit(
        train_generator,
        epochs=10,
        validation_data=val_generator,
        verbose=1
    )
    
    # Save Model
    model_path = os.path.join(MODEL_DIR, 'image_cnn_model.h5')
    model.save(model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_image_model()
