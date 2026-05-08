
-- Revoke execute on SECURITY DEFINER helpers (triggers still work)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

-- Tighten bookings public insert with minimal validation
DROP POLICY IF EXISTS "bookings_public_insert" ON public.bookings;
CREATE POLICY "bookings_public_insert" ON public.bookings
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(patient_name) > 0
    AND length(patient_email) > 3
    AND date_time > now()
  );
