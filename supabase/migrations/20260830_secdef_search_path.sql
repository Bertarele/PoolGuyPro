-- Pin search_path on the SECURITY DEFINER functions that were still missing it.
--
-- A SECURITY DEFINER function runs with the privileges of its owner, but
-- resolves unqualified names using the CALLER's search_path. Anyone able to
-- create an object in a schema searched earlier can therefore shadow a table
-- or function name and have it run with elevated rights.
--
-- Not currently exploitable here: neither `authenticated` nor `anon` holds
-- CREATE on any schema, nor on the database, so there is nowhere to plant the
-- shadowing object. This is defense in depth — it closes the hole before some
-- future grant quietly opens it, and clears the corresponding Supabase linter
-- warning (function_search_path_mutable).
--
-- Every function below was checked first: all of them touch only tables in
-- `public`, every auth.uid() call is already schema-qualified, and none calls
-- an extension function unqualified — so pinning to `public` cannot change
-- how any name resolves today. Built-ins keep working because pg_catalog is
-- always searched implicitly. `public` matches what the 21 already-correct
-- functions in this database use.
--
-- ALTER FUNCTION ... SET only attaches the setting; it does not touch the
-- function bodies.

ALTER FUNCTION public.archive_sold_listing()        SET search_path = public;
ALTER FUNCTION public.cleanup_expired_marketplace() SET search_path = public;
ALTER FUNCTION public.cleanup_old_sold_listings()   SET search_path = public;
ALTER FUNCTION public.cleanup_quick_pool_jobs()     SET search_path = public;
ALTER FUNCTION public.get_my_unread_count()         SET search_path = public;
ALTER FUNCTION public.guard_job_app_status()        SET search_path = public;
ALTER FUNCTION public.guard_qp_app_status()         SET search_path = public;
ALTER FUNCTION public.mark_chat_read(text)          SET search_path = public;
ALTER FUNCTION public.send_chat_message(text, text, uuid, text, text) SET search_path = public;
