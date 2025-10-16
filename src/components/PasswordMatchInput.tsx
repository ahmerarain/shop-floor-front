import React, { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";

interface PasswordMatchInputProps {
  value: string;
  onChange: (value: string) => void;
  password: string; // The original password to match against
  placeholder?: string;
  label?: string;
  id?: string;
  name?: string;
  autoComplete?: string;
  required?: boolean;
  showMatchIndicator?: boolean;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
}

export const PasswordMatchInput: React.FC<PasswordMatchInputProps> = ({
  value,
  onChange,
  password,
  placeholder = "Confirm password",
  label = "Confirm Password",
  id,
  name = "confirmPassword",
  autoComplete = "new-password",
  required = false,
  showMatchIndicator = true,
  className = "",
  inputClassName = "",
  labelClassName = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const passwordsMatch = password === value && value.length > 0;

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

      {/* Password Match Indicator */}
      {showMatchIndicator && value && (
        <div className="mt-2">
          <div
            className={`flex items-center text-xs ${
              passwordsMatch ? "text-green-600" : "text-red-600"
            }`}
          >
            {passwordsMatch ? (
              <Check className="h-3 w-3 mr-1 text-green-600" />
            ) : (
              <X className="h-3 w-3 mr-1 text-red-600" />
            )}
            {passwordsMatch ? "Passwords match" : "Passwords do not match"}
          </div>
        </div>
      )}
    </div>
  );
};
