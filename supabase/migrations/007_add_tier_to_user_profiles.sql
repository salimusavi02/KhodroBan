-- Migration: Add tier column to user_profiles
-- اضافه کردن ستون tier برای پشتیبانی از Pro/Pro+

-- اضافه کردن ستون tier به جدول user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS tier VARCHAR(20) NOT NULL DEFAULT 'free';

-- اضافه کردن محدودیت برای مقادیر مجاز
ALTER TABLE public.user_profiles 
ADD CONSTRAINT check_tier_values 
CHECK (tier IN ('free', 'pro', 'pro+'));

-- ایجاد index برای tier
CREATE INDEX IF NOT EXISTS idx_user_profiles_tier ON public.user_profiles(tier);

-- به‌روزرسانی داده‌های موجود (اگر کاربر اشتراک فعال Pro دارد)
UPDATE public.user_profiles 
SET tier = 'pro'
WHERE id IN (
    SELECT DISTINCT us.user_id 
    FROM public.user_subscriptions us
    JOIN public.subscription_plans sp ON us.plan_id = sp.plan_id
    WHERE us.is_active = TRUE AND sp.plan_code = 'pro'
);

-- کامنت برای مستندسازی
COMMENT ON COLUMN public.user_profiles.tier IS 'سطح دسترسی کاربر: free, pro, pro+';

-- Trigger برای به‌روزرسانی tier بر اساس اشتراک
CREATE OR REPLACE FUNCTION public.handle_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        IF NEW.is_active = TRUE THEN
            UPDATE public.user_profiles 
            SET tier = (
                SELECT plan_code 
                FROM public.subscription_plans 
                WHERE plan_id = NEW.plan_id
            )
            WHERE id = NEW.user_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        -- اگر اشتراک غیرفعال شد، tier را به free برگردان
        UPDATE public.user_profiles 
        SET tier = 'free'
        WHERE id = OLD.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger برای user_subscriptions
CREATE TRIGGER on_subscription_change
    AFTER INSERT OR UPDATE OR DELETE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_subscription_change();