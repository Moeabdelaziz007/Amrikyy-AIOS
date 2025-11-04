export const supabase = {
  auth: {
    signUp: jest.fn().mockResolvedValue({
      data: {
        user: { id: '123', email: 'test@example.com' },
        session: { access_token: 'fake-token' },
      },
      error: null,
    }),
    signInWithPassword: jest.fn().mockResolvedValue({
      data: {
        user: { id: '123', email: 'test@example.com' },
        session: { access_token: 'fake-token' },
      },
      error: null,
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    getUser: jest.fn().mockResolvedValue({
      data: { user: { id: '123', email: 'test@example.com' } },
      error: null,
    }),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: { id: '1' }, error: null }),
  })),
};
