import { getProviders } from "next-auth/react";
import SignInForm from "./signinform";

export default async function SignInPage() {
  const providers = await getProviders();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold mb-6">Sign in to your account</h1>
      <div className="w-full max-w-sm">
        <SignInForm />
      </div>
    </div>
  );
}