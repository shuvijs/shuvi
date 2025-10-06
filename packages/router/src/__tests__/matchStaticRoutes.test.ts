import { matchRoutes } from '../matchRoutes';
import { matchStaticRoutes } from '../matchStaticRoutes';
import { IRouteBaseObject } from '../matchRoutes';

// Generate large number of static routes for performance testing
function generateStaticRoutes(count: number): IRouteBaseObject[] {
  const routes: IRouteBaseObject[] = [];
  
  // Root route
  routes.push({ path: '/', component: 'Home' });
  
  // First level static routes
  for (let i = 1; i <= count * 0.4; i++) {
    routes.push({
      path: `/page-${i}`,
      component: `Page${i}`
    });
  }
  
  // Second level static routes
  for (let i = 1; i <= count * 0.3; i++) {
    routes.push({
      path: `/category-${i}/item-${i}`,
      component: `CategoryItem${i}`
    });
  }
  
  // Third level static routes
  for (let i = 1; i <= count * 0.2; i++) {
    routes.push({
      path: `/section-${i}/subsection-${i}/page-${i}`,
      component: `DeepPage${i}`
    });
  }
  
  // Nested routes with children
  for (let i = 1; i <= count * 0.1; i++) {
    routes.push({
      path: `/nested-${i}`,
      component: `Layout${i}`,
      children: [
        { path: '', component: `Index${i}` },
        { path: 'about', component: `About${i}` },
        { path: 'contact', component: `Contact${i}` }
      ]
    });
  }
  
  return routes;
}

// Generate test paths for performance testing
function generateTestPaths(routes: IRouteBaseObject[], sampleSize: number): string[] {
  const paths: string[] = [];
  const staticRoutes = routes.filter(r => !r.path.includes(':') && !r.path.includes('*'));
  
  // Add existing paths (70% hit rate)
  for (let i = 0; i < sampleSize * 0.7; i++) {
    const randomRoute = staticRoutes[Math.floor(Math.random() * staticRoutes.length)];
    paths.push(randomRoute.path);
  }
  
  // Add nested route paths
  for (let i = 1; i <= sampleSize * 0.15; i++) {
    paths.push(`/nested-${i}/about`);
  }
  
  // Add non-existent paths (15% miss rate)
  for (let i = 0; i < sampleSize * 0.15; i++) {
    paths.push(`/non-existent-${i}`);
  }
  
  return paths;
}

describe('matchStaticRoutes Performance Tests', () => {
  describe('Correctness Verification', () => {
    const routes: IRouteBaseObject[] = [
      { path: '/', component: 'Home' },
      { path: '/about', component: 'About' },
      { path: '/contact', component: 'Contact' },
      { path: '/products/list', component: 'ProductList' },
      { 
        path: '/nested', 
        component: 'Layout',
        children: [
          { path: '', component: 'NestedIndex' },
          { path: 'child', component: 'NestedChild' }
        ]
      }
    ];

    test('should produce identical results to original matchRoutes', () => {
      const testPaths = [
        '/',
        '/about',
        '/contact',
        '/products/list',
        '/nested',
        '/nested/child',
        '/non-existent'
      ];

      for (const path of testPaths) {
        const originalResult = matchRoutes(routes, path);
        const optimizedResult = matchStaticRoutes(routes, path);
        
        if (originalResult === null) {
          expect(optimizedResult).toBeNull();
        } else {
          expect(optimizedResult).not.toBeNull();
          expect(optimizedResult!.length).toBe(originalResult.length);
          
          // Verify each match
          for (let i = 0; i < originalResult.length; i++) {
            expect(optimizedResult![i].pathname).toBe(originalResult[i].pathname);
            expect(optimizedResult![i].route.component).toBe(originalResult[i].route.component);
            expect(optimizedResult![i].params).toEqual(originalResult[i].params);
          }
        }
      }
    });

    test('should handle trailing slashes correctly', () => {
      const testCases = [
        { path: '/about/', expected: 'About' },
        { path: '/about', expected: 'About' },
        { path: '/contact/', expected: 'Contact' },
        { path: '/contact', expected: 'Contact' }
      ];
      
      for (const { path, expected } of testCases) {
        const result = matchStaticRoutes(routes, path);
        expect(result).not.toBeNull();
        expect(result![0].route.component).toBe(expected);
      }
    });

    test('should handle nested routes correctly', () => {
      const result1 = matchStaticRoutes(routes, '/nested');
      expect(result1).not.toBeNull();
      expect(result1!.length).toBe(2);
      expect(result1![0].route.component).toBe('Layout');
      expect(result1![1].route.component).toBe('NestedIndex');

      const result2 = matchStaticRoutes(routes, '/nested/child');
      expect(result2).not.toBeNull();
      expect(result2!.length).toBe(2);
      expect(result2![0].route.component).toBe('Layout');
      expect(result2![1].route.component).toBe('NestedChild');
    });

    test('should handle basename correctly', () => {
      const result = matchStaticRoutes(routes, '/app/about', '/app');
      expect(result).not.toBeNull();
      expect(result![0].route.component).toBe('About');
    });
  });

  describe('Performance Benchmarks', () => {
    test('Direct Performance Comparison - 200 Static Routes', () => {
      const routes = generateStaticRoutes(200);
      const testPaths = generateTestPaths(routes, 50);
      const iterations = 2000;
      
      console.log(`\n🚀 Direct Performance Test:`);
      console.log(`   Routes: ${routes.length}`);
      console.log(`   Test paths: ${testPaths.length}`);
      console.log(`   Iterations: ${iterations}`);
      
      // Warm up both implementations
      for (const path of testPaths.slice(0, 3)) {
        matchRoutes(routes, path);
        matchStaticRoutes(routes, path);
      }
      
      // Test matchRoutes (original)
      const originalStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        const path = testPaths[i % testPaths.length];
        matchRoutes(routes, path);
      }
      const originalTime = performance.now() - originalStart;
      
      // Test matchStaticRoutes (optimized)
      const optimizedStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        const path = testPaths[i % testPaths.length];
        matchStaticRoutes(routes, path);
      }
      const optimizedTime = performance.now() - optimizedStart;
      
      const improvement = ((originalTime - optimizedTime) / originalTime * 100);
      const speedRatio = originalTime / optimizedTime;
      
      console.log(`\n📊 Results:`);
      console.log(`   matchRoutes (original):    ${originalTime.toFixed(2)}ms`);
      console.log(`   matchStaticRoutes (opt):   ${optimizedTime.toFixed(2)}ms`);
      console.log(`   Performance improvement:   ${improvement.toFixed(1)}%`);
      console.log(`   Speed ratio:               ${speedRatio.toFixed(1)}x faster`);
      console.log(`   Per match (original):      ${(originalTime / iterations).toFixed(4)}ms`);
      console.log(`   Per match (optimized):     ${(optimizedTime / iterations).toFixed(4)}ms`);
      
      // Verify correctness
      for (const path of testPaths.slice(0, 10)) {
        const originalResult = matchRoutes(routes, path);
        const optimizedResult = matchStaticRoutes(routes, path);
        
        if (originalResult === null) {
          expect(optimizedResult).toBeNull();
        } else {
          expect(optimizedResult).not.toBeNull();
          expect(optimizedResult!.length).toBe(originalResult.length);
        }
      }
      
      // Performance assertions
      expect(optimizedTime).toBeLessThan(originalTime);
      expect(improvement).toBeGreaterThan(50); // At least 50% improvement
      expect(speedRatio).toBeGreaterThan(2); // At least 2x faster
    });

    test('Scaling Test - Multiple Route Counts', () => {
      const routeCounts = [100, 200, 300, 400];
      const iterations = 1000;
      
      console.log(`\n📈 Scaling Analysis:`);
      console.log('Routes | Original | Optimized | Improvement | Ratio');
      console.log('-------|----------|-----------|-------------|------');
      
      for (const count of routeCounts) {
        const routes = generateStaticRoutes(count);
        const testPaths = generateTestPaths(routes, 30);
        
        // Warm up
        matchRoutes(routes, testPaths[0]);
        matchStaticRoutes(routes, testPaths[0]);
        
        // Benchmark original
        const originalStart = performance.now();
        for (let i = 0; i < iterations; i++) {
          matchRoutes(routes, testPaths[i % testPaths.length]);
        }
        const originalTime = performance.now() - originalStart;
        
        // Benchmark optimized
        const optimizedStart = performance.now();
        for (let i = 0; i < iterations; i++) {
          matchStaticRoutes(routes, testPaths[i % testPaths.length]);
        }
        const optimizedTime = performance.now() - optimizedStart;
        
        const improvement = ((originalTime - optimizedTime) / originalTime * 100);
        const ratio = originalTime / optimizedTime;
        
        console.log(`${count.toString().padStart(6)} | ${originalTime.toFixed(2).padStart(8)} | ${optimizedTime.toFixed(2).padStart(9)} | ${improvement.toFixed(1).padStart(10)}% | ${ratio.toFixed(1).padStart(4)}x`);
        
        expect(optimizedTime).toBeLessThan(originalTime);
      }
    });
  });


  describe('Edge Cases and Robustness', () => {
    test('should handle empty routes array', () => {
      const result = matchStaticRoutes([], '/any-path');
      expect(result).toBeNull();
    });

    test('should handle single route', () => {
      const routes = [{ path: '/', component: 'Home' }];
      const result = matchStaticRoutes(routes, '/');
      expect(result).not.toBeNull();
      expect(result![0].route.component).toBe('Home');
    });

    test('should handle routes with empty paths', () => {
      const routes = [
        { path: '/', component: 'Home' },
        { path: '', component: 'Empty' }
      ];
      
      const result1 = matchStaticRoutes(routes, '/');
      const result2 = matchStaticRoutes(routes, '');
      
      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();
    });

    test('should handle complex nested structures', () => {
      const routes = [
        {
          path: '/app',
          component: 'AppLayout',
          children: [
            {
              path: 'dashboard',
              component: 'DashboardLayout',
              children: [
                { path: '', component: 'DashboardHome' },
                { path: 'analytics', component: 'Analytics' },
                { path: 'reports', component: 'Reports' }
              ]
            }
          ]
        }
      ];
      
      const testCases = [
        { path: '/app/dashboard', expectedComponents: ['AppLayout', 'DashboardLayout', 'DashboardHome'] },
        { path: '/app/dashboard/analytics', expectedComponents: ['AppLayout', 'DashboardLayout', 'Analytics'] },
        { path: '/app/dashboard/reports', expectedComponents: ['AppLayout', 'DashboardLayout', 'Reports'] }
      ];
      
      for (const { path, expectedComponents } of testCases) {
        const result = matchStaticRoutes(routes, path);
        expect(result).not.toBeNull();
        expect(result!.length).toBe(expectedComponents.length);
        
        expectedComponents.forEach((component, index) => {
          expect(result![index].route.component).toBe(component);
        });
      }
    });

    test('should maintain performance with many similar paths', () => {
      // Create routes with similar prefixes to test trie efficiency
      const routes: IRouteBaseObject[] = [];
      for (let i = 0; i < 1000; i++) {
        routes.push({ path: `/api/v1/users/${i}`, component: `User${i}` });
        routes.push({ path: `/api/v1/posts/${i}`, component: `Post${i}` });
        routes.push({ path: `/api/v2/users/${i}`, component: `UserV2${i}` });
      }
      
      const testPaths = [
        '/api/v1/users/500',
        '/api/v1/posts/750',
        '/api/v2/users/250',
        '/non-existent'
      ];
      
      const iterations = 1000;
      const start = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        const path = testPaths[i % testPaths.length];
        matchStaticRoutes(routes, path);
      }
      
      const time = performance.now() - start;
      const avgTime = time / iterations;
      
      console.log(`\n🌳 Trie Efficiency Test (3000 similar routes):`);
      console.log(`   Total time:     ${time.toFixed(2)}ms`);
      console.log(`   Avg per match:  ${avgTime.toFixed(4)}ms`);
      
      // Should still be very fast even with many similar routes
      expect(avgTime).toBeLessThan(0.1); // Less than 0.1ms per match
    });
  });

  describe('Real-world Scenarios', () => {
    test('e-commerce site simulation', () => {
      const routes: IRouteBaseObject[] = [
        { path: '/', component: 'Home' },
        { path: '/about', component: 'About' },
        { path: '/contact', component: 'Contact' },
        { path: '/privacy', component: 'Privacy' },
        { path: '/terms', component: 'Terms' }
      ];
      
      // Add product categories
      const categories = ['electronics', 'clothing', 'books', 'home', 'sports'];
      categories.forEach(category => {
        routes.push({ path: `/${category}`, component: `${category}Category` });
        
        // Add subcategories
        for (let i = 1; i <= 20; i++) {
          routes.push({ path: `/${category}/subcategory-${i}`, component: `${category}Sub${i}` });
          
          // Add product pages
          for (let j = 1; j <= 10; j++) {
            routes.push({ path: `/${category}/subcategory-${i}/product-${j}`, component: `Product${i}${j}` });
          }
        }
      });
      
      console.log(`\n🛒 E-commerce Simulation (${routes.length} routes):`);
      
      const commonPaths = [
        '/',
        '/electronics',
        '/clothing/subcategory-1',
        '/books/subcategory-5/product-3',
        '/home/subcategory-10/product-7'
      ];
      
      const iterations = 2000;
      
      // Test original
      const originalStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        const path = commonPaths[i % commonPaths.length];
        matchRoutes(routes, path);
      }
      const originalTime = performance.now() - originalStart;
      
      // Test optimized
      const optimizedStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        const path = commonPaths[i % commonPaths.length];
        matchStaticRoutes(routes, path);
      }
      const optimizedTime = performance.now() - optimizedStart;
      
      const improvement = ((originalTime - optimizedTime) / originalTime * 100);
      
      console.log(`   Original:     ${originalTime.toFixed(2)}ms`);
      console.log(`   Optimized:    ${optimizedTime.toFixed(2)}ms`);
      console.log(`   Improvement:  ${improvement.toFixed(1)}%`);
      
      expect(improvement).toBeGreaterThan(50);
    });

    test('documentation site simulation', () => {
      const routes: IRouteBaseObject[] = [
        { path: '/', component: 'DocsHome' },
        { path: '/getting-started', component: 'GettingStarted' },
        { path: '/installation', component: 'Installation' }
      ];
      
      // Add API documentation
      const apiSections = ['authentication', 'users', 'posts', 'comments', 'files'];
      apiSections.forEach(section => {
        routes.push({ path: `/api/${section}`, component: `${section}Api` });
        
        // Add methods
        const methods = ['get', 'post', 'put', 'delete'];
        methods.forEach(method => {
          routes.push({ path: `/api/${section}/${method}`, component: `${section}${method}` });
        });
      });
      
      // Add guides
      for (let i = 1; i <= 100; i++) {
        routes.push({ path: `/guides/guide-${i}`, component: `Guide${i}` });
      }
      
      // Add examples
      for (let i = 1; i <= 50; i++) {
        routes.push({ path: `/examples/example-${i}`, component: `Example${i}` });
      }
      
      console.log(`\n📚 Documentation Site Simulation (${routes.length} routes):`);
      
      const docPaths = [
        '/',
        '/getting-started',
        '/api/users',
        '/api/posts/get',
        '/guides/guide-25',
        '/examples/example-10'
      ];
      
      const iterations = 1500;
      
      // Performance test
      const originalStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        matchRoutes(routes, docPaths[i % docPaths.length]);
      }
      const originalTime = performance.now() - originalStart;
      
      const optimizedStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        matchStaticRoutes(routes, docPaths[i % docPaths.length]);
      }
      const optimizedTime = performance.now() - optimizedStart;
      
      const improvement = ((originalTime - optimizedTime) / originalTime * 100);
      
      console.log(`   Original:     ${originalTime.toFixed(2)}ms`);
      console.log(`   Optimized:    ${optimizedTime.toFixed(2)}ms`);
      console.log(`   Improvement:  ${improvement.toFixed(1)}%`);
      
      expect(improvement).toBeGreaterThan(60);
    });
  });
});