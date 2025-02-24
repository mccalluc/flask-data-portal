import { createScfindKey, SCFIND_BASE } from './utils';

describe('createScfindKey', () => {
  function expectURLIsValid(key: string) {
    expect(() => new URL(key)).not.toThrow();
  }

  it('should use the appropriate scfind base URL', () => {
    const key = createScfindKey('endpoint', {});
    expect(key).toContain(SCFIND_BASE);
    expectURLIsValid(key);
  });

  it.each(['endpoint1', 'endpoint2', 'endpoint3', 'my-weird-endpoint'])(
    'should use the appropriate provided endpoint',
    (endpoint) => {
      const key = createScfindKey(endpoint, {});
      expect(key).toContain(endpoint);
      expectURLIsValid(key);
    },
  );

  it.each([
    {
      params: {
        param1: 'value1',
        param2: 'value2',
        param3: undefined,
      },
      definedKeys: ['param1', 'param2'],
      undefinedKeys: ['param3'],
    },
  ])('should filter out undefined passed params', ({ params, definedKeys, undefinedKeys }) => {
    const key = createScfindKey('endpoint', params);
    definedKeys.forEach((k) => {
      expect(key.includes(k));
    });
    undefinedKeys.forEach((k) => {
      expect(!key.includes(k));
    });
    expectURLIsValid(key);
  });
});
