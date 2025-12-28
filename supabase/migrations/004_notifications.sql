-- مهاجرت ۰۰۴: ایجاد سیستم نوتیفیکیشن و یادآوری
-- تاریخ ایجاد: ۲۷ دی ۱۴۰۴
-- هدف: پشتیبانی از سیستم یادآوری سرویس دوره‌ای خودروها

-- 1. ایجاد جدول notifications
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    vehicle_id BIGINT REFERENCES public.vehicles(vehicle_id),
    title TEXT NOT NULL,
    body TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('reminder', 'warning', 'info', 'subscription')),
    read BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. فعال کردن RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. پالیسی‌های RLS
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- 4. Index‌ها برای بهبود کارایی
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_vehicle_type ON public.notifications(vehicle_id, type);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read);

-- 5. تریگر updated_at برای خودکارسازی زمان بروزرسانی
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_notifications
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. اضافه کردن ستون‌های جدید به reminder_settings
-- reminder_mode: حالت یادآوری (km, time, both)
-- is_enabled: فعال/غیرفعال بودن یادآوری
ALTER TABLE public.reminder_settings 
ADD COLUMN IF NOT EXISTS reminder_mode VARCHAR(20) NOT NULL DEFAULT 'time' 
CHECK (reminder_mode IN ('km', 'time', 'both'));

ALTER TABLE public.reminder_settings 
ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- 7. فعال کردن Realtime برای notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- 8. کامنت‌ها برای مستندسازی
COMMENT ON TABLE public.notifications IS 'نوتیفیکیشن‌های کاربران برای یادآوری و هشدارها';
COMMENT ON COLUMN public.notifications.type IS 'نوع نوتیفیکیشن: reminder, warning, info, subscription';
COMMENT ON COLUMN public.notifications.metadata IS 'متادیتای اضافی برای نوتیفیکیشن (مثلاً اطلاعات خودرو)';

-- 9. تابع کمکی برای دریافت خودروهای نیازمند یادآوری
-- این تابع توسط Python Cron Job استفاده می‌شود
CREATE OR REPLACE FUNCTION public.get_vehicles_for_reminder()
RETURNS TABLE (
    vehicle_id BIGINT,
    user_id UUID,
    model VARCHAR,
    plate_number VARCHAR,
    interval_days INTEGER,
    interval_km INTEGER,
    warning_days_before INTEGER,
    warning_km_before INTEGER,
    reminder_mode VARCHAR,
    is_enabled BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.vehicle_id,
        v.user_id,
        v.model,
        v.plate_number,
        rs.interval_days,
        rs.interval_km,
        rs.warning_days_before,
        rs.warning_km_before,
        rs.reminder_mode,
        rs.is_enabled
    FROM public.vehicles v
    JOIN public.reminder_settings rs ON v.vehicle_id = rs.vehicle_id
    WHERE rs.is_enabled = TRUE 
      AND rs.reminder_mode IN ('time', 'both');
END;
$$ LANGUAGE plpgsql;

-- 10. کامنت برای تابع
COMMENT ON FUNCTION public.get_vehicles_for_reminder() IS 
'دریافت لیست خودروهایی که یادآوری زمانی فعال دارند و نیاز به بررسی دارند';

