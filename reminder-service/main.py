#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
سیستم یادآوری سرویس دوره‌ای خودروها
Python Cron Job برای بررسی و ایجاد نوتیفیکیشن
"""

import os
import sys
import logging
from datetime import datetime, timedelta
from dotenv import load_dotenv

# بررسی نصب بودن کتابخانه‌ها
try:
    from supabase import create_client, Client
    import schedule
    import time
except ImportError as e:
    print(f"❌ خطا: کتابخانه مورد نیاز نصب نیست: {e}")
    print("لطفاً اجرا کنید: pip install -r requirements.txt")
    sys.exit(1)

# بارگذاری متغیرهای محیطی
load_dotenv()

# تنظیمات لاگ
logging.basicConfig(
    level=getattr(logging, os.environ.get("LOG_LEVEL", "INFO").upper()),
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

# بارگذاری متغیرهای محیطی
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
CRON_TIME = os.environ.get("CRON_TIME", "08:00")

# بررسی متغیرهای ضروری
if not SUPABASE_URL:
    logging.error("❌ خطا: متغیر SUPABASE_URL تنظیم نشده است")
    sys.exit(1)

if not SUPABASE_SERVICE_ROLE_KEY:
    logging.error("❌ خطا: متغیر SUPABASE_SERVICE_ROLE_KEY تنظیم نشده است")
    sys.exit(1)

# ایجاد کلاینت Supabase
try:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    logging.info("✅ اتصال به Supabase برقرار شد")
except Exception as e:
    logging.error(f"❌ خطا در اتصال به Supabase: {str(e)}")
    sys.exit(1)


def check_time_based_reminders():
    """
    بررسی یادآورهای زمانی و ایجاد نوتیفیکیشن
    بر اساس تنظیمات متفاوت برای هر خودرو
    """
    logging.info("=" * 60)
    logging.info("شروع بررسی یادآورهای زمانی...")
    logging.info(f"تاریخ و زمان فعلی: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # خواندن تمام خودروهای فعال با تنظیمات یادآوری زمانی
        vehicles_response = supabase.rpc('get_vehicles_for_reminder').execute()
        
        if not vehicles_response.data:
            logging.info("هیچ خودرویی برای یادآوری پیدا نشد")
            logging.info("=" * 60)
            return
        
        logging.info(f"تعداد {len(vehicles_response.data)} خودرو برای بررسی پیدا شد")
        
        notifications_created = 0
        notifications_skipped = 0
        
        for vehicle in vehicles_response.data:
            try:
                # خواندن آخرین سرویس ثبت شده برای این خودرو
                last_service = supabase.table("services") \
                    .select("*") \
                    .eq("vehicle_id", vehicle["vehicle_id"]) \
                    .order("service_date_gregorian", desc=True) \
                    .limit(1) \
                    .execute()
                
                if not last_service.data:
                    logging.warning(f"⚠️  خودرو {vehicle['model']} ({vehicle['plate_number']}) - سرویسی ثبت نشده")
                    notifications_skipped += 1
                    continue
                
                # تبدیل تاریخ آخرین سرویس به date object
                last_date = datetime.strptime(
                    last_service.data[0]["service_date_gregorian"], 
                    "%Y-%m-%d"
                ).date()
                
                # محاسبه روزهای گذشته از آخرین سرویس
                today = datetime.now().date()
                days_since_last = (today - last_date).days
                
                # خواندن تنظیمات از vehicle
                interval_days = vehicle["interval_days"]
                warning_days = vehicle["warning_days_before"]
                
                # محاسبه روزهای مانده تا موعد بعدی
                days_until_due = interval_days - days_since_last
                
                logging.info(f"🔍  بررسی: {vehicle['model']} ({vehicle['plate_number']})")
                logging.info(f"   - آخرین سرویس: {last_date}")
                logging.info(f"   - روزهای گذشته: {days_since_last}")
                logging.info(f"   - دوره سرویس: {interval_days} روز")
                logging.info(f"   - روزهای مانده: {days_until_due} روز")
                logging.info(f"   - هشدار: {warning_days} روز قبل")
                
                # بررسی آیا در بازه هشدار است؟
                if 0 < days_until_due <= warning_days:
                    logging.info(f"   ✅ در بازه هشدار: {days_until_due} روز مانده")
                    
                    # بررسی اینکه قبلاً برای این موعد نوتیفیکیشن ارسال نشده باشد
                    existing = supabase.table("notifications") \
                        .select("*") \
                        .eq("vehicle_id", vehicle["vehicle_id"]) \
                        .eq("type", "reminder") \
                        .eq("read", False) \
                        .gte("created_at", (datetime.now() - timedelta(days=warning_days + 1)).isoformat()) \
                        .execute()
                    
                    # بررسی دقیق‌تر: آیا نوتیفیکیشن با همان days_until_due وجود دارد؟
                    notification_exists = False
                    if existing.data:
                        for notif in existing.data:
                            metadata = notif.get("metadata", {})
                            if metadata.get("days_until_due") == days_until_due:
                                notification_exists = True
                                break
                    
                    if notification_exists:
                        logging.info(f"   ⏭️  نوتیفیکیشن قبلاً ارسال شده")
                        notifications_skipped += 1
                        continue
                    
                    # محاسبه تاریخ موعد
                    due_date = last_date + timedelta(days=interval_days)
                    
                    # ایجاد نوتیفیکیشن جدید
                    notification = {
                        "user_id": vehicle["user_id"],
                        "vehicle_id": vehicle["vehicle_id"],
                        "title": "یادآوری سرویس دوره‌ای",
                        "body": f"خودرو {vehicle['model']} ({vehicle['plate_number']}) نیاز به سرویس دوره‌ای دارد. {days_until_due} روز تا موعد ({interval_days} روز) باقی مانده است.",
                        "type": "reminder",
                        "metadata": {
                            "vehicle_model": vehicle["model"],
                            "plate_number": vehicle["plate_number"],
                            "days_until_due": days_until_due,
                            "interval_days": interval_days,
                            "last_service_date": last_service.data[0]["service_date_gregorian"],
                            "due_date": due_date.isoformat(),
                            "warning_days_before": warning_days
                        }
                    }
                    
                    result = supabase.table("notifications").insert(notification).execute()
                    
                    if result.data:
                        logging.info(f"   ✅ نوتیفیکیشن ایجاد شد")
                        notifications_created += 1
                    else:
                        logging.error(f"   ❌ خطا در ایجاد نوتیفیکیشن")
                        notifications_skipped += 1
                
                else:
                    if days_until_due <= 0:
                        logging.warning(f"   ⚠️  موعد سرویس گذشته است ({days_until_due} روز)")
                    else:
                        logging.info(f"   ⏭️  خارج از بازه هشدار ({days_until_due} روز مانده)")
                    notifications_skipped += 1
                
            except Exception as e:
                logging.error(f"❌ خطا در پردازش خودرو {vehicle.get('model', 'unknown')}: {str(e)}")
                logging.exception("جزئیات خطا:")
                notifications_skipped += 1
                continue
        
        logging.info("=" * 60)
        logging.info(f"✅ پایان بررسی یادآورها")
        logging.info(f"   - نوتیفیکیشن ایجاد شده: {notifications_created}")
        logging.info(f"   - نوتیفیکیشن رد شده: {notifications_skipped}")
        logging.info("=" * 60)
        
    except Exception as e:
        logging.error(f"❌ خطا در دریافت لیست خودروها: {str(e)}")
        logging.exception("جزئیات خطا:")


def main():
    """
    اجرای اصلی برنامه
    """
    logging.info("🚀 سرویس یادآوری سرویس دوره‌ای شروع شد")
    logging.info(f"⏰ زمان اجرا: {CRON_TIME}")
    logging.info(f"🔗 Supabase: {SUPABASE_URL}")
    
    # تنظیم Cron Job
    schedule.every().day.at(CRON_TIME).do(check_time_based_reminders)
    
    # اجرای اولیه برای تست
    logging.info("🔄 اجرای اولیه برای تست...")
    check_time_based_reminders()
    
    # حلقه اصلی
    logging.info("⏳ انتظار برای اجرای بعدی...")
    while True:
        schedule.run_pending()
        time.sleep(60)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logging.info("\n👋 برنامه توسط کاربر متوقف شد")
        sys.exit(0)
    except Exception as e:
        logging.error(f"❌ خطای پیش‌بینی نشده: {str(e)}")
        logging.exception("جزئیات خطا:")
        sys.exit(1)

