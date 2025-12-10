# Auth Library Documentation

## Quick Start

```tsx
import { useAuth } from "@/lib/auth";

function MyComponent() {
  const { user, loading, signInWithDiscord, signOut } = useAuth();
  // Use auth state
}
```

## Client-Side API

### `useAuth()`

Hook for accessing auth state in client components.

**Returns:**
```typescript
{
  user: User | null;              // Current user
  session: Session | null;        // Current session
  loading: boolean;               // Loading state
  signInWithDiscord: () => Promise<void>;  // Sign in function
  signOut: () => Promise<void>;   // Sign out function
}
```

**Example:**
```tsx
"use client";
import { useAuth } from "@/lib/auth";

export function UserMenu() {
  const { user, loading, signInWithDiscord, signOut } = useAuth();
  
  if (loading) {
    return <Spinner />;
  }
  
  if (!user) {
    return <button onClick={signInWithDiscord}>Sign In</button>;
  }
  
  return (
    <div>
      <p>{user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### `useRequireAuth()`

Hook that automatically redirects to sign in if not authenticated.

**Returns:** Same as `useAuth()`

**Example:**
```tsx
"use client";
import { useRequireAuth } from "@/lib/auth";

export function ProtectedComponent() {
  const { user } = useRequireAuth();
  // user is guaranteed to exist or redirect happens
  
  return <div>Welcome {user.email}</div>;
}
```

## Server-Side API

### `getSession()`

Get the current session on the server.

**Returns:** `Promise<Session | null>`

**Example:**
```tsx
import { getSession } from "@/lib/auth";

export default async function ServerComponent() {
  const session = await getSession();
  
  if (!session) {
    return <div>Not authenticated</div>;
  }
  
  return <div>Session active</div>;
}
```

### `getUser()`

Get the current user on the server.

**Returns:** `Promise<User | null>`

**Example:**
```tsx
import { getUser } from "@/lib/auth";

export default async function ServerComponent() {
  const user = await getUser();
  
  if (!user) {
    redirect("/auth/signin");
  }
  
  return <div>Welcome {user.email}</div>;
}
```

### `getUserProfile(userId: string)`

Get user profile data from database.

**Parameters:**
- `userId` - User ID to fetch profile for

**Returns:** `Promise<UserProfile | null>`

**Example:**
```tsx
import { getUser, getUserProfile } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) redirect("/auth/signin");
  
  const profile = await getUserProfile(user.id);
  
  return (
    <div>
      <h1>{profile?.display_name}</h1>
      <p>{profile?.bio}</p>
    </div>
  );
}
```

### `requireAuth()`

Throws error if not authenticated. Use in API routes.

**Returns:** `Promise<User>`

**Throws:** Error if not authenticated

**Example:**
```tsx
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await requireAuth();
    // User is authenticated
    return NextResponse.json({ userId: user.id });
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
```

## Types

### `User`

Supabase user object with metadata:

```typescript
interface User {
  id: string;
  email?: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    provider_id?: string;
    avatar?: string;
    custom_claims?: {
      global_name?: string;
    };
  };
  created_at: string;
}
```

### `Session`

Supabase session object:

```typescript
interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}
```

### `UserProfile`

Database profile record:

```typescript
interface UserProfile {
  id: string;
  display_name: string | null;
  bio: string | null;
  in_game_name: string | null;
  playtime_hours: number;
  level: number;
  experience_points: number;
  reputation_score: number;
  created_at: string;
  updated_at: string;
}
```

## AuthProvider

The `AuthProvider` component wraps your app and provides auth context.

**Already configured in:** `src/app/providers.tsx`

```tsx
import { AuthProvider } from "@/lib/auth";

export function Providers({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

## Best Practices

### ✅ Do

- Use `useAuth()` in client components
- Use `getUser()` in server components
- Use `requireAuth()` in API routes
- Check `loading` state before rendering
- Handle null user gracefully

### ❌ Don't

- Don't use server functions in client components
- Don't store sensitive data in user_metadata
- Don't bypass middleware protection
- Don't forget to check authentication in API routes

## Examples

### Protected Page

```tsx
// app/dashboard/page.tsx
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getUser();
  
  if (!user) {
    redirect("/auth/signin");
  }
  
  return <div>Dashboard for {user.email}</div>;
}
```

### Protected API Route

```tsx
// app/api/data/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  // Fetch user-specific data
  const { data } = await supabase
    .from("user_data")
    .select("*")
    .eq("user_id", user.id);
  
  return NextResponse.json(data);
}
```

### Conditional Rendering

```tsx
"use client";
import { useAuth } from "@/lib/auth";

export function Header() {
  const { user, loading, signInWithDiscord, signOut } = useAuth();
  
  return (
    <header>
      <nav>
        {loading ? (
          <div>Loading...</div>
        ) : user ? (
          <>
            <span>Welcome {user.email}</span>
            <button onClick={signOut}>Sign Out</button>
          </>
        ) : (
          <button onClick={signInWithDiscord}>Sign In</button>
        )}
      </nav>
    </header>
  );
}
```

## Troubleshooting

### "useAuth must be used within an AuthProvider"

Make sure `AuthProvider` wraps your app in `providers.tsx`.

### User is null after sign in

- Check that callback page is working
- Verify Supabase configuration
- Check browser console for errors

### Session expires immediately

- Check Supabase session settings
- Verify cookie configuration
- Check for conflicting middleware

## Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Discord OAuth Guide](https://discord.com/developers/docs/topics/oauth2)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
