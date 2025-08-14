
import { useAuthContext } from '@/context/auth-context';
import { UserMenu } from './UserMenu';

export const AuthStatus: React.FC = () => {
    const { isAuthenticated, isLoading, user } = useAuthContext();

    if (isLoading) {
        return (
            <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600">Loading...</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex items-center space-x-4">
                <a
                    href="/login"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                    Sign in
                </a>
                <a
                    href="/register"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                    Sign up
                </a>
            </div>
        );
    }

    return <UserMenu />;
};