/**
 * setup-tracy.mjs
 *
 * One-time script: creates Tracy's Vault account in Supabase.
 *
 * BEFORE running:
 *   1. Supabase Dashboard → Authentication → Settings
 *      → Disable "Enable email confirmations" (toggle OFF)
 *   2. Run the schema: Supabase SQL Editor → paste supabase/schema.sql → Run
 *   3. Then run this script:
 *        node scripts/setup-tracy.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fzzgcfkeqlyrywrcvbps.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_iADfVHwiIwRnWf9igZtObQ_HUmTYPgj'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function setup() {
  console.log('🔐 Setting up Tracy\'s Vault account...\n')

  // Sign up Tracy with first-time credentials
  const { data, error } = await supabase.auth.signUp({
    email: 'adedetracy481@gmail.com',
    password: 'Tracy123!',
    options: {
      data: {
        name: 'Tracy',
        first_login: true,   // ← triggers the credential-change prompt on login
      },
    },
  })

  if (error) {
    if (error.message.includes('already registered') || error.message.includes('already been registered')) {
      console.log('✅ Account already exists — nothing to do.')
      console.log('   Login:    adedetracy481@gmail.com')
      console.log('   Password: Tracy123!')
    } else {
      console.error('❌ Error creating account:', error.message)
      console.log('\n   Make sure email confirmations are DISABLED in Supabase Auth settings.')
    }
    return
  }

  if (data.user) {
    console.log('✅ Account created successfully!\n')
    console.log('   Email:    adedetracy481@gmail.com')
    console.log('   Password: Tracy123!')
    console.log('   User ID:  ' + data.user.id)
    console.log('\n   Tracy will be prompted to change her credentials on first login.')
  } else {
    console.log('⚠️  User created but needs email confirmation.')
    console.log('   → Disable email confirmations in Supabase Auth settings, then re-run.')
  }
}

setup().catch(console.error)
