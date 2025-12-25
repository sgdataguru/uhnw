import { MOCK_USERS } from './mock-users';
import type { AuthSession } from './session';

export const authenticateUser = (email: string, password: string): AuthSession | null => {
  const match = MOCK_USERS.find(
    (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password,
  );

  if (!match) {
    return null;
  }

  return {
    isAuthenticated: true,
    user: match.profile,
  };
};
