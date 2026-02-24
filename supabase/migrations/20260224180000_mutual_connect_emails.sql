-- Returns (event_id, user_id, handle, email) for every user who is a MUTUAL
-- connection with the calling user (auth.uid()).  A mutual connection means
-- both directions of a connect_request exist for the same (requester, target,
-- event) pair.
--
-- SECURITY DEFINER lets the function bypass row-level security and read
-- profiles.email directly, while the WHERE clause ensures only emails of true
-- mutual matches are returned to the caller.  Users cannot call this function
-- to obtain emails of non-mutual contacts.
CREATE OR REPLACE FUNCTION public.get_mutual_connect_emails()
RETURNS TABLE (event_id uuid, user_id uuid, handle text, email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT
    cr_sent.event_id,
    p.user_id,
    p.handle,
    p.email
  FROM connect_requests cr_sent
  -- The matching reverse request must exist
  JOIN connect_requests cr_recv
    ON  cr_recv.event_id      = cr_sent.event_id
    AND cr_recv.requester_id  = cr_sent.target_id
    AND cr_recv.target_id     = cr_sent.requester_id
  JOIN profiles p ON p.user_id = cr_sent.target_id
  WHERE cr_sent.requester_id = auth.uid()
    AND p.email IS NOT NULL;
$$;

-- Revoke default public execute and grant only to authenticated users
REVOKE EXECUTE ON FUNCTION public.get_mutual_connect_emails() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_mutual_connect_emails() TO authenticated;
