import React, { useState, useEffect } from "react";
import { useResetPassword } from "../hooks/useAuth";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { PasswordInput, validatePassword } from "../components/PasswordInput";
import { PasswordMatchInput } from "../components/PasswordMatchInput";

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resetPasswordMutation = useResetPassword();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      // Redirect to login if no token provided
      navigate("/login");
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Validate password using the new validation function
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      alert("Please ensure your password meets all requirements.");
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        token,
        newPassword: password,
      });
      setIsSubmitted(true);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Password Reset Successful
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Your password has been successfully reset. You can now log in with
              your new password.
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="Enter new password"
              label="New Password"
              id="password"
              name="password"
              required
              showValidation={true}
              showStrengthIndicator={true}
            />

            <PasswordMatchInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              password={password}
              placeholder="Confirm new password"
              label="Confirm New Password"
              id="confirmPassword"
              name="confirmPassword"
              required
              showMatchIndicator={true}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={
                resetPasswordMutation.isPending ||
                !password ||
                !confirmPassword ||
                !validatePassword(password).isValid ||
                password !== confirmPassword
              }
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetPasswordMutation.isPending ? (
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              ) : null}
              {resetPasswordMutation.isPending
                ? "Resetting..."
                : "Reset Password"}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              ← Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
