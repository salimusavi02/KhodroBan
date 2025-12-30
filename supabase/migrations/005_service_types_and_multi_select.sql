-- Migration: Service Types and Multi-Select Support
-- این migration ساختار دیتابیس را برای پشتیبانی از چند انتخابی سرویس‌ها و هزینه‌ها به‌روز می‌کند

-- ============================================
-- 1. ایجاد جداول مرجع برای سرویس‌ها و هزینه‌ها
-- ============================================

-- جدول انواع سرویس (Service Types)
CREATE TABLE IF NOT EXISTS public.service_types (
    service_type_id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    group_name VARCHAR(50) NOT NULL,
    icon VARCHAR(10) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- جدول دسته‌بندی هزینه‌ها (Expense Categories)
CREATE TABLE IF NOT EXISTS public.expense_categories (
    expense_category_id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    group_name VARCHAR(50) NOT NULL,
    icon VARCHAR(10) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- جدول واسطه برای سرویس‌های چندگانه (Service Items)
CREATE TABLE IF NOT EXISTS public.service_items (
    service_item_id BIGSERIAL PRIMARY KEY,
    service_id BIGINT NOT NULL REFERENCES public.services(service_id) ON DELETE CASCADE,
    service_type_code VARCHAR(50) NOT NULL REFERENCES public.service_types(code) ON DELETE RESTRICT,
    cost BIGINT NOT NULL DEFAULT 0 CHECK (cost >= 0),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_service_item UNIQUE (service_id, service_type_code)
);

-- ============================================
-- 2. به‌روزرسانی جدول Services (پشتیبانی از چند سرویس)
-- ============================================

-- افزودن فیلد جدید برای نگهداری کل هزینه سرویس
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS total_cost BIGINT NOT NULL DEFAULT 0 CHECK (total_cost >= 0);

-- افزودن فیلد جدید برای نگهداری توضیحات کلی سرویس
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS general_note TEXT;

-- ایجاد جدول جدید برای سرویس‌های چندگانه (جایگزین service_type)
CREATE TABLE IF NOT EXISTS public.service_types_mapping (
    service_type_mapping_id BIGSERIAL PRIMARY KEY,
    service_id BIGINT NOT NULL REFERENCES public.services(service_id) ON DELETE CASCADE,
    service_type_code VARCHAR(50) NOT NULL REFERENCES public.service_types(code) ON DELETE RESTRICT,
    cost BIGINT NOT NULL DEFAULT 0 CHECK (cost >= 0),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_service_type_mapping UNIQUE (service_id, service_type_mapping_id)
);

-- ============================================
-- 3. به‌روزرسانی جدول Daily Expenses
-- ============================================

-- افزودن فیلد جدید برای reference
ALTER TABLE public.daily_expenses 
ADD COLUMN IF NOT EXISTS category_code VARCHAR(50);

-- کپی داده‌ها از فیلد قدیمی به فیلد جدید
UPDATE public.daily_expenses 
SET category_code = CASE 
    WHEN category = 'fuel' THEN 'fuel'
    WHEN category = 'carwash' THEN 'wash'
    WHEN category = 'parking' THEN 'parking'
    WHEN category = 'toll' THEN 'toll'
    WHEN category = 'repair' THEN 'minor_repair'
    WHEN category = 'other' THEN 'other'
    ELSE 'other'
END;

-- حذف فیلد قدیمی و محدودیت‌های آن
ALTER TABLE public.daily_expenses 
DROP COLUMN IF EXISTS category;

-- تغییر نام فیلد جدید به category
ALTER TABLE public.daily_expenses 
RENAME COLUMN category_code TO category;

-- افزودن محدودیت خارجی جدید
ALTER TABLE public.daily_expenses 
ADD CONSTRAINT fk_expense_category 
FOREIGN KEY (category) REFERENCES public.expense_categories(code) 
ON DELETE RESTRICT;

-- ============================================
-- 4. درج داده‌های اولیه
-- ============================================

-- درج انواع سرویس
INSERT INTO public.service_types (code, name, group_name, icon, is_active)
VALUES
    -- موتور و روغن
    ('oil_change', 'تعویض روغن', 'موتور و روغن', '🔧', TRUE),
    ('filter', 'فیلتر (هوا/روغن/بنزین)', 'موتور و روغن', '🔧', TRUE),
    ('battery', 'باتری', 'موتور و روغن', '🔋', TRUE),
    ('cooling', 'سیستم خنک‌کننده', 'موتور و روغن', '❄️', TRUE),
    -- ترمز و ایمنی
    ('brakes', 'ترمز (لنت/دیسک)', 'ترمز و ایمنی', '🛡️', TRUE),
    ('clutch', 'کلاچ', 'ترمز و ایمنی', '🛡️', TRUE),
    -- چرخ و تعلیق
    ('tire', 'لاستیک', 'چرخ و تعلیق', '🚗', TRUE),
    ('alignment', 'همراستایی', 'چرخ و تعلیق', '🚗', TRUE),
    ('suspension', 'تعلیق', 'چرخ و تعلیق', '🚗', TRUE),
    -- برق و الکترونیک
    ('electrical', 'برق', 'برق و الکترونیک', '⚡', TRUE),
    ('ac', 'کولر', 'برق و الکترونیک', '⚡', TRUE),
    ('lighting', 'چراغ', 'برق و الکترونیک', '⚡', TRUE),
    -- گیربکس و اگزوز
    ('transmission', 'گیربکس', 'گیربکس و اگزوز', '⚙️', TRUE),
    ('exhaust', 'اگزوز', 'گیربکس و اگزوز', '⚙️', TRUE),
    -- بدنه و شیشه
    ('body', 'بدنه', 'بدنه و شیشه', '🔲', TRUE),
    ('glass', 'شیشه', 'بدنه و شیشه', '🔲', TRUE),
    -- سایر
    ('other', 'سایر', 'سایر', '📋', TRUE)
ON CONFLICT (code) DO UPDATE
SET
    name = EXCLUDED.name,
    group_name = EXCLUDED.group_name,
    icon = EXCLUDED.icon,
    is_active = EXCLUDED.is_active;

-- درج دسته‌بندی هزینه‌ها
INSERT INTO public.expense_categories (code, name, group_name, icon, is_active)
VALUES
    -- سوخت
    ('fuel', 'سوخت', 'سوخت', '⛽', TRUE),
    -- نگهداری و سرویس
    ('wash', 'کارواش', 'نگهداری و سرویس', '🚿', TRUE),
    ('maintenance', 'نگهداری', 'نگهداری و سرویس', '🛠️', TRUE),
    ('service', 'سرویس', 'نگهداری و سرویس', '⚙️', TRUE),
    -- اجباری و قانونی
    ('insurance', 'بیمه', 'اجباری و قانونی', '🛡️', TRUE),
    ('tax', 'مالیات', 'اجباری و قانونی', '📄', TRUE),
    ('registration', 'ثبت‌نام', 'اجباری و قانونی', '📋', TRUE),
    -- جریمه و عوارض
    ('fine', 'جریمه', 'جریمه و عوارض', '💸', TRUE),
    ('toll', 'عوارض', 'جریمه و عوارض', '🛣️', TRUE),
    -- قطعات و دستمزد
    ('parts', 'قطعات', 'قطعات و دستمزد', '🔩', TRUE),
    ('labor', 'دستمزد', 'قطعات و دستمزد', '👷', TRUE),
    ('accessories', 'لوازم جانبی', 'قطعات و دستمزد', '🎒', TRUE),
    -- پارکینگ
    ('parking', 'پارکینگ', 'پارکینگ', '🅿️', TRUE),
    -- تعمیرات
    ('minor_repair', 'تعمیرات جزئی', 'تعمیرات', '🔧', TRUE),
    ('diagnostic', 'دیاگ', 'تعمیرات', '🔍', TRUE),
    -- سایر
    ('other', 'سایر', 'سایر', '📎', TRUE)
ON CONFLICT (code) DO UPDATE
SET
    name = EXCLUDED.name,
    group_name = EXCLUDED.group_name,
    icon = EXCLUDED.icon,
    is_active = EXCLUDED.is_active;

-- ============================================
-- 5. Index ها
-- ============================================

-- Index برای جدول service_types
CREATE INDEX IF NOT EXISTS idx_service_types_group ON public.service_types(group_name);
CREATE INDEX IF NOT EXISTS idx_service_types_active ON public.service_types(is_active);

-- Index برای جدول expense_categories
CREATE INDEX IF NOT EXISTS idx_expense_categories_group ON public.expense_categories(group_name);
CREATE INDEX IF NOT EXISTS idx_expense_categories_active ON public.expense_categories(is_active);

-- Index برای جدول service_items
CREATE INDEX IF NOT EXISTS idx_service_items_service_id ON public.service_items(service_id);
CREATE INDEX IF NOT EXISTS idx_service_items_type_code ON public.service_items(service_type_code);

-- Index برای جدول service_types_mapping
CREATE INDEX IF NOT EXISTS idx_service_types_mapping_service_id ON public.service_types_mapping(service_id);
CREATE INDEX IF NOT EXISTS idx_service_types_mapping_type_code ON public.service_types_mapping(service_type_code);

-- ============================================
-- 6. Triggers برای updated_at
-- ============================================

-- Function برای به‌روزرسانی خودکار updated_at (اگر وجود ندارد)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers برای جداول جدید
CREATE TRIGGER set_updated_at_service_types
    BEFORE UPDATE ON public.service_types
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_expense_categories
    BEFORE UPDATE ON public.expense_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_service_items
    BEFORE UPDATE ON public.service_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_service_types_mapping
    BEFORE UPDATE ON public.service_types_mapping
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 7. Comments برای مستندسازی
-- ============================================

COMMENT ON TABLE public.service_types IS 'انواع سرویس‌های قابل انتخاب (تعویض روغن، فیلتر، ...)';
COMMENT ON TABLE public.expense_categories IS 'دسته‌بندی هزینه‌های روزانه (سوخت، کارواش، ...)';
COMMENT ON TABLE public.service_items IS 'اقلام سرویس (برای پشتیبانی از سرویس‌های چندگانه)';
COMMENT ON TABLE public.service_types_mapping IS 'نگاشت سرویس‌ها به انواع سرویس (جایگزین service_type)';

-- ============================================
-- 8. به‌روزرسانی نظرات جداول موجود
-- ============================================

COMMENT ON TABLE public.services IS 'سوابق سرویس و تعویض روغن (پشتیبانی از چند سرویس همزمان)';
COMMENT ON TABLE public.daily_expenses IS 'هزینه‌های روزانه خودرو (با دسته‌بندی از جدول مرجع)';