#!/usr/bin/env bash
set -o errexit
apt-get update
apt-get install -y tesseract-ocr tesseract-ocr-eng libtesseract-dev
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
