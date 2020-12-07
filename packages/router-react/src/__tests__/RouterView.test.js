import { create as createTestRenderer } from 'react-test-renderer';
import { MemoryRouter as Router, RouterView } from '..';

describe('useOutlet', () => {
  describe('when there is no child route', () => {
    it('returns null', () => {
      function Home() {
        return <RouterView />;
      }

      let renderer = createTestRenderer(
        <Router
          initialEntries={['/home']}
          routes={[
            {
              path: '/home',
              component: Home
            }
          ]}
        >
          <RouterView />
        </Router>
      );

      expect(renderer.toJSON()).toBeNull();
    });
  });

  describe('when there is a child route', () => {
    it('returns an element', () => {
      function Users() {
        return <RouterView />;
      }

      function Profile() {
        return <p>Profile</p>;
      }

      let renderer = createTestRenderer(
        <Router
          initialEntries={['/users/profile']}
          routes={[
            {
              path: '/users',
              component: Users,
              children: [
                {
                  path: '/profile',
                  component: Profile
                }
              ]
            }
          ]}
        >
          <RouterView />
        </Router>
      );

      expect(renderer.toJSON()).toMatchSnapshot();
    });
  });
});
