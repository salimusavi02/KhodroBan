#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
نسخه تست سریع برای اجرای فوری
"""

import os
import sys
from datetime import datetime, timedelta
from dotenv import load_dotenv

try:
    from supabase import create_client, Client
except ImportError as e:
    print(f"❌ خطا: کتابخانه مورد نیاز نصب نیست: {e}")
    sys.exit(1)

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("❌ خطا: متغیرهای محیطی تنظیم نشده‌اند")
    print("لطفاً فایل .env را ایجاد و پر کنید")
    sys.exit(1)

try:
    # ایجاد کلاینت Supabase
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    print("✅ اتصال به Supabase برقرار شد")
except Exception as e:
    print(f"❌ خطا در اتصال: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "="*60)
print("شروع بررسی یادآورهای زمانی (تست سریع)...")
print("="*60 + "\n")

try:
    # خواندن خودروها
    vehicles_response = supabase.rpc('get_vehicles_for_reminder').execute()
    
    if not vehicles_response.data:
        print("هیچ خودرویی برای یادآوری پیدا نشد")
        sys.exit(0)
    
    print(f"تعداد {len(vehicles_response.data)} خودرو برای بررسی:\n")
    
    for idx, vehicle in enumerate(vehicles_response.data, 1):
        print(f"{idx}. {vehicle['model']} ({vehicle['plate_number']})")
        print(f"   - کاربر: {vehicle['user_id']}")
        print(f"   - دوره سرویس: {vehicle['interval_days']} روز")
        print(f"   - هشدار: {vehicle['warning_days_before']} روز قبل")
        
        # خواندن آخرین سرویس
        last_service = supabase.table("services") \
            .select("*") \
            .eq("vehicle_id", vehicle["vehicle_id"]) \
            .order("service_date_gregorian", desc=True) \
            .limit(1) \
            .execute()
        
        if not last_service.data:
            print("   ❌ سرویسی ثبت نشده")
            continue
        
        last_date = datetime.strptime(
            last_service.data[0]["service_date_gregorian"], 
            "%Y-%m-%d"
        ).date()
        
        today = datetime.now().date()
        days_since_last = (today - last_date).days
        days_until_due = vehicle["interval_days"] - days_since_last
        
        print(f"   - آخرین سرویس: {last_date}")
        print(f"   - روزهای گذشته: {days_since_last}")
        print(f"   - روزهای مانده: {days_until_due}")
        
        # بررسی بازه هشدار
        if 0 < days_until_due <= vehicle["warning_days_before"]:
            print(f"   ✅ در بازه هشدار! نیاز به ایجاد نوتیفیکیشن")
            
            # بررسی تکراری
            existing = supabase.table("notifications") \
                .select("*") \
                .eq("vehicle_id", vehicle["vehicle_id"]) \
                .eq("type", "reminder") \
                .eq("read", False) \
                .gte("created_at", (datetime.now() - timedelta(days=vehicle["warning_days_before"] + 1)).isoformat()) \
                .execute()
            
            notification_exists = False
            if existing.data:
                for notif in existing.data:
                    metadata = notif.get("metadata", {})
                    if metadata.get("days_until_due") == days_until_due:
                        notification_exists = True
                        break
            
            if notification_exists:
                print(f"   ⏭️  نوتیفیکیشن قبلاً ارسال شده")
            else:
                # ایجاد نوتیفیکیشن
                notification = {
                    "user_id": vehicle["user_id"],
                    "vehicle_id": vehicle["vehicle_id"],
                    "title": "یادآوری سرویس دوره‌ای",
                    "body": f"خودرو {vehicle['model']} ({vehicle['plate_number']}) نیاز به سرویس دوره‌ای دارد. {days_until_due} روز تا موعد باقی مانده است.",
                    "type": "reminder",
                    "metadata": {
                        "vehicle_model": vehicle["model"],
                        "plate_number": vehicle["plate_number"],
                        "days_until_due": days_until_due,
                        "interval_days": vehicle["interval_days"],
                        "last_service_date": last_service.data[0]["service_date_gregorian"],
                        "due_date": (last_date + timedelta(days=vehicle["interval_days"])).isoformat()
                    }
                }
                
                result = supabase.table("notifications").insert(notification).execute()
                
                if result.data:
                    print(f"   ✅ نوتیفیکیشن ایجاد شد")
                else:
                    print(f"   ❌ خطا در ایجاد نوتیفیکیشن")
        else:
            if days_until_due <= 0:
                print(f"   ⚠️  موعد سرویس گذشته است")
            else:
                print(f"   ⏭️  خارج از بازه هشدار")
        
        print()
    
    print("="*60)
    print("✅ پایان تست")
    print("="*60)
    
except Exception as e:
    print(f"\n❌ خطا: {str(e)}")
    import traceback
    traceback.print_exc()

