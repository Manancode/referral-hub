import Image from "next/image";
import SignupPage from "./signup/page";
import SignInPage from "./api/auth/signin/page";


export default function Home() {
  return (
    <><SignupPage />
    <SignInPage /></>
  );
}
