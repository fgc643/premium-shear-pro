CREATE UNIQUE INDEX bookings_unique_slot ON public.bookings (booking_date, booking_time) WHERE coalesce(status,'pending') <> 'cancelled' AND booking_date >= DATE '2026-10-13';

CREATE OR REPLACE FUNCTION public.get_booked_slots(_date date)
RETURNS TABLE(booking_time time) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT b.booking_time FROM public.bookings b
  WHERE b.booking_date = _date AND coalesce(b.status,'pending') <> 'cancelled'
$$;
GRANT EXECUTE ON FUNCTION public.get_booked_slots(date) TO anon, authenticated;