import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setSession, setLoading } from '@/store/slices/authSlice';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        (async () => {
          console.log('Auth state changed:', event, session ? 'session exists' : 'no session');

          if (session?.user) {
            // Fetch user profile data
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();

            const userData = {
              id: session.user.id,
              name: profile?.full_name || '',
              email: session.user.email || '',
              phone: profile?.phone || ''
            };

            dispatch(setSession({ session, user: userData }));
          } else {
            dispatch(setSession({ session: null, user: null }));
          }
        })();
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        const userData = {
          id: session.user.id,
          name: profile?.full_name || '',
          email: session.user.email || '',
          phone: profile?.phone || ''
        };

        dispatch(setSession({ session, user: userData }));
      } else {
        dispatch(setLoading(false));
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);
};