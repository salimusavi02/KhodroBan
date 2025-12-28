# استفاده از تصویر Python رسمی
FROM python:3.11-slim

# تنظیم پوشه کاری
WORKDIR /app

# کپی فایل‌های پیکربندی
COPY requirements.txt .

# نصب dependencies
RUN pip install --no-cache-dir -r requirements.txt

# کپی کد اصلی
COPY main.py .

# تنظیم مجوز اجرا
RUN chmod +x main.py

# اجرای برنامه
CMD ["python", "main.py"]

