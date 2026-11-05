CREATE TABLE public.ai_usage (
  id bigserial PRIMARY KEY,
  ip_hash text NOT NULL,
  fn text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.ai_usage TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.ai_usage_id_seq TO service_role;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE INDEX ai_usage_ip_time_idx ON public.ai_usage (ip_hash, created_at);
CREATE INDEX ai_usage_time_idx ON public.ai_usage (created_at);

-- Atomically checks the demo limits and records the request when allowed.
CREATE OR REPLACE FUNCTION public.consume_ai_quota(_ip_hash text, _fn text, _per_hour int, _per_day int)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  day_start timestamptz := (date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo')) AT TIME ZONE 'America/Sao_Paulo';
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('ai_usage_quota'));
  DELETE FROM public.ai_usage WHERE created_at < now() - interval '2 days';
  IF (SELECT count(*) FROM public.ai_usage WHERE ip_hash = _ip_hash AND created_at > now() - interval '1 hour') >= _per_hour THEN
    RETURN false;
  END IF;
  IF (SELECT count(*) FROM public.ai_usage WHERE created_at >= day_start) >= _per_day THEN
    RETURN false;
  END IF;
  INSERT INTO public.ai_usage (ip_hash, fn) VALUES (_ip_hash, _fn);
  RETURN true;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.consume_ai_quota(text, text, int, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_quota(text, text, int, int) TO service_role;