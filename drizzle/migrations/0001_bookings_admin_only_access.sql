DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

REVOKE ALL ON public.bookings FROM anon;
GRANT INSERT ON public.bookings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
GRANT EXECUTE ON FUNCTION public.get_booked_slots(date) TO anon, authenticated;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can create pending bookings" ON public.bookings
  FOR INSERT TO anon, authenticated
  WITH CHECK (coalesce(status, 'pending') = 'pending' AND (user_id IS NULL OR user_id = auth.uid()));

CREATE POLICY "Admins can read bookings" ON public.bookings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update bookings" ON public.bookings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bookings" ON public.bookings
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));