# Enable "Continue with Google" — 10-minute one-time setup

Everything in the app is already built and wired. Google login just needs a
Client ID + Secret from your Google account. Here's the exact copy-paste flow.

## The 2 values Supabase already gave us

- **Authorized redirect URI (paste into Google):**
  `https://tfuszoexspoqcowawidm.supabase.co/auth/v1/callback`

Keep that handy — you'll paste it in Step 2.

---

## Step 1 — Create a Google OAuth Client

1. Go to **https://console.cloud.google.com/apis/credentials**
2. Top bar: create a new project (name it **Answup**) if you don't have one, then select it.
3. Click **+ Create Credentials → OAuth client ID**.
4. If it asks to "Configure consent screen" first:
   - User type: **External** → Create
   - App name: **Answup**
   - User support email: **fahadimdad966@gmail.com**
   - Developer contact: **fahadimdad966@gmail.com**
   - Save and continue through the screens (you can skip scopes and test users).
   - Back on Credentials, click **+ Create Credentials → OAuth client ID** again.

## Step 2 — Configure the client

- Application type: **Web application**
- Name: **Answup Web**
- **Authorized JavaScript origins** — click ADD URI for each:
  - `https://answup.com`
  - `http://localhost:5173`  (so login works while testing locally)
- **Authorized redirect URIs** — click ADD URI and paste:
  - `https://tfuszoexspoqcowawidm.supabase.co/auth/v1/callback`
- Click **Create**.

Google shows you a **Client ID** and **Client Secret**. Copy both.

## Step 3 — Paste into Supabase

1. Go to: https://supabase.com/dashboard/project/tfuszoexspoqcowawidm/auth/providers
2. Click **Google** → toggle **Enable Sign in with Google** ON.
3. Paste **Client ID** and **Client Secret**.
4. Click **Save**.

## Step 4 — Tell me "google done"

I'll finish the deploy and set the redirect URLs. Then `answup.com/dashboard`
will have a working "Continue with Google" button → onboarding → dashboard.

---

### Note on the consent screen
While your app is in "Testing" mode, only emails you add as **Test users**
(add fahadimdad966@gmail.com) can log in. That's perfect for you + demo clients.
To let any client log in, later click **Publish app** on the consent screen
(no verification needed for basic email/profile login).
