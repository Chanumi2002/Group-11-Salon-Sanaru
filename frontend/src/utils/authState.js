const normalizeRole = (role) => {
  const value = String(role || '').trim().toUpperCase();

  if (!value) {
    return '';
  }

  return value.startsWith('ROLE_') ? value.slice(5) : value;
};

export const getStoredToken = () => {
  try {
    const token = localStorage.getItem('token');
    return token && token.trim() ? token : null;
  } catch (error) {
    // Handle Tracking Prevention or private mode localStorage access
    console.debug('localStorage access restricted');
    return null;
  }
};

export const getStoredRole = () => {
  try {
    return normalizeRole(localStorage.getItem('role'));
  } catch (error) {
    // Handle Tracking Prevention or private mode localStorage access
    console.debug('localStorage access restricted');
    return '';
  }
};

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
