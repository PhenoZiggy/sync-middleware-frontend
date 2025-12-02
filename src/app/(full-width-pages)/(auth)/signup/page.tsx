import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | AttendFlow - Attendance & Sync Management",
  description: "Create an account on AttendFlow - Modern attendance and sync management platform",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
