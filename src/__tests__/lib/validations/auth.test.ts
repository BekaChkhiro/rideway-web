import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from '@/lib/validations/auth';

describe('loginSchema', () => {
  it('should validate correct login data', () => {
    const validData = {
      email: 'user@example.com',
      password: 'password123',
      rememberMe: true,
    };

    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should require email', () => {
    const invalidData = {
      email: '',
      password: 'password123',
      rememberMe: false,
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Email is required');
    }
  });

  it('should validate email format', () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'password123',
      rememberMe: false,
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Please enter a valid email address');
    }
  });

  it('should require password', () => {
    const invalidData = {
      email: 'user@example.com',
      password: '',
      rememberMe: false,
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Password is required');
    }
  });
});

describe('registerSchema', () => {
  const validData = {
    email: 'user@example.com',
    username: 'user123',
    fullName: 'John Doe',
    password: 'Password123',
    confirmPassword: 'Password123',
    acceptTerms: true,
  };

  it('should validate correct registration data', () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  describe('email validation', () => {
    it('should require email', () => {
      const result = registerSchema.safeParse({ ...validData, email: '' });
      expect(result.success).toBe(false);
    });

    it('should validate email format', () => {
      const result = registerSchema.safeParse({ ...validData, email: 'invalid' });
      expect(result.success).toBe(false);
    });
  });

  describe('username validation', () => {
    it('should require minimum 3 characters', () => {
      const result = registerSchema.safeParse({ ...validData, username: 'ab' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Username must be at least 3 characters');
      }
    });

    it('should not exceed 20 characters', () => {
      const result = registerSchema.safeParse({
        ...validData,
        username: 'a'.repeat(21),
      });
      expect(result.success).toBe(false);
    });

    it('should only allow alphanumeric and underscores', () => {
      const result = registerSchema.safeParse({
        ...validData,
        username: 'user@name',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          'Username can only contain letters, numbers, and underscores'
        );
      }
    });

    it('should allow valid usernames', () => {
      const validUsernames = ['user123', 'User_Name', '_underscore_', 'ABC'];
      validUsernames.forEach((username) => {
        const result = registerSchema.safeParse({ ...validData, username });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('fullName validation', () => {
    it('should require minimum 2 characters', () => {
      const result = registerSchema.safeParse({ ...validData, fullName: 'J' });
      expect(result.success).toBe(false);
    });

    it('should not exceed 50 characters', () => {
      const result = registerSchema.safeParse({
        ...validData,
        fullName: 'a'.repeat(51),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('password validation', () => {
    it('should require minimum 8 characters', () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: 'Pass1',
        confirmPassword: 'Pass1',
      });
      expect(result.success).toBe(false);
    });

    it('should require uppercase letter', () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should require lowercase letter', () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: 'PASSWORD123',
        confirmPassword: 'PASSWORD123',
      });
      expect(result.success).toBe(false);
    });

    it('should require number', () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: 'PasswordABC',
        confirmPassword: 'PasswordABC',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('confirmPassword validation', () => {
    it('should match password', () => {
      const result = registerSchema.safeParse({
        ...validData,
        confirmPassword: 'DifferentPassword123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmError = result.error.issues.find(
          (issue) => issue.path.includes('confirmPassword')
        );
        expect(confirmError?.message).toBe('Passwords do not match');
      }
    });
  });

  describe('acceptTerms validation', () => {
    it('should require terms acceptance', () => {
      const result = registerSchema.safeParse({
        ...validData,
        acceptTerms: false,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          'You must accept the terms and conditions'
        );
      }
    });
  });
});

describe('forgotPasswordSchema', () => {
  it('should validate correct email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(true);
  });

  it('should require email', () => {
    const result = forgotPasswordSchema.safeParse({ email: '' });
    expect(result.success).toBe(false);
  });

  it('should validate email format', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'invalid' });
    expect(result.success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  const validData = {
    code: '123456',
    password: 'NewPassword123',
    confirmPassword: 'NewPassword123',
  };

  it('should validate correct reset password data', () => {
    const result = resetPasswordSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  describe('code validation', () => {
    it('should require exactly 6 digits', () => {
      const result = resetPasswordSchema.safeParse({ ...validData, code: '12345' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Code must be 6 digits');
      }
    });

    it('should only allow numbers', () => {
      const result = resetPasswordSchema.safeParse({ ...validData, code: '12345a' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Code must contain only numbers');
      }
    });
  });

  it('should validate password requirements', () => {
    const result = resetPasswordSchema.safeParse({
      ...validData,
      password: 'weak',
      confirmPassword: 'weak',
    });
    expect(result.success).toBe(false);
  });

  it('should require matching passwords', () => {
    const result = resetPasswordSchema.safeParse({
      ...validData,
      confirmPassword: 'DifferentPassword123',
    });
    expect(result.success).toBe(false);
  });
});

describe('verifyOtpSchema', () => {
  it('should validate correct OTP code', () => {
    const result = verifyOtpSchema.safeParse({ code: '123456' });
    expect(result.success).toBe(true);
  });

  it('should require exactly 6 digits', () => {
    const shortCode = verifyOtpSchema.safeParse({ code: '12345' });
    const longCode = verifyOtpSchema.safeParse({ code: '1234567' });

    expect(shortCode.success).toBe(false);
    expect(longCode.success).toBe(false);
  });

  it('should only allow numbers', () => {
    const result = verifyOtpSchema.safeParse({ code: 'abcdef' });
    expect(result.success).toBe(false);
  });
});
