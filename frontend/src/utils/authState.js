const TOKEN_KEYS = ['token', 'authToken', 'accessToken', 'jwtToken'];

const normalizeRole = (role) => {
  const value = String(role || '').trim().toUpperCase();

  if (!value) {
    return '';
  }

  return value.startsWith('ROLE_') ? value.slice(5) : value;
};

export const getStoredToken = () => {
  for (const key of TOKEN_KEYS) {
    const value = localStorage.getItem(key);
    if (value && value.trim()) {
      return value;
    }
  }

  return null;
};

export const getStoredRole = () => normalizeRole(localStorage.getItem('role'));

export const readAuthState = () => {
  const token = getStoredToken();
  const role = getStoredRole();

  return {
    token,
    role,
    isAuthenticated: Boolean(token),
    isCustomer: Boolean(token) && role === 'CUSTOMER',
    isAdmin: Boolean(token) && role === 'ADMIN',
  };
};
