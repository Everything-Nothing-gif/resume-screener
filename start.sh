#!/bin/bash

echo "🚀 Starting AI Resume Screening System..."
echo ""

# Start backend
echo "📦 Starting FastAPI Backend on http://localhost:8000"
cd backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

sleep 2

# Start frontend
echo "🌐 Starting React Frontend on http://localhost:5173"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both servers started!"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait and handle shutdown
trap "echo 'Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM
wait
