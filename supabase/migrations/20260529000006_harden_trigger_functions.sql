-- Endurecimiento de seguridad (advisor de Supabase): las funciones de trigger
-- son SECURITY DEFINER y quedaban invocables como RPC por anon/authenticated
-- (/rest/v1/rpc/...). Se revoca EXECUTE; los triggers las siguen ejecutando
-- (corren con el privilegio del propietario, no dependen de este grant).

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.reject_checkin_on_archived() from public, anon, authenticated;
revoke execute on function public.enforce_habit_limit() from public, anon, authenticated;
