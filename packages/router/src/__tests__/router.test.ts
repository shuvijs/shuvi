import { MemoryHistory } from '../history';
import { createRouter } from '../router';

describe('router', () => {
  describe('current', () => {
    it('should not change until history changes', () => {
      const router = createRouter({
        routes: [{ path: '/' }, { path: '/about' }],
        history: new MemoryHistory({
          initialEntries: ['/', '/about'],
          initialIndex: 0
        })
      });

      let current = router.current;
      expect(current === router.current);
      router.push('/about');
      expect(current !== router.current);
    });
  });
});
