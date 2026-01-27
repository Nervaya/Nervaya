export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  valid: boolean;
  message?: string;
} {
  // Minimum length
  if (password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters long",
    };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }

  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one number",
    };
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one special character",
    };
  }

  // Check for common weak passwords
  const commonPasswords = [
    "password",
    "12345678",
    "qwerty",
    "abc123",
    "password123",
  ];
  if (
    commonPasswords.some((common) => password.toLowerCase().includes(common))
  ) {
    return {
      valid: false,
      message: "Password is too common. Please choose a stronger password",
    };
  }

  return { valid: true };
}

export function validateName(name: string): boolean {
  return name.trim().length >= 2;
}
