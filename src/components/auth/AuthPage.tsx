
import { useState } from "react";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";

const AuthPage = () => {
  const [isSignIn, setIsSignIn] = useState(true);

  const toggleForm = () => {
    setIsSignIn((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 animate-fadeIn">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">Edu Data Hub</h1>
          <p className="mt-2 text-gray-600">Manage your educational content with ease</p>
        </div>
        {isSignIn ? (
          <SignInForm onToggleForm={toggleForm} />
        ) : (
          <SignUpForm onToggleForm={toggleForm} />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
