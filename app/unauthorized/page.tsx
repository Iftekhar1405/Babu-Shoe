"use client";

import { AuthProvider, useAuthContext } from "@/context/auth-context";

export default function Page() {
  return (
    <AuthProvider>
      <UnauthorizedPage />
    </AuthProvider>
  )
}


function UnauthorizedPage() {
  const { user } = useAuthContext();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this page.
          </p>
          {user && (
            <p className="mt-1 text-xs text-gray-500">
              Signed in as: {user.name} ({user.role})
            </p>
          )}
        </div>
        <div className="space-y-4">
          <a
            href="/dashboard"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Dashboard
          </a>
          <a
            href="/"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}