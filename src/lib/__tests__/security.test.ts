/**
 * Security Module Tests
 * Tests for security utilities and validation
 */

import { describe, it, expect, vi } from 'vitest';

// Mock security module
vi.mock('@/lib/security', () => ({
  sanitizeInput: vi.fn(),
  validateCSRFToken: vi.fn(),
  rateLimitCheck: vi.fn(),
  validateApiKey: vi.fn(),
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
  generateSecureToken: vi.fn(),
  validateEmail: vi.fn(),
  sanitizeHtml: vi.fn(),
  escapeHtml: vi.fn(),
}));

import {
  sanitizeInput,
  validateCSRFToken,
  rateLimitCheck,
  validateApiKey,
  hashPassword,
  verifyPassword,
  generateSecureToken,
  validateEmail,
  sanitizeHtml,
  escapeHtml,
} from '@/lib/security';

describe('Security Module', () => {
  describe('Input Sanitization', () => {
    it('should sanitize user input', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello World';
      const sanitized = sanitizeInput(maliciousInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
      expect(sanitized).toContain('Hello World');
    });

    it('should handle empty input', () => {
      const result = sanitizeInput('');
      expect(result).toBe('');
    });

    it('should handle null/undefined input', () => {
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
    });

    it('should preserve safe HTML', () => {
      const safeInput = '<p>This is <strong>safe</strong> HTML</p>';
      const result = sanitizeInput(safeInput);
      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
    });
  });

  describe('CSRF Protection', () => {
    it('should validate CSRF token', () => {
      const validToken = 'valid-csrf-token';
      const result = validateCSRFToken(validToken);
      expect(result).toBe(true);
    });

    it('should reject invalid CSRF token', () => {
      const invalidToken = 'invalid-token';
      const result = validateCSRFToken(invalidToken);
      expect(result).toBe(false);
    });

    it('should handle empty CSRF token', () => {
      const result = validateCSRFToken('');
      expect(result).toBe(false);
    });

    it('should handle null CSRF token', () => {
      const result = validateCSRFToken(null as any);
      expect(result).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', () => {
      const ip = '192.168.1.1';
      const result = rateLimitCheck(ip, 10, 60); // 10 requests per minute
      expect(result.allowed).toBe(true);
    });

    it('should block requests exceeding rate limit', () => {
      const ip = '192.168.1.1';
      
      // Simulate multiple requests
      for (let i = 0; i < 15; i++) {
        rateLimitCheck(ip, 10, 60);
      }
      
      const result = rateLimitCheck(ip, 10, 60);
      expect(result.allowed).toBe(false);
    });

    it('should track different IPs separately', () => {
      const ip1 = '192.168.1.1';
      const ip2 = '192.168.1.2';
      
      // Both IPs should be allowed initially
      expect(rateLimitCheck(ip1, 5, 60).allowed).toBe(true);
      expect(rateLimitCheck(ip2, 5, 60).allowed).toBe(true);
    });

    it('should provide rate limit information', () => {
      const ip = '192.168.1.1';
      const result = rateLimitCheck(ip, 10, 60);
      
      expect(result).toHaveProperty('allowed');
      expect(result).toHaveProperty('remaining');
      expect(result).toHaveProperty('resetTime');
    });
  });

  describe('API Key Validation', () => {
    it('should validate correct API key', () => {
      const validApiKey = 'valid-api-key-123';
      const result = validateApiKey(validApiKey);
      expect(result).toBe(true);
    });

    it('should reject invalid API key', () => {
      const invalidApiKey = 'invalid-key';
      const result = validateApiKey(invalidApiKey);
      expect(result).toBe(false);
    });

    it('should handle empty API key', () => {
      const result = validateApiKey('');
      expect(result).toBe(false);
    });

    it('should handle malformed API key', () => {
      const malformedKey = 'key-with-special-chars!@#';
      const result = validateApiKey(malformedKey);
      expect(result).toBe(false);
    });
  });

  describe('Password Security', () => {
    it('should hash password correctly', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);
      
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(50);
    });

    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);
      const isValid = await verifyPassword(password, hashed);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword';
      const hashed = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hashed);
      
      expect(isValid).toBe(false);
    });

    it('should handle empty password', async () => {
      const hashed = await hashPassword('');
      expect(hashed).toBeDefined();
    });
  });

  describe('Token Generation', () => {
    it('should generate secure token', () => {
      const token = generateSecureToken();
      
      expect(token).toBeDefined();
      expect(token.length).toBeGreaterThan(20);
      expect(typeof token).toBe('string');
    });

    it('should generate unique tokens', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      
      expect(token1).not.toBe(token2);
    });

    it('should generate token with specified length', () => {
      const token = generateSecureToken(32);
      expect(token.length).toBe(32);
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('test.example.com')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('test@example')).toBe(false);
      expect(validateEmail('.test@example.com')).toBe(false);
    });
  });

  describe('HTML Sanitization', () => {
    it('should sanitize malicious HTML', () => {
      const maliciousHtml = '<script>alert("xss")</script><p>Safe content</p>';
      const sanitized = sanitizeHtml(maliciousHtml);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
      expect(sanitized).toContain('<p>Safe content</p>');
    });

    it('should preserve safe HTML tags', () => {
      const safeHtml = '<p>Paragraph</p><strong>Bold</strong><em>Italic</em>';
      const sanitized = sanitizeHtml(safeHtml);
      
      expect(sanitized).toContain('<p>');
      expect(sanitized).toContain('<strong>');
      expect(sanitized).toContain('<em>');
    });

    it('should remove dangerous attributes', () => {
      const dangerousHtml = '<img src="image.jpg" onerror="alert(\'xss\')">';
      const sanitized = sanitizeHtml(dangerousHtml);
      
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).toContain('src="image.jpg"');
    });
  });

  describe('HTML Escaping', () => {
    it('should escape HTML characters', () => {
      const html = '<script>alert("xss")</script>';
      const escaped = escapeHtml(html);
      
      expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('should handle empty string', () => {
      const escaped = escapeHtml('');
      expect(escaped).toBe('');
    });

    it('should handle special characters', () => {
      const text = 'Hello & "World" < >';
      const escaped = escapeHtml(text);
      
      expect(escaped).toBe('Hello &amp; &quot;World&quot; &lt; &gt;');
    });
  });

  describe('Security Integration', () => {
    it('should handle complete security workflow', async () => {
      // Simulate user registration
      const userInput = '<script>alert("xss")</script>John Doe';
      const email = 'john@example.com';
      const password = 'securePassword123';
      
      // Sanitize input
      const sanitizedInput = sanitizeInput(userInput);
      expect(sanitizedInput).not.toContain('<script>');
      
      // Validate email
      const isValidEmail = validateEmail(email);
      expect(isValidEmail).toBe(true);
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      expect(hashedPassword).toBeDefined();
      
      // Verify password
      const isPasswordValid = await verifyPassword(password, hashedPassword);
      expect(isPasswordValid).toBe(true);
    });

    it('should handle API request security', () => {
      const apiKey = 'valid-api-key-123';
      const csrfToken = 'valid-csrf-token';
      const ip = '192.168.1.1';
      
      // Validate API key
      const isValidApiKey = validateApiKey(apiKey);
      expect(isValidApiKey).toBe(true);
      
      // Validate CSRF token
      const isValidCSRF = validateCSRFToken(csrfToken);
      expect(isValidCSRF).toBe(true);
      
      // Check rate limit
      const rateLimit = rateLimitCheck(ip, 10, 60);
      expect(rateLimit.allowed).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle security function errors gracefully', () => {
      expect(() => sanitizeInput(null as any)).not.toThrow();
      expect(() => validateCSRFToken(undefined as any)).not.toThrow();
      expect(() => rateLimitCheck('', 10, 60)).not.toThrow();
    });

    it('should handle password hashing errors', async () => {
      await expect(hashPassword(null as any)).rejects.toThrow();
    });

    it('should handle token generation errors', () => {
      expect(() => generateSecureToken(-1)).toThrow();
    });
  });
});
