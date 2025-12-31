-- Migration: Manual Reminders System
-- Date: 1404/10/30
-- Description: Create reminders table for manual user reminders

-- ============================================
-- Create reminders table
-- ============================================

CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  vehicle_id BIGINT REFERENCES vehicles(vehicle_id),
  service_id BIGINT REFERENCES services(service_id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP,
  due_km INTEGER,
  warning_days_before INTEGER DEFAULT 7,
  status TEXT DEFAULT 'ok',
  message TEXT,
  source TEXT DEFAULT 'manual',
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_reminders_user ON reminders(user_id);
CREATE INDEX idx_reminders_vehicle ON reminders(vehicle_id);
CREATE INDEX idx_reminders_due_date ON reminders(due_date);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminders" ON reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders" ON reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" ON reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" ON reminders
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Trigger Function: Calculate status and message
-- ============================================

CREATE OR REPLACE FUNCTION update_reminder_status_and_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_km INTEGER;
  v_days_remaining INTEGER;
  v_km_remaining INTEGER;
  v_status TEXT := 'ok';
  v_message TEXT;
BEGIN
  -- Get current km from vehicle if vehicle_id exists
  IF NEW.vehicle_id IS NOT NULL THEN
    SELECT current_km INTO v_current_km 
    FROM public.vehicles 
    WHERE vehicle_id = NEW.vehicle_id;
    
    -- If vehicle not found, set to NULL
    IF NOT FOUND THEN
      v_current_km := NULL;
    END IF;
  ELSE
    v_current_km := NULL;
  END IF;

  -- Calculate status based on date
  IF NEW.due_date IS NOT NULL THEN
    v_days_remaining := EXTRACT(EPOCH FROM (NEW.due_date - NOW())) / (60 * 60 * 24);
    
    IF v_days_remaining <= 0 THEN
      v_status := 'overdue';
    ELSIF v_days_remaining <= NEW.warning_days_before THEN
      v_status := 'near';
    END IF;
  END IF;

  -- Calculate status based on km (only if not already overdue by date)
  IF NEW.due_km IS NOT NULL AND v_current_km IS NOT NULL THEN
    v_km_remaining := NEW.due_km - v_current_km;
    
    IF v_km_remaining <= 0 THEN
      v_status := 'overdue';
    ELSIF v_km_remaining <= 1000 THEN
      -- Only set to near if status is still ok
      IF v_status = 'ok' THEN
        v_status := 'near';
      END IF;
    END IF;
  END IF;

  -- Generate message
  IF v_status = 'overdue' THEN
    IF NEW.due_date IS NOT NULL THEN
      v_message := NEW.title || ' - موعد گذشته است!';
    ELSIF NEW.due_km IS NOT NULL THEN
      v_message := NEW.title || ' - کیلومتر گذشته است!';
    ELSE
      v_message := NEW.title || ' - موعد گذشته است!';
    END IF;
  ELSIF v_status = 'near' THEN
    IF NEW.due_date IS NOT NULL THEN
      v_message := NEW.title || ' - ' || CEIL(v_days_remaining) || ' روز دیگر';
    ELSIF NEW.due_km IS NOT NULL AND v_current_km IS NOT NULL THEN
      v_message := NEW.title || ' - ' || v_km_remaining || ' کیلومتر دیگر';
    ELSE
      v_message := NEW.title || ' - نزدیک به سررسید';
    END IF;
  ELSE
    v_message := NEW.title;
  END IF;

  NEW.status := v_status;
  NEW.message := v_message;

  RETURN NEW;
END;
$$;

-- ============================================
-- Trigger
-- ============================================

CREATE TRIGGER trigger_update_reminder_status_and_message
  BEFORE INSERT OR UPDATE ON reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_reminder_status_and_message();

-- ============================================
-- Realtime Replication
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE reminders;

-- ============================================
-- Function to update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments and Examples
-- ============================================

/*
Table: reminders

Purpose: Store manual and automated reminders for users

Fields:
- id: UUID primary key
- user_id: Owner of the reminder (required)
- vehicle_id: Optional vehicle reference
- service_id: Optional service reference
- title: Reminder title (required)
- description: Optional description
- due_date: Optional due date
- due_km: Optional due kilometer
- warning_days_before: Days before due to show warning (default 7)
- status: Calculated automatically (ok/near/overdue)
- message: Calculated message for display
- source: 'manual' or 'auto' (default 'manual')
- dismissed: Whether reminder is marked as done
- created_at: Creation timestamp
- updated_at: Last update timestamp

Examples:
1. General reminder (no vehicle):
   INSERT INTO reminders (user_id, title, description, due_date, warning_days_before)
   VALUES ('user-uuid', 'پرداخت قسط', 'قسط خودرو', '2025-02-15', 7);

2. Vehicle-specific reminder:
   INSERT INTO reminders (user_id, vehicle_id, title, due_km)
   VALUES ('user-uuid', 'vehicle-uuid', 'تعویض لاستیک', 50000);

3. Service-related reminder:
   INSERT INTO reminders (user_id, vehicle_id, service_id, title, due_date, due_km)
   VALUES ('user-uuid', 'vehicle-uuid', 'service-uuid', 'سرویس دوره‌ای', '2025-03-01', 10000);

Triggers:
- Automatically calculates status and message on insert/update
- Updates updated_at on every modification

RLS:
- Users can only see their own reminders
- Users can only modify their own reminders
*/
