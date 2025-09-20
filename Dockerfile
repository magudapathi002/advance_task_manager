# Dockerfile

FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install dependencies
COPY backend/requirements /app/requirements
RUN pip install --upgrade pip
RUN pip install -r requirements/base.txt

# Copy project
COPY backend /app

# Expose port
EXPOSE 8002

# Default command is set in docker-compose.yml
