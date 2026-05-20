# AgroAI: Crop Type Classification System

AgroAI is a full-stack application that uses deep learning to classify crop types from satellite data. It supports two types of analysis:
1. **NDVI Time-Series**: Using LSTM models to analyze 6 months of vegetation index data.
2. **Satellite Imagery**: Using CNN models to analyze visual satellite field imagery.

## Project Structure
- `backend/`: FastAPI application, database logic, and API endpoints.
- `frontend/`: React + Vite + Tailwind CSS dashboard.
- `ml/`: Data generation and model training scripts.
- `models/`: Pre-trained models (H5 and PKL files).
- `dataset/`: Generated synthetic data.

## Quick Start (Docker)
The easiest way to run the entire system is using Docker:

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

## Local Development (Manual)

### 1. Data Generation & Training (Optional)
If you need to regenerate data or retrain models:
```bash
# Generate synthetic data
python ml/generate_data.py

# Train LSTM model
python ml/train_ndvi.py

# Train CNN model
python ml/train_image.py
```

### 2. Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Run backend
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Access the dashboard at `http://localhost:5173`.

## Technical Stack
- **Backend**: FastAPI, SQLAlchemy (SQLite), JWT Authentication.
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide Icons.
- **AI/ML**: TensorFlow/Keras (LSTM & CNN), Scikit-learn, OpenCV.

## License
MIT
