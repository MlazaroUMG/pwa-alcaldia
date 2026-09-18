-- El trigger protect_profile_identity no debe exponerse como RPC.
revoke all on function public.protect_profile_identity() from public, anon, authenticated;
