import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage, // Set AsyncStorage as custom storage
    autoRefreshToken: true, // Enable automatic token refresh
    persistSession: true, // Enable session persistence
    detectSessionInUrl: false // Disable URL-based session detection (not needed in mobile)
  },
})

export default supabase