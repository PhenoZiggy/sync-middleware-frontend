import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | AttendFlow - Attendance & Sync Management",
  description: "Sign in to AttendFlow - Modern attendance and sync management platform",
};

export default function SignIn() {
  return <SignInForm />;
}
