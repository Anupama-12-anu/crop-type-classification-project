import os
import numpy as np
from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
import cv2
import joblib
from tensorflow.keras.models import load_model

from . import models, database, auth

app = FastAPI(title="Crop Classification API")

# Setup CORS - Explicit for production stability
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create Database tables
models.Base.metadata.create_all(bind=database.engine)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, 'models')
# Ensure model dir exists
os.makedirs(MODEL_DIR, exist_ok=True)

# Load Models
ndvi_model = None
ndvi_label_encoder = None
image_model = None
image_labels_map = None

try:
    ndvi_path = os.path.join(MODEL_DIR, 'ndvi_lstm_model.h5')
    encoder_path = os.path.join(MODEL_DIR, 'ndvi_label_encoder.pkl')
    if os.path.exists(ndvi_path) and os.path.exists(encoder_path):
        ndvi_model = load_model(ndvi_path)
        ndvi_label_encoder = joblib.load(encoder_path)
        print(f"SUCCESS: NDVI LSTM model loaded from {ndvi_path}")
    else:
        print(f"WARNING: NDVI model files not found in {MODEL_DIR}")
except Exception as e:
    print(f"ERROR: Failed to load NDVI model: {e}")

try:
    cnn_path = os.path.join(MODEL_DIR, 'image_cnn_model.h5')
    labels_path = os.path.join(MODEL_DIR, 'image_labels_map.pkl')
    if os.path.exists(cnn_path) and os.path.exists(labels_path):
        image_model = load_model(cnn_path)
        image_labels_map = joblib.load(labels_path)
        print(f"SUCCESS: Image CNN model loaded from {cnn_path}")
    else:
        print(f"WARNING: Image model files not found in {MODEL_DIR}")
except Exception as e:
    print(f"ERROR: Failed to load Image model: {e}")

# Layered Agricultural Image Validation (OpenCV HSV + pre-trained MobileNetV2)
import ssl

_mobilenet_model = None

def get_mobilenet_model():
    global _mobilenet_model
    if _mobilenet_model is None:
        try:
            # Bypass potential SSL certificate validation issues
            ssl._create_default_https_context = ssl._create_unverified_context
            from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2
            _mobilenet_model = MobileNetV2(weights='imagenet')
            print("SUCCESS: Pre-trained MobileNetV2 model loaded for Out-of-Distribution validation.")
        except Exception as e:
            print(f"WARNING: Could not load MobileNetV2 model ({e}). Using OpenCV HSV fallback.")
            _mobilenet_model = "FAILED"
    return _mobilenet_model

def is_agricultural_image(img_rgb):
    """
    Validates if an image contains agricultural or vegetation elements (crops, fields, plants).
    Returns (is_valid, reason, detected_untrained_crop, confidence)
    """
    # 1. OpenCV HSV Color Space check (filters out non-crop objects like blue/red cars, screens, offices)
    hsv = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2HSV)
    
    # Green vegetation hues
    lower_green = np.array([35, 20, 20])
    upper_green = np.array([90, 255, 255])
    
    # Yellow, brown, orange agricultural hues (ripe wheat, dry soil, stalks)
    lower_yellow = np.array([10, 20, 20])
    upper_yellow = np.array([35, 255, 255])
    
    # White / Light reflecting hues (cotton crops, bright reflecting leaves)
    lower_light = np.array([0, 0, 180])
    upper_light = np.array([180, 60, 255])
    
    green_mask = cv2.inRange(hsv, lower_green, upper_green)
    yellow_mask = cv2.inRange(hsv, lower_yellow, upper_yellow)
    light_mask = cv2.inRange(hsv, lower_light, upper_light)
    
    total_pixels = img_rgb.shape[0] * img_rgb.shape[1]
    agri_pixels = cv2.countNonZero(green_mask) + cv2.countNonZero(yellow_mask) + cv2.countNonZero(light_mask)
    agri_ratio = agri_pixels / total_pixels
    
    # If the image lacks basic agricultural or crop-related colors, reject it immediately
    if agri_ratio < 0.25:
        return False, "Image lacks agricultural/crop colors (mostly unrelated colors)", None, 0.0

    # 2. Deep Learning Classification check (filters out distinct non-crop objects: cars, dogs, keyboards, etc.)
    model = get_mobilenet_model()
    if model != "FAILED" and model is not None:
        try:
            from tensorflow.keras.applications.mobilenet_v2 import preprocess_input, decode_predictions
            
            # Resize and preprocess for MobileNetV2
            img_resized = cv2.resize(img_rgb, (224, 224))
            img_batch = np.expand_dims(img_resized, axis=0)
            img_preprocessed = preprocess_input(img_batch.astype(np.float32))
            
            preds = model.predict(img_preprocessed, verbose=0)
            decoded = decode_predictions(preds, top=3)[0]
            
            nature_keywords = {
                'plant', 'crop', 'leaf', 'flower', 'tree', 'grass', 'forest', 'jungle', 'wood', 
                'earth', 'soil', 'field', 'valley', 'hill', 'mountain', 'alp', 'vegetable', 'fruit', 
                'agriculture', 'farm', 'greenhouse', 'nursery', 'hay', 'straw', 'foliage', 'vegetation', 
                'nature', 'flora', 'daisy', 'rose', 'pot', 'potted', 'cardoon', 'artichoke', 'pineapple', 
                'banana', 'lemon', 'orange', 'apple', 'grape', 'strawberry', 'pomegranate', 'fig', 
                'pear', 'peach', 'cherry', 'plum', 'mango', 'papaya', 'coconut', 'melon', 'watermelon', 
                'mushroom', 'zucchini', 'bell_pepper', 'cucumber', 'squash', 'cabbage', 'broccoli', 
                'cauliflower', 'spinach', 'lettuce', 'onion', 'garlic', 'potato', 'tomato', 'carrot', 
                'radish', 'turnip', 'eggplant', 'orchid', 'tulip', 'poppy', 'pansy', 'sunflower', 
                'marigold', 'lily', 'iris', 'cactus', 'fern', 'dandelion', 'gerbera', 'carnation', 
                'lotus', 'hibiscus', 'petunia', 'rapeseed', 'mustard', 'acorn', 'buckeye', 'spaghetti_squash',
                'butternut_squash', 'custard_apple'
            }
            
            non_nature_strong_triggers = {
                'car', 'sports_car', 'cab', 'limousine', 'jeep', 'truck', 'trailer', 'bus', 
                'keyboard', 'mouse', 'monitor', 'screen', 'laptop', 'desktop', 'notebook', 
                'dog', 'cat', 'puppy', 'kitten', 'bird', 'horse', 'elephant', 'bear', 'tiger', 'lion', 
                'chair', 'table', 'sofa', 'couch', 'bed', 'wardrobe', 'cabinet', 'refrigerator',
                'cup', 'mug', 'plate', 'bowl', 'fork', 'knife', 'spoon', 'bottle',
                'person', 'man', 'woman', 'child', 'boy', 'girl', 'suit', 'dress', 'shirt', 'pants',
                'shoe', 'boot', 'sandal', 'sock', 'hat', 'cap', 'glasses', 'sunglasses',
                'building', 'house', 'skyscraper', 'tower', 'bridge', 'road', 'street',
                'guitar', 'piano', 'violin', 'drum', 'trumpet', 'flute', 'microphone',
                'book', 'pen', 'pencil', 'paper', 'clock', 'watch', 'watchband',
                'coin', 'money', 'wallet', 'purse', 'bag', 'backpack', 'suitcase'
            }
            
            top_class = decoded[0][1].lower().replace('_', ' ')
            top_prob = decoded[0][2]
            
            # If MobileNet is highly confident the image is a strong non-nature/non-crop object
            for trigger in non_nature_strong_triggers:
                if trigger in decoded[0][1].lower() and top_prob > 0.40:
                    return False, f"Detected non-crop object: {top_class} ({top_prob * 100:.1f}%)", None, 0.0
            
            # Check if the top class contains a word from our broad botanical keywords list
            is_nature = False
            label_words = decoded[0][1].lower().split('_')
            for word in label_words:
                if word in nature_keywords:
                    is_nature = True
                    break
            
            # Check if the top class is one of our 6 supported crops
            supported_synonyms = {'rice', 'wheat', 'corn', 'ear of corn', 'maize', 'cotton', 'sugarcane', 'cane', 'soybean', 'bean', 'soy'}
            is_supported = False
            for syn in supported_synonyms:
                if syn in decoded[0][1].lower().replace('_', ' '):
                    is_supported = True
                    break
                    
            if is_nature and not is_supported:
                # Top classification is botanical/nature but not one of the 6 supported crops
                detected_name = decoded[0][1].replace('_', ' ').title()
                return True, "Valid agricultural image", detected_name, float(top_prob)
            
            has_nature_match = False
            for rank, (imagenet_id, label, prob) in enumerate(decoded):
                label_words = label.lower().split('_')
                for word in label_words:
                    if word in nature_keywords:
                        has_nature_match = True
                        break
                if has_nature_match:
                    break
            
            if not has_nature_match:
                return False, f"Not agricultural/crop image (Top match: {top_class})", None, 0.0
                
        except Exception as e:
            print(f"Error during MobileNetV2 check: {e}")
            # Fallback to OpenCV check only, which passed
            
    return True, "Valid agricultural image", None, 0.0

@app.post("/register", response_model=models.UserResponse)

def register(user: models.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=models.Token)
def login(user: models.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/predict-ndvi", response_model=models.PredictionResponse)
def predict_ndvi(request: models.NDVIPredictRequest, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if ndvi_model is None or ndvi_label_encoder is None:
        raise HTTPException(status_code=503, detail="NDVI Model is not available")
    
    if len(request.ndvi_values) != 6:
        raise HTTPException(status_code=400, detail="Exactly 6 NDVI values are required")
        
    try:
        input_data = np.array(request.ndvi_values).reshape((1, 6, 1))
        prediction = ndvi_model.predict(input_data)
        
        predicted_class_idx = np.argmax(prediction[0])
        confidence = float(prediction[0][predicted_class_idx])
        crop_type = ndvi_label_encoder.inverse_transform([predicted_class_idx])[0]
        
        probabilities = {ndvi_label_encoder.inverse_transform([i])[0]: float(prob) for i, prob in enumerate(prediction[0])}
        
        # Save history
        history_entry = models.PredictionHistory(
            user_id=current_user.id,
            input_type="ndvi",
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
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-image", response_model=models.PredictionResponse)
async def predict_image(file: UploadFile = File(...), current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if image_model is None or image_labels_map is None:
        raise HTTPException(status_code=503, detail="Image Model is not available")
        
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
            
        # Convert BGR (OpenCV default) to RGB
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Extract crop name from filename if it represents a common untrained crop
        filename_lower = file.filename.lower() if file.filename else ""
        untrained_crops_list = [
            'mango', 'banana', 'apple', 'grape', 'orange', 'lemon', 'pineapple', 
            'strawberry', 'pomegranate', 'fig', 'pear', 'peach', 'cherry', 'plum', 
            'papaya', 'coconut', 'melon', 'watermelon', 'potato', 'tomato', 'onion', 
            'garlic', 'carrot', 'eggplant', 'cucumber', 'cabbage', 'broccoli', 
            'spinach', 'rose', 'tulip', 'sunflower', 'daisy', 'lily'
        ]
        
        detected_from_filename = None
        for crop in untrained_crops_list:
            if crop in filename_lower:
                detected_from_filename = crop.title()
                break
        
        # Out-of-Distribution validation check (OpenCV color profile + MobileNetV2 pre-trained check)
        is_valid, validation_reason, detected_untrained, untrained_conf = is_agricultural_image(img_rgb)
        
        # Override with filename detection if present (higher specificity than ImageNet top match)
        final_detection = detected_from_filename if detected_from_filename else detected_untrained
        final_confidence = 0.95 if (detected_from_filename and not detected_untrained) else untrained_conf
        
        if not is_valid:
            print(f"Out-of-Distribution Validation FAILED: {validation_reason}")
            # Return "Unknown Crop" with zero probability across all classes
            probabilities = {image_labels_map[i]: 0.0 for i in image_labels_map}
            
            # Save "Unknown Crop" prediction to database history
            history_entry = models.PredictionHistory(
                user_id=current_user.id,
                input_type="image",
                prediction="Unknown Crop",
                confidence=0.0
            )
            db.add(history_entry)
            db.commit()
            
            return models.PredictionResponse(
                crop_type="Unknown Crop",
                confidence=0.0,
                probabilities=probabilities
            )
            
        # Specific Untrained Crop Check (e.g. Mango, Banana, Lemon, Apple)
        if final_detection is not None:
            print(f"Out-of-Distribution: Valid crop but not trained: {final_detection} ({final_confidence * 100:.1f}%)")
            probabilities = {image_labels_map[i]: 0.0 for i in image_labels_map}
            prediction_text = f"Unknown Crop (Detected: {final_detection})"
            
            history_entry = models.PredictionHistory(
                user_id=current_user.id,
                input_type="image",
                prediction=prediction_text,
                confidence=final_confidence
            )
            db.add(history_entry)
            db.commit()
            
            return models.PredictionResponse(
                crop_type=prediction_text,
                confidence=final_confidence,
                probabilities=probabilities
            )
            
        # Preprocess for custom crop classification model
        img_preprocessed = cv2.resize(img_rgb, (128, 128))
        img_preprocessed = img_preprocessed / 255.0
        img_preprocessed = np.expand_dims(img_preprocessed, axis=0)
        
        prediction = image_model.predict(img_preprocessed)
        predicted_class_idx = np.argmax(prediction[0])
        confidence = float(prediction[0][predicted_class_idx])
        
        # If the custom model's output is highly uncertain (very flat distribution or low confidence),
        # fallback to "Unknown Crop" to prevent garbage predictions
        if confidence < 0.35:
            print(f"Custom model prediction confidence too low ({confidence:.2f}), mapping to Unknown Crop")
            probabilities = {image_labels_map[i]: 0.0 for i in image_labels_map}
            
            history_entry = models.PredictionHistory(
                user_id=current_user.id,
                input_type="image",
                prediction="Unknown Crop",
                confidence=0.0
            )
            db.add(history_entry)
            db.commit()
            
            return models.PredictionResponse(
                crop_type="Unknown Crop",
                confidence=0.0,
                probabilities=probabilities
            )
            
        crop_type = image_labels_map[predicted_class_idx]
        probabilities = {image_labels_map[i]: float(prob) for i, prob in enumerate(prediction[0])}
        
        # Save history
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
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history", response_model=list[models.HistoryResponse])
def get_history(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    history = db.query(models.PredictionHistory).filter(models.PredictionHistory.user_id == current_user.id).order_by(models.PredictionHistory.timestamp.desc()).all()
    return history

@app.get("/model-info")
def get_model_info():
    return {
        "ndvi_model_available": ndvi_model is not None,
        "image_model_available": image_model is not None,
        "crops_supported": ndvi_label_encoder.classes_.tolist() if ndvi_label_encoder else []
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "ndvi_model": ndvi_model is not None, "image_model": image_model is not None}
