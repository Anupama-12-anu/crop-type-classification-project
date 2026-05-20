import os
import numpy as np
import pandas as pd
import cv2

# Configuration
CROP_TYPES = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Soybean']
NUM_NDVI_SAMPLES_PER_CROP = 500
NUM_IMAGES_PER_CROP = 100
IMAGE_SIZE = (128, 128)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, 'dataset')
IMAGE_DIR = os.path.join(DATASET_DIR, 'images')

def generate_ndvi_data():
    print("Generating NDVI Data...")
    data = []
    
    # Synthetic profiles for different crops (mean, std for 6 months)
    profiles = {
        'Rice': [0.2, 0.4, 0.7, 0.8, 0.6, 0.3],
        'Wheat': [0.3, 0.6, 0.8, 0.7, 0.4, 0.2],
        'Maize': [0.2, 0.3, 0.6, 0.8, 0.7, 0.3],
        'Cotton': [0.1, 0.2, 0.5, 0.7, 0.8, 0.4],
        'Sugarcane': [0.4, 0.6, 0.7, 0.8, 0.8, 0.7],
        'Soybean': [0.2, 0.4, 0.7, 0.8, 0.5, 0.2]
    }
    
    for crop in CROP_TYPES:
        profile = profiles[crop]
        for _ in range(NUM_NDVI_SAMPLES_PER_CROP):
            # Add some random noise to the profile
            noise = np.random.normal(0, 0.05, 6)
            sample_ndvi = np.clip(np.array(profile) + noise, 0, 1)
            
            row = {
                'ndvi_1': sample_ndvi[0],
                'ndvi_2': sample_ndvi[1],
                'ndvi_3': sample_ndvi[2],
                'ndvi_4': sample_ndvi[3],
                'ndvi_5': sample_ndvi[4],
                'ndvi_6': sample_ndvi[5],
                'crop_type': crop
            }
            data.append(row)
            
    df = pd.DataFrame(data)
    # Shuffle dataset
    df = df.sample(frac=1).reset_index(drop=True)
    
    csv_path = os.path.join(DATASET_DIR, 'ndvi_dataset.csv')
    df.to_csv(csv_path, index=False)
    print(f"NDVI dataset saved to {csv_path}")

def generate_images():
    print("Generating Image Data...")
    
    # Base colors for crops (B, G, R)
    colors = {
        'Rice': (0, 200, 0),       # Green
        'Wheat': (0, 200, 255),    # Yellowish
        'Maize': (50, 205, 50),    # Lime green
        'Cotton': (255, 255, 255), # White/light
        'Sugarcane': (0, 100, 0),  # Dark green
        'Soybean': (144, 238, 144) # Light green
    }
    
    for crop in CROP_TYPES:
        crop_dir = os.path.join(IMAGE_DIR, crop)
        os.makedirs(crop_dir, exist_ok=True)
        
        base_color = colors[crop]
        
        for i in range(NUM_IMAGES_PER_CROP):
            # Create a base image
            img = np.zeros((IMAGE_SIZE[0], IMAGE_SIZE[1], 3), dtype=np.uint8)
            img[:] = base_color
            
            # Add random noise and shapes to make it look like a field
            noise = np.random.randint(0, 50, (IMAGE_SIZE[0], IMAGE_SIZE[1], 3), dtype=np.uint8)
            img = cv2.add(img, noise)
            
            # Draw some random lines (representing crop rows)
            for _ in range(5):
                pt1 = (np.random.randint(0, IMAGE_SIZE[0]), 0)
                pt2 = (np.random.randint(0, IMAGE_SIZE[0]), IMAGE_SIZE[1])
                cv2.line(img, pt1, pt2, (0, 50, 0), 2)
            
            img_path = os.path.join(crop_dir, f'{crop.lower()}_{i}.jpg')
            cv2.imwrite(img_path, img)
            
    print(f"Image dataset saved to {IMAGE_DIR}")

if __name__ == "__main__":
    os.makedirs(DATASET_DIR, exist_ok=True)
    generate_ndvi_data()
    generate_images()
    print("Data generation complete.")
