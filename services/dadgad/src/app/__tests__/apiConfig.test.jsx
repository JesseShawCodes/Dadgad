
describe('apiConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should use NEXT_PUBLIC_SERVER if defined', () => {
    process.env.NEXT_PUBLIC_SERVER = 'https://api.example.com';
    // Use isolateModules to ensure the module is re-evaluated with the new env
    jest.isolateModules(() => {
      const { API_BASE_URL } = require('../services/apiConfig');
      expect(API_BASE_URL).toBe('https://api.example.com');
    });
  });

  it('should fallback to localhost:8000 if NEXT_PUBLIC_SERVER is not defined', () => {
    delete process.env.NEXT_PUBLIC_SERVER;
    jest.isolateModules(() => {
      const { API_BASE_URL } = require('../services/apiConfig');
      expect(API_BASE_URL).toBe('http://localhost:8000');
    });
  });
});
