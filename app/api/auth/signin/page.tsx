// app/auth/signin/page.tsx

import { getProviders, signIn } from "next-auth/react";

export default async function SignInPage() {
  const providers = await getProviders();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold mb-6">Sign in to your account</h1>
      <div className="w-full max-w-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const email = e.currentTarget.email.value;
            const password = e.currentTarget.password.value;
            signIn("credentials", {
              redirect: true,
              email,
              password,
              callbackUrl: "/dashboard",
            });
          }}
        >
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
