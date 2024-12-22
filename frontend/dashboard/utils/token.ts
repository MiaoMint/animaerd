export const tokenStorage = {
  get: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },
  set: (token: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
  },
  remove: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
  }
}; 