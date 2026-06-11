
describe('envConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('apiBaseUrl', () => {
    it('should use NEXT_PUBLIC_SERVER if defined', () => {
      process.env.NEXT_PUBLIC_SERVER = 'https://api.example.com';
      jest.isolateModules(() => {
        const { apiBaseUrl } = require('../services/envConfig');
        expect(apiBaseUrl).toBe('https://api.example.com');
      });
    });

    it('should fallback to localhost:8000 if NEXT_PUBLIC_SERVER is not defined', () => {
      delete process.env.NEXT_PUBLIC_SERVER;
      jest.isolateModules(() => {
        const { apiBaseUrl } = require('../services/envConfig');
        expect(apiBaseUrl).toBe('http://localhost:8000');
      });
    });
  });

  describe('appName', () => {
    it('should use NEXT_PUBLIC_NAME if defined', () => {
      process.env.NEXT_PUBLIC_NAME = 'TestApp';
      jest.isolateModules(() => {
        const { appName } = require('../services/envConfig');
        expect(appName).toBe('TestApp');
      });
    });

    it('should fallback to Dadgad if NEXT_PUBLIC_NAME is not defined', () => {
      delete process.env.NEXT_PUBLIC_NAME;
      jest.isolateModules(() => {
        const { appName } = require('../services/envConfig');
        expect(appName).toBe('Dadgad');
      });
    });
  });
});
