import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/** Current auth session plus admin flag; `ready` is false until the first check finishes. */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async (s: Session | null) => {
      let admin = false;
      if (s) {
        const { data } = await supabase.rpc("is_admin");
        admin = !!data;
      }
      if (!mounted) return;
      setSession(s);
      setIsAdmin(admin);
      setReady(true);
    };
    supabase.auth.getSession().then(({ data }) => load(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setTimeout(() => load(s), 0);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, isAdmin, ready };
}
