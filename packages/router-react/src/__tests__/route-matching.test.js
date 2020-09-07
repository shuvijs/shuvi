import * as React from 'react';
import { create as createTestRenderer } from 'react-test-renderer';
import { MemoryRouter as Router, useParams, RouterView } from '..';

describe('route matching', () => {
  describe('using a route config object', () => {
    describeRouteMatching([
      {
        path: 'courses',
        component: Courses,
        children: [
          {
            path: ':id',
            component: Course,
            children: [{ path: 'grades', component: CourseGrades }]
          },
          { path: 'new', component: NewCourse },
          { path: '/', component: CoursesIndex },
          { path: '*', component: CoursesNotFound }
        ]
      },
      {
        path: 'courses',
        component: Landing,
        children: [
          { path: 'react-fundamentals', component: ReactFundamentals },
          { path: 'advanced-react', component: AdvancedReact },
          { path: '*', component: NeverRender }
        ]
      },
      { path: '/', component: Home },
      { path: '*', component: NotFound }
    ]);
  });

  function describeRouteMatching(routes) {
    let testPaths = [
      '/courses',
      '/courses/routing',
      '/courses/routing/grades',
      '/courses/new',
      '/courses/not/found',
      '/courses/react-fundamentals',
      '/courses/advanced-react',
      '/',
      '/not-found'
    ];

    testPaths.forEach(path => {
      it(`renders the right elements at ${path}`, () => {
        expect(renderRoutes(routes, path)).toMatchSnapshot();
      });
    });
  }

  function renderRoutes(routes, entry) {
    let renderer = createTestRenderer(
      <Router
        initialEntries={[entry]}
        children={<RouterView />}
        routes={routes}
      />
    );

    return renderer.toJSON();
  }

  function Courses() {
    return (
      <div>
        <h1>Courses</h1>
        <RouterView />
      </div>
    );
  }

  function Course() {
    let { id } = useParams();

    return (
      <div>
        <h2>Course {id}</h2>
        <RouterView />
      </div>
    );
  }

  function CourseGrades() {
    return <p>Course Grades</p>;
  }

  function NewCourse() {
    return <p>New Course</p>;
  }

  function CoursesIndex() {
    return <p>All Courses</p>;
  }

  function CoursesNotFound() {
    return <p>Course Not Found</p>;
  }

  function Landing() {
    return (
      <p>
        <h1>Welcome to React Training</h1>
        <RouterView />
      </p>
    );
  }

  function ReactFundamentals() {
    return <p>React Fundamentals</p>;
  }

  function AdvancedReact() {
    return <p>Advanced React</p>;
  }

  function Home() {
    return <p>Home</p>;
  }

  function NotFound() {
    return <p>Not Found</p>;
  }

  function NeverRender() {
    throw new Error('NeverRender should ... uh ... never render');
  }
});
