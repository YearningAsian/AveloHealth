#!/bin/bash
cd /home/colin/AveloHealth
source venv/bin/activate
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
