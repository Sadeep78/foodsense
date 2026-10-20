.PHONY: install start dev-backend dev-frontend test

install:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

start:
	node run.js

dev-backend:
	cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

dev-frontend:
	cd frontend && npm run dev

test:
	python -m pytest
