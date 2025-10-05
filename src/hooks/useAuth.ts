import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setSession, setLoading } from '@/store/slices/authSlice';
import { setFavorites } from '@/store/slices/favoritesSlice';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const dispatch = useAppDispatch();

  const fetchAndSyncFavorites = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          product_id,
          products (
            id,
            name,
            base_price,
            image_url,
            description,
            categories (
              name
            )
          )
        `)
        .eq('user_id', userId);

      if (!error && data) {
        const formattedFavorites = data.map(fav => ({
          id: fav.products?.id || '',
          name: fav.products?.name || '',
          basePrice: fav.products?.base_price || 0,
          imageUrl: fav.products?.image_url || '',
          description: fav.products?.description || '',
          category: fav.products?.categories?.name || ''
        }));
        dispatch(setFavorites(formattedFavorites));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

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
            
            // Fetch and sync favorites
            fetchAndSyncFavorites(session.user.id);
          } else {
            dispatch(setSession({ session: null, user: null }));
            dispatch(setFavorites([])); // Clear favorites on logout
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
        
        // Fetch and sync favorites
        fetchAndSyncFavorites(session.user.id);
      } else {
        dispatch(setLoading(false));
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);
};