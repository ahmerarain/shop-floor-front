import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useUpdatePassword } from "../../hooks/useAuth";
import { PasswordInput, validatePassword } from "../PasswordInput";
import { PasswordMatchInput } from "../PasswordMatchInput";
import { X } from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const updatePasswordMutation = useUpdatePassword();

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    // Validate new password using the new validation function
    const passwordValidation = validatePassword(passwordForm.newPassword);
    if (!passwordValidation.isValid) {
      alert("Please ensure your new password meets all requirements.");
      return;
    }

    try {
      await updatePasswordMutation.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* User Info */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              User Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {user.first_name} {user.last_name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Member Since
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Password</h3>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {showPasswordForm ? "Cancel" : "Change Password"}
              </button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <PasswordInput
                  value={passwordForm.currentPassword}
                  onChange={(value) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: value,
                    })
                  }
                  placeholder="Enter current password"
                  label="Current Password"
                  required
                  showValidation={false}
                  showStrengthIndicator={false}
                />
                <PasswordInput
                  value={passwordForm.newPassword}
                  onChange={(value) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: value,
                    })
                  }
                  placeholder="Enter new password"
                  label="New Password"
                  required
                  showValidation={true}
                  showStrengthIndicator={true}
                />
                <PasswordMatchInput
                  value={passwordForm.confirmPassword}
                  onChange={(value) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: value,
                    })
                  }
                  password={passwordForm.newPassword}
                  placeholder="Confirm new password"
                  label="Confirm New Password"
                  required
                  showMatchIndicator={true}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={
                      updatePasswordMutation.isPending ||
                      !validatePassword(passwordForm.newPassword).isValid ||
                      passwordForm.newPassword !==
                        passwordForm.confirmPassword ||
                      !passwordForm.currentPassword
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updatePasswordMutation.isPending
                      ? "Updating..."
                      : "Update Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordForm({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
