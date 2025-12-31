-- Migration: Add Vehicle KM History Table
-- این migration جدول تاریخچه کیلومتر را ایجاد می‌کند

-- جدول تاریخچه کیلومتر
CREATE TABLE IF NOT EXISTS public.vehicle_km_history (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id BIGINT NOT NULL REFERENCES public.vehicles(vehicle_id) ON DELETE CASCADE,
    km INTEGER NOT NULL CHECK (km >= 0),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('manual', 'service', 'expense', 'initial')),
    source_id BIGINT, -- ID of service/expense record (nullable)
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_km_history_vehicle_id ON public.vehicle_km_history(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_km_history_recorded_at ON public.vehicle_km_history(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_km_history_vehicle_recorded ON public.vehicle_km_history(vehicle_id, recorded_at DESC);

-- Comments
COMMENT ON TABLE public.vehicle_km_history IS 'تاریخچه کیلومترهای ثبت شده برای خودروها';
COMMENT ON COLUMN public.vehicle_km_history.vehicle_id IS 'ارتباط با خودرو';
COMMENT ON COLUMN public.vehicle_km_history.km IS 'کیلومتر ثبت شده';
COMMENT ON COLUMN public.vehicle_km_history.recorded_at IS 'تاریخ و زمان ثبت کیلومتر';
COMMENT ON COLUMN public.vehicle_km_history.source_type IS 'نوع منبع: manual (دستی), service (سرویس), expense (هزینه), initial (اولیه)';
COMMENT ON COLUMN public.vehicle_km_history.source_id IS 'ID رکورد منبع (سرویس یا هزینه) - اختیاری';
COMMENT ON COLUMN public.vehicle_km_history.note IS 'یادداشت توضیحی';

-- Trigger برای به‌روزرسانی خودکار updated_at
CREATE OR REPLACE FUNCTION public.handle_km_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_created_at_km_history
    BEFORE INSERT ON public.vehicle_km_history
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_km_history_updated_at();

-- افزودن کامنت برای جدول vehicles
COMMENT ON COLUMN public.vehicles.current_km IS 'کیلومتر فعلی خودرو (آخرین کیلومتر ثبت شده)';

-- Policy: کاربران فقط به تاریخچه خودروهای خودشان دسترسی داشته باشند
CREATE POLICY "Users can view their vehicle KM history"
ON public.vehicle_km_history FOR SELECT
USING (
  vehicle_id IN (
    SELECT vehicle_id FROM public.vehicles 
    WHERE user_id = auth.uid()
  )
);

-- Policy: کاربران فقط بتوانند برای خودروهای خودشان ثبت کنند
CREATE POLICY "Users can insert their vehicle KM history"
ON public.vehicle_km_history FOR INSERT
WITH CHECK (
  vehicle_id IN (
    SELECT vehicle_id FROM public.vehicles 
    WHERE user_id = auth.uid()
  )
);