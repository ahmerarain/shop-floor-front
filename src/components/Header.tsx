import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { UserManagement } from "./auth/UserManagement";
import { ProfileModal } from "./auth/ProfileModal";
import { Search, Loader2, Users, LogOut, FileText } from "lucide-react";

interface HeaderProps {
  onSearch: (term: string) => void;
  onShowAuditLog: () => void;
  totalRows: number;
  isSearching?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  onShowAuditLog,
  totalRows,
  isSearching = false,
}) => {
  const { user, logout } = useAuth();
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              CSV Ingest + Grid MVP
            </h1>
            <p className="text-sm text-gray-600">
              {totalRows} rows loaded • Offline capable
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by PartMark, AssemblyMark, or Material..."
                className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => onSearch(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {isSearching ? (
                  <Loader2 className="animate-spin h-5 w-5 text-blue-500" />
                ) : (
                  <Search className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* User Menu */}
            {user && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowProfile(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.first_name.charAt(0)}
                      {user.last_name.charAt(0)}
                    </div>
                    <span className="hidden sm:block">
                      {user.first_name} {user.last_name}
                    </span>
                  </button>
                </div>

                <button
                  onClick={() => setShowUserManagement(true)}
                  className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-1"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:block">Users</span>
                </button>

                <button
                  onClick={logout}
                  className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </div>
            )}

            <button
              onClick={onShowAuditLog}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Audit Log
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UserManagement
        isOpen={showUserManagement}
        onClose={() => setShowUserManagement(false)}
      />
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </header>
  );
};
