import * as React from 'react';
import { create as createTestRenderer } from 'react-test-renderer';
import { MemoryRouter as Router, useParams, RouterView } from '..';

describe('route matching', () => {
  describe('using a route config object', () => {
    describeRouteMatching([
      {
        path: 'courses',
        element: <Courses />,
        children: [
          {
            path: ':id',
            element: <Course />,
            children: [{ path: 'grades', element: <CourseGrades /> }]
          },
          { path: 'new', element: <NewCourse /> },
          { path: '/', element: <CoursesIndex /> },
          { path: '*', element: <CoursesNotFound /> }
        ]
      },
      {
        path: 'courses',
        element: <Landing />,
        children: [
          { path: 'react-fundamentals', element: <ReactFundamentals /> },
          { path: 'advanced-react', element: <AdvancedReact /> },
          { path: '*', element: <NeverRender /> }
        ]
      },
      { path: '/', element: <Home /> },
      { path: '*', element: <NotFound /> }
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
