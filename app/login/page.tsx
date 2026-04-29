"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";
import { useAuth } from "../../components/AuthProvider";
import { useRouter } from "next/navigation";
import { PenTool } from "lucide-react";

export default function LoginPage() {
  const { setGuestMode, user } = useAuth();
  const router = useRouter();

  // If already logged in, redirect to dashboard
  if (user) {
    router.push("/");
    return null;
  }

  const handleGoogleLogin = async () => {
    try {
      if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        alert("Firebase is not configured. Falling back to Guest Mode.");
        handleGuestLogin();
        return;
      }
      await signInWithPopup(auth, googleProvider);
      router.push("/");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleGuestLogin = () => {
    setGuestMode(true);
    router.push("/");
  };

  return (
    <div className="login-container">
      <div className="login-card card">
        <div className="login-header">
          <PenTool size={48} className="logo-icon" />
          <h1>StoryForge</h1>
          <p>Login to start writing your masterpiece.</p>
        </div>

        <div className="login-actions">
          <button className="btn-primary auth-btn" onClick={handleGoogleLogin}>
            Sign in with Google
          </button>
          
          <div className="divider"><span>OR</span></div>
          
          <button className="btn-secondary auth-btn" onClick={handleGuestLogin}>
            Continue as Guest
          </button>
        </div>
        
        <p className="guest-notice">
          Guest mode saves stories locally to your browser. Connect an account to sync across devices.
        </p>
      </div>
    </div>
  );
}
