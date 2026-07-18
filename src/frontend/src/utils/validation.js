export function validateEmail(email) {
  if (!email?.trim()) return 'Email is required';
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(email.trim())) return 'Enter a valid email address';
  return '';
}

export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return '';
}

export function validateName(name) {
  if (!name?.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  return '';
}

export function mapApiErrors(details) {
  if (!Array.isArray(details)) return {};
  return details.reduce((acc, item) => {
    if (item.path) acc[item.path] = item.msg;
    return acc;
  }, {});
}
