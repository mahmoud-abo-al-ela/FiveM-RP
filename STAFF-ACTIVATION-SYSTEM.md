# Staff Activation System - Complete Guide

## Overview

This system implements a complete staff approval workflow for user activations, similar to FiveM RP servers. When users submit an activation request, staff review it in Discord and can approve or reject with buttons.

## Flow Diagram

```
User Submits Form
       ↓
Webhook to Staff Channel (#activation-requests)
       ↓
Staff Reviews (sees buttons: Approve / Reject)
       ↓
    ┌─────────────────┐
    ↓                 ↓
APPROVE           REJECT
    ↓                 ↓
DM to User        DM to User
Role Assigned     24hr Cooldown
DB Updated        DB Updated
Redirect          Show Reason
```

## Setup Instructions

### 1. Database Setup

Run the SQL migration in your Supabase SQL Editor:

```bash
# File: supabase-activation-schema.sql
```

This adds the following columns to `user_profiles`:
- `activated` (boolean) - Whether user is activated
- `activated_at` (timestamp) - When they were activated
- `rejected_at` (timestamp) - When they were rejected
- `rejection_reason` (text) - Why they were rejected
- `activation_request_data` (jsonb) - Full request data
- `discord_message_id` (text) - Discord message ID for tracking

### 2. Discord Bot Setup

#### A. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or use existing one
3. Go to **Bot** section
4. Enable these **Privileged Gateway Intents**:
   - Server Members Intent
   - Message Content Intent

#### B. Get Required IDs

**Bot Token:**
- In Bot section, click "Reset Token" and copy it

**Public Key:**
- In General Information, copy "Public Key"

**Guild ID (Server ID):**
1. Enable Developer Mode in Discord (User Settings → Advanced)
2. Right-click your server → Copy Server ID

**Role ID (for "Activated" role):**
1. Server Settings → Roles
2. Create a role called "Activated" or "Citizen"
3. Right-click the role → Copy Role ID

**Channel Webhooks:**
1. Go to your #activation-requests channel
2. Edit Channel → Integrations → Webhooks
3. Create webhook for staff notifications
4. Copy webhook URL

### 3. Environment Variables

Add to your `.env.local`:

```env
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_PUBLIC_KEY=your_public_key_here
DISCORD_GUILD_ID=your_server_id_here
DISCORD_ACTIVATED_ROLE_ID=your_role_id_here

# Discord Webhooks
DISCORD_STAFF_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_STAFF_WEBHOOK
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_GENERAL_WEBHOOK

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### 4. Discord Bot Permissions

Your bot needs these permissions:
- **Send Messages** (2048)
- **Manage Roles** (268435456)
- **Read Messages/View Channels** (1024)

**Invite URL:**
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=268437504&scope=bot
```

Replace `YOUR_CLIENT_ID` with your Application ID from Discord Developer Portal.

### 5. Discord Interactions Endpoint

#### A. Deploy Your Application

Deploy to Vercel/Netlify first, then:

#### B. Configure Interactions URL

1. Go to Discord Developer Portal → Your Application
2. Go to **General Information**
3. Set **Interactions Endpoint URL** to:
   ```
   https://your-domain.com/api/discord/interactions
   ```
4. Discord will send a test request - it should return success

**Note:** The endpoint must be publicly accessible and respond to Discord's verification.

## How It Works

### User Submission Flow

1. **User fills activation form** at `/auth/activate`
   - Character name
   - Age
   - Steam/Epic link
   - RP experience
   - Agrees to rules

2. **Data is stored** in database
   - Profile created with `activated: false`
   - Request data stored in `activation_request_data`

3. **Webhook sent to staff channel**
   - Pretty embed with all user info
   - Mentions the user
   - Shows two buttons: Approve / Reject

4. **User sees pending page** at `/auth/pending`
   - Shows "waiting for approval" message
   - Auto-refreshes every 10 seconds
   - Can't access site until approved

### Staff Approval Flow

When staff clicks **Approve**:

1. **Database updated**
   ```json
   {
     "activated": true,
     "activated_at": "2025-12-10T12:00:00Z"
   }
   ```

2. **Discord DM sent to user**
   ```
   🎉 Congratulations!
   Your activation for [Character Name] has been approved!
   You may now join the FiveM server. Welcome! 🚀
   ```

3. **Discord role assigned**
   - Bot gives user the "Activated" role automatically

4. **Website redirect**
   - User's pending page detects activation
   - Redirects to `/` (home/dashboard)
   - Middleware allows access to all pages

5. **Discord message updated**
   - Original message shows "✅ Approved by [Staff Name]"
   - Buttons are removed

### Staff Rejection Flow

When staff clicks **Reject**:

1. **Database updated**
   ```json
   {
     "activated": false,
     "rejected_at": "2025-12-10T12:00:00Z",
     "rejection_reason": "Default rejection message"
   }
   ```

2. **Discord DM sent to user**
   ```
   ❌ Activation Request Rejected
   Your activation request for [Character Name] was rejected.
   
   Reason: [Rejection reason]
   
   You may submit a new request after 24 hours.
   ```

3. **24-hour cooldown enforced**
   - User can't submit new request for 24 hours
   - Pending page shows countdown timer

4. **Discord message updated**
   - Original message shows "❌ Rejected by [Staff Name]"
   - Buttons are removed

## API Endpoints

### POST `/api/auth/activate`
Submit activation request (user-facing)

**Request:**
```json
{
  "characterName": "John Doe",
  "age": "25",
  "steamOrEpicLink": "https://steamcommunity.com/id/example",
  "rpExperience": "I have 5 years of RP experience...",
  "agreeToRules": true,
  "agreeToTerms": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Activation request submitted! Staff will review shortly."
}
```

### POST `/api/activation/approve`
Approve activation (staff-only)

**Request:**
```json
{
  "userId": "uuid-here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User activated successfully"
}
```

### POST `/api/activation/reject`
Reject activation (staff-only)

**Request:**
```json
{
  "userId": "uuid-here",
  "reason": "Did not meet requirements"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User rejected successfully"
}
```

### POST `/api/discord/interactions`
Handle Discord button interactions (Discord-only)

This endpoint receives Discord interaction events when staff clicks buttons.

## Testing

### Test User Flow

1. Sign out if logged in
2. Sign in with Discord
3. Fill activation form
4. Check Discord staff channel for webhook
5. Check that you see pending page

### Test Staff Approval

1. Click "Approve" button in Discord
2. Check user receives DM
3. Check user gets role
4. Check user can access website

### Test Staff Rejection

1. Click "Reject" button in Discord
2. Check user receives DM with reason
3. Check user sees rejection page
4. Check 24-hour cooldown works

## Customization

### Change Rejection Reason

Currently uses a default reason. To add custom reasons:

1. Implement Discord Modal in `/api/discord/interactions/route.ts`
2. Or create a slash command for rejection with reason parameter

### Change Role Name

Update `DISCORD_ACTIVATED_ROLE_ID` to your preferred role.

### Change Cooldown Period

In `src/middleware.ts`, change:
```typescript
const hoursSinceRejection < 24  // Change 24 to your desired hours
```

### Customize Messages

Edit messages in `src/lib/discord/webhook.ts`:
- `sendApprovalDM()` - Approval message
- `sendRejectionDM()` - Rejection message
- `sendActivationRequestToStaff()` - Staff notification

### Add More Fields to Request

1. Update schema in `/api/auth/activate/route.ts`
2. Update form in `/auth/activate/page.tsx`
3. Update webhook embed in `sendActivationRequestToStaff()`

## Troubleshooting

### Buttons Don't Work

**Issue:** Clicking buttons does nothing

**Solutions:**
1. Check Interactions Endpoint URL is set correctly
2. Verify endpoint is publicly accessible
3. Check Discord bot has proper permissions
4. Look at server logs for errors

### User Not Getting DM

**Issue:** User doesn't receive Discord DM

**Solutions:**
1. Check bot shares server with user
2. Verify user allows DMs from server members
3. Check `DISCORD_BOT_TOKEN` is correct
4. Look at server logs for DM errors

### Role Not Assigned

**Issue:** User doesn't get role automatically

**Solutions:**
1. Check `DISCORD_GUILD_ID` is correct
2. Check `DISCORD_ACTIVATED_ROLE_ID` is correct
3. Verify bot has "Manage Roles" permission
4. Ensure bot's role is higher than target role

### Webhook Not Sending

**Issue:** Staff channel doesn't receive notification

**Solutions:**
1. Check `DISCORD_STAFF_WEBHOOK_URL` is correct
2. Verify webhook still exists in Discord
3. Check webhook has proper permissions
4. Look at server logs for webhook errors

## Security Notes

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Verify Discord signatures** - Implement in production
3. **Add staff role checks** - Uncomment in approve/reject routes
4. **Rate limit endpoints** - Add rate limiting middleware
5. **Validate all inputs** - Already using Zod validation

## Production Checklist

- [ ] Run database migration
- [ ] Set all environment variables
- [ ] Configure Discord bot permissions
- [ ] Set Discord Interactions Endpoint URL
- [ ] Test approval flow
- [ ] Test rejection flow
- [ ] Test role assignment
- [ ] Test DM delivery
- [ ] Add staff role checks
- [ ] Implement signature verification
- [ ] Add rate limiting
- [ ] Monitor error logs

## Files Created/Modified

### New Files
- `supabase-activation-schema.sql` - Database schema
- `src/app/api/activation/approve/route.ts` - Approval endpoint
- `src/app/api/activation/reject/route.ts` - Rejection endpoint
- `src/app/api/discord/interactions/route.ts` - Discord interactions
- `src/app/auth/pending/page.tsx` - Pending approval page
- `STAFF-ACTIVATION-SYSTEM.md` - This documentation

### Modified Files
- `src/app/api/auth/activate/route.ts` - Updated to send to staff
- `src/lib/discord/webhook.ts` - Added staff webhook functions
- `src/middleware.ts` - Added activation status checks
- `.env.local` - Added new environment variables

## Support

If you encounter issues:
1. Check server logs for errors
2. Verify all environment variables are set
3. Test Discord bot permissions
4. Check Discord API status: https://discordstatus.com
5. Review this documentation

## Additional Resources

- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord API Documentation](https://discord.com/developers/docs/intro)
- [Discord Interactions Guide](https://discord.com/developers/docs/interactions/receiving-and-responding)
- [Supabase Documentation](https://supabase.com/docs)
