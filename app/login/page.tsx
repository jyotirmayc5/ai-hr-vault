"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [supabase] = useState(() => createClient());

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        setError(loginError.message);
        return;
      }

      if (!data.user || !data.session) {
        setError(
          "Login succeeded, but no authenticated session was created.",
        );
        return;
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setError(
          sessionError?.message ??
            "The login session could not be saved.",
        );
        return;
      }

      /*
       * Use a full browser navigation instead of router.push().
       * This lets the browser finish saving the Supabase cookies
       * before the dashboard Server Components are requested.
       */
      window.location.assign("/dashboard");
    } catch (loginError) {
      console.error("Unexpected login error:", loginError);

      setError("Something went wrong while signing in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="mb-2 text-2xl font-bold">Login</h1>

        <p className="mb-6 text-gray-600">
          Sign in to your HR system.
        </p>

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={loading}
              className="w-full rounded-lg border px-3 py-2"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={loading}
              className="w-full rounded-lg border px-3 py-2"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />
          </div>

          {error ? (
            <p
              role="alert"
              className="text-sm text-red-600"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}