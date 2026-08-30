-- The first message of a new conversation never marked the recipient unread.
--
-- send_chat_message upserts the conversation row: the ON CONFLICT branch
-- increments the recipient's counter, but the INSERT branch never listed
-- unread_1/unread_2 at all, so on a brand-new conversation both fell to their
-- DEFAULT of 0. Second and later messages counted; the first one silently did
-- not — exactly when it matters most, since first contact (a pool guy
-- answering a job, a buyer asking about a listing) is what the badge is for.
-- The message itself was always stored and delivered; only the in-app unread
-- count was wrong.
--
-- Seeds the recipient's counter to 1 on insert, mirroring the same am_p1
-- branch the conflict path already uses so both routes agree on who is the
-- recipient. Rest of the body is unchanged from the current definition —
-- including SET search_path, which CREATE OR REPLACE would otherwise drop.

CREATE OR REPLACE FUNCTION public.send_chat_message(
  p_convo_id text, p_body text, p_other_id uuid,
  p_my_name text DEFAULT ''::text, p_other_name text DEFAULT ''::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  msg_id uuid;
  p1     uuid    := LEAST(auth.uid(), p_other_id);
  p2     uuid    := GREATEST(auth.uid(), p_other_id);
  am_p1  boolean := (auth.uid() = p1);
  n1     text    := CASE WHEN auth.uid() = p1 THEN p_my_name    ELSE p_other_name END;
  n2     text    := CASE WHEN auth.uid() = p1 THEN p_other_name ELSE p_my_name    END;
BEGIN
  INSERT INTO conversations (id, participant_1, participant_2, name_1, name_2,
                             last_message, last_message_at, unread_1, unread_2)
  VALUES (p_convo_id, p1, p2, n1, n2, p_body, now(),
          -- the sender is never unread to themselves
          CASE WHEN am_p1 THEN 0 ELSE 1 END,
          CASE WHEN am_p1 THEN 1 ELSE 0 END)
  ON CONFLICT (id) DO UPDATE SET
    last_message    = p_body,
    last_message_at = now(),
    unread_1 = CASE WHEN am_p1 THEN conversations.unread_1     ELSE conversations.unread_1 + 1 END,
    unread_2 = CASE WHEN am_p1 THEN conversations.unread_2 + 1 ELSE conversations.unread_2     END,
    name_1   = CASE WHEN conversations.name_1 = '' THEN n1 ELSE conversations.name_1 END,
    name_2   = CASE WHEN conversations.name_2 = '' THEN n2 ELSE conversations.name_2 END;

  INSERT INTO messages (conversation_id, sender_id, body)
  VALUES (p_convo_id, auth.uid(), p_body)
  RETURNING id INTO msg_id;

  RETURN msg_id;
END;
$function$;
