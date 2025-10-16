import React, { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
  name?: string;
  autoComplete?: string;
  required?: boolean;
  showValidation?: boolean;
  showStrengthIndicator?: boolean;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
}

interface PasswordValidation {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasSpecialChar: boolean;
  isValid: boolean;
}

interface PasswordStrength {
  text: string;
  color: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder = "Enter password",
  label = "Password",
  id,
  name = "password",
  autoComplete = "new-password",
  required = false,
  showValidation = true,
  showStrengthIndicator = true,
  className = "",
  inputClassName = "",
  labelClassName = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Password validation functions
  const validatePassword = (password: string): PasswordValidation => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasSpecialChar,
      isValid: hasMinLength && hasUpperCase && hasLowerCase && hasSpecialChar,
    };
  };

  const getPasswordStrength = (password: string): PasswordStrength => {
    const validation = validatePassword(password);
    const score = Object.values(validation).filter(Boolean).length - 1; // -1 for isValid

    if (score === 0) return { text: "Very Weak", color: "bg-red-500" };
    if (score === 1) return { text: "Weak", color: "bg-orange-500" };
    if (score === 2) return { text: "Fair", color: "bg-yellow-500" };
    if (score === 3) return { text: "Good", color: "bg-blue-500" };
    return { text: "Strong", color: "bg-green-500" };
  };

  const validation = validatePassword(value);
  const strength = getPasswordStrength(value);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className={`block text-sm font-medium text-gray-700 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputClassName}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Password Requirements */}
      {showValidation && value && (
        <div className="space-y-2">
          <div className="text-xs text-gray-600">Password requirements:</div>
          <div className="space-y-1">
            <div
              className={`flex items-center text-xs ${
                validation.hasMinLength ? "text-green-600" : "text-red-600"
              }`}
            >
              {validation.hasMinLength ? (
                <Check className="h-3 w-3 mr-1 text-green-600" />
              ) : (
                <X className="h-3 w-3 mr-1 text-red-600" />
              )}
              At least 8 characters
            </div>
            <div
              className={`flex items-center text-xs ${
                validation.hasUpperCase ? "text-green-600" : "text-red-600"
              }`}
            >
              {validation.hasUpperCase ? (
                <Check className="h-3 w-3 mr-1 text-green-600" />
              ) : (
                <X className="h-3 w-3 mr-1 text-red-600" />
              )}
              One uppercase letter
            </div>
            <div
              className={`flex items-center text-xs ${
                validation.hasLowerCase ? "text-green-600" : "text-red-600"
              }`}
            >
              {validation.hasLowerCase ? (
                <Check className="h-3 w-3 mr-1 text-green-600" />
              ) : (
                <X className="h-3 w-3 mr-1 text-red-600" />
              )}
              One lowercase letter
            </div>
            <div
              className={`flex items-center text-xs ${
                validation.hasSpecialChar ? "text-green-600" : "text-red-600"
              }`}
            >
              {validation.hasSpecialChar ? (
                <Check className="h-3 w-3 mr-1 text-green-600" />
              ) : (
                <X className="h-3 w-3 mr-1 text-red-600" />
              )}
              One special character
            </div>
          </div>

          {/* Password Strength Indicator */}
          {showStrengthIndicator && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Password strength:</span>
                <span
                  className={`font-medium ${strength.color.replace(
                    "bg-",
                    "text-"
                  )}`}
                >
                  {strength.text}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
                  style={{
                    width: `${
                      (Object.values(validation).filter(Boolean).length - 1) *
                      25
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Export validation functions for external use
export const validatePassword = (password: string): PasswordValidation => {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasSpecialChar,
    isValid: hasMinLength && hasUpperCase && hasLowerCase && hasSpecialChar,
  };
};

export const getPasswordStrength = (password: string): PasswordStrength => {
  const validation = validatePassword(password);
  const score = Object.values(validation).filter(Boolean).length - 1; // -1 for isValid

  if (score === 0) return { text: "Very Weak", color: "bg-red-500" };
  if (score === 1) return { text: "Weak", color: "bg-orange-500" };
  if (score === 2) return { text: "Fair", color: "bg-yellow-500" };
  if (score === 3) return { text: "Good", color: "bg-blue-500" };
  return { text: "Strong", color: "bg-green-500" };
};
