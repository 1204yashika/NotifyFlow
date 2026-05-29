import { describe, it, expect } from 'vitest';
import { getMemberId, getMemberName, getMemberEmail } from '../../types';
import type { Member } from '../../types';

describe('Member helper functions', () => {
  const populatedMember: Member = {
    userId : {
      _id: 'user-123',
      name: 'Yashika Test',
      email: 'yashika@test.com',
      createdAt: '2026-05-21T04:43:59.670Z',
    },
    role: 'owner',
  };

  const unpopulatedMember: Member = {
    userId: 'user-123',
    role: 'member',
  };

  describe('getMemberId', () => {
    it('returns _id from populated member', () => {
      expect(getMemberId(populatedMember)).toBe('user-123');
    });

    it('returns string directly for unpopulated member', () => {
      expect(getMemberId(unpopulatedMember)).toBe('user-123');
    });
  });

  describe('getMemberName', () => {
    it('returns name from populated member', () => {
      expect(getMemberName(populatedMember)).toBe('Yashika Test');
    });

    it('returns last 6 chars of id for unpopulated member', () => {
      expect(getMemberName(unpopulatedMember)).toBe('er-123');
    });
  });

  describe('getMemberEmail', () => {
    it('returns email from populated member', () => {
      expect(getMemberEmail(populatedMember)).toBe('yashika@test.com');
    });

    it('returns empty string for unpopulated member', () => {
      expect(getMemberEmail(unpopulatedMember)).toBe('');
    });
  });
});