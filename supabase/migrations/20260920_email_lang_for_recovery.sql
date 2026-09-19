-- Password-reset e-mails pick their language from auth user_metadata.lang, but
-- accounts created before the language picker have none, and the reset request
-- itself is anonymous (GoTrue's /recover takes no user data). The login screen
-- calls this just before asking for the reset, so the e-mail comes in whichever
-- flag the person has selected. Deliberately silent: it never says whether the
-- address exists, and it can only ever write one of three fixed values.
CREATE OR REPLACE FUNCTION public.set_email_lang(p_email text, p_lang text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  IF p_lang IS NULL OR p_lang NOT IN ('pt', 'en', 'es') THEN RETURN; END IF;
  IF p_email IS NULL OR length(p_email) > 254 THEN RETURN; END IF;
  UPDATE auth.users
     SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('lang', p_lang)
   WHERE lower(email) = lower(btrim(p_email))
     AND (raw_user_meta_data->>'lang') IS DISTINCT FROM p_lang;
END
$function$;

REVOKE EXECUTE ON FUNCTION public.set_email_lang(text, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.set_email_lang(text, text) TO anon, authenticated;
