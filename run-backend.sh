#!/bin/bash
# Run AveloHealth Backend

cd "$(dirname "$0")/backend"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
echo "Starting AveloHealth Backend..."
uvicorn main:app --reload --port 8000
