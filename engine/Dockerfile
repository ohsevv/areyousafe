# Use official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=True
ENV PORT=8080

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8080

# Command to run the application using Gunicorn
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 app:app
