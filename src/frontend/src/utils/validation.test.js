import { describe, expect, it } from 'vitest';
import {
  mapApiErrors,
  validateEmail,
  validateName,
  validatePassword,
} from './validation';

describe('validation helpers', () => {
  describe('validateEmail', () => {
    it('requires a value', () => {
      expect(validateEmail('')).toBe('Email is required');
      expect(validateEmail('   ')).toBe('Email is required');
    });

    it('rejects malformed emails', () => {
      expect(validateEmail('not-an-email')).toBe('Enter a valid email address');
    });

    it('accepts a normal email', () => {
      expect(validateEmail('alice@example.com')).toBe('');
    });
  });

  describe('validatePassword', () => {
    it('requires a password of at least 8 characters', () => {
      expect(validatePassword('')).toBe('Password is required');
      expect(validatePassword('short')).toBe('Password must be at least 8 characters');
      expect(validatePassword('Password123!')).toBe('');
    });
  });

  describe('validateName', () => {
    it('requires at least two characters', () => {
      expect(validateName('')).toBe('Name is required');
      expect(validateName('A')).toBe('Name must be at least 2 characters');
      expect(validateName('Alice')).toBe('');
    });
  });

  describe('mapApiErrors', () => {
    it('maps express-validator style details onto field keys', () => {
      expect(
        mapApiErrors([
          { path: 'email', msg: 'Email is required' },
          { path: 'password', msg: 'Too short' },
        ])
      ).toEqual({
        email: 'Email is required',
        password: 'Too short',
      });
    });

    it('returns an empty object for non-arrays', () => {
      expect(mapApiErrors(null)).toEqual({});
    });
  });
});
