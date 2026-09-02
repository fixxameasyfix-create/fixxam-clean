export const isValidEmail = (
  email: string
) => {
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(
    email.trim()
  );
};

export const isValidPhone = (
  phone: string
) => {
  const cleanPhone =
    phone.replace(/\D/g, "");

  return cleanPhone.length === 11;
};

export const isValidPassword = (
  password: string
) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  return passwordRegex.test(
    password
  );
};