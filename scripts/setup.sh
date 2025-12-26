#!/bin/bash

echo "🚀 Setting up UHNW Data Platform..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed."
    exit 1
fi

# Create Virtual Environment
echo "📦 Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install Dependencies
echo "⬇️ Installing Python dependencies..."
pip install -r requirements.txt

# Check Terraform
if ! command -v terraform &> /dev/null; then
    echo "⚠️ Terraform is not installed. Please install it to manage infrastructure."
else
    echo "✅ Terraform detected."
fi

echo "✅ Setup complete! Run 'docker-compose up -d' to start local stack."
