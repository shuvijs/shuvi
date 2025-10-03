import {
  IRouteMatch,
  IParams,
  PartialLocation
} from './types';
import { joinPaths, normalizeBase, resolvePath, stripBase } from './utils';
import { IRouteBaseObject } from './matchRoutes';

/**
 * Static Route Optimizer
 * Designed specifically for 300+ static routes scenario, does not handle dynamic routes
 */

// Static route node
interface StaticRouteNode<T extends IRouteBaseObject> {
  // Mapping from complete path to routes
  exactRoutes: Map<string, T[]>;
  // Mapping from path segment to child nodes
  children: Map<string, StaticRouteNode<T>>;
  // Routes at current node (for nested routes)
  routes: T[];
}

// Precompiled route match result
interface PrecompiledMatch<T extends IRouteBaseObject> {
  matches: IRouteMatch<T>[];
  pathname: string;
  params: IParams;
}

/**
 * Static Route Matcher Class
 */
class StaticRouteMatcher<T extends IRouteBaseObject> {
  private exactMatchMap = new Map<string, PrecompiledMatch<T>>();
  private prefixTree: StaticRouteNode<T>;
  private allRoutes: T[];

  constructor(routes: T[]) {
    this.allRoutes = routes;
    this.prefixTree = this.buildPrefixTree(routes);
    this.precompileMatches();
  }

  /**
   * Build prefix tree
   */
  private buildPrefixTree(routes: T[]): StaticRouteNode<T> {
    const root: StaticRouteNode<T> = {
      exactRoutes: new Map(),
      children: new Map(),
      routes: []
    };

    // Flatten all routes
    const flatRoutes = this.flattenRoutes(routes);

    for (const { path, routeChain } of flatRoutes) {
      // Only process static routes
      if (this.isStaticPath(path)) {
        this.insertIntoTree(root, path, routeChain);
      }
    }

    return root;
  }

  /**
   * Flatten route structure
   */
  private flattenRoutes(
    routes: T[],
    parentPath = '',
    parentRoutes: T[] = []
  ): Array<{ path: string; routeChain: T[] }> {
    const result: Array<{ path: string; routeChain: T[] }> = [];

    routes.forEach(route => {
      let fullPath;
      if (route.path === '') {
        fullPath = parentPath;
      } else {
        fullPath = joinPaths([parentPath, route.path]);
      }

      const routeChain = [...parentRoutes, route];
      result.push({ path: fullPath, routeChain });

      // Recursively process child routes
      if (route.children) {
        result.push(...this.flattenRoutes(route.children as T[], fullPath, routeChain));
      }
    });

    return result;
  }

  /**
   * Check if path is static
   */
  private isStaticPath(path: string): boolean {
    return !path.includes(':') && !path.includes('*') && !path.includes('(');
  }

  /**
   * Insert route into prefix tree
   */
  private insertIntoTree(node: StaticRouteNode<T>, path: string, routes: T[]): void {
    // Store exact match
    node.exactRoutes.set(path, routes);

    // Build prefix tree for prefix matching
    const segments = path.split('/').filter(Boolean);
    let currentNode = node;

    for (const segment of segments) {
      if (!currentNode.children.has(segment)) {
        currentNode.children.set(segment, {
          exactRoutes: new Map(),
          children: new Map(),
          routes: []
        });
      }
      currentNode = currentNode.children.get(segment)!;
    }

    // Store routes at leaf node
    currentNode.routes = routes;
  }

  /**
   * Precompile all possible match results
   */
  private precompileMatches(): void {
    for (const [path, routeChain] of this.prefixTree.exactRoutes) {
      const matches = this.buildMatches(routeChain, path);
      this.exactMatchMap.set(path, {
        matches,
        pathname: path,
        params: {} // Static routes have no parameters
      });
    }
  }

  /**
   * Build match results
   */
  private buildMatches(routeChain: T[], matchedPathname: string): IRouteMatch<T>[] {
    const matches: IRouteMatch<T>[] = [];
    let currentPath = '';

    for (let i = 0; i < routeChain.length; i++) {
      const route = routeChain[i];
      
      if (route.path === '') {
        // Empty path keeps current path
      } else {
        currentPath = joinPaths([currentPath, route.path]);
      }

      // For the last route, use the actual matched pathname
      const pathname = i === routeChain.length - 1 ? matchedPathname : (currentPath || '/');

      matches.push({
        route,
        pathname,
        params: Object.freeze({}) // Static routes have no parameters
      });
    }

    return matches;
  }

  /**
   * Match pathname
   */
  match(pathname: string): PrecompiledMatch<T> | null {
    // 1. Exact match (O(1))
    const exactMatch = this.exactMatchMap.get(pathname);
    if (exactMatch) {
      return exactMatch;
    }

    // 2. Prefix match (for handling trailing slash etc.)
    return this.findPrefixMatch(pathname);
  }

  /**
   * Find prefix match
   */
  private findPrefixMatch(pathname: string): PrecompiledMatch<T> | null {
    // Try adding/removing trailing slash
    const alternatives = [
      pathname,
      pathname === '/' ? pathname : pathname.replace(/\/$/, ''),
      pathname.endsWith('/') ? pathname : pathname + '/'
    ];

    for (const alt of alternatives) {
      const match = this.exactMatchMap.get(alt);
      if (match) {
        return match;
      }
    }

    return null;
  }

  /**
   * Get all static route paths (for debugging)
   */
  getAllStaticPaths(): string[] {
    return Array.from(this.exactMatchMap.keys()).sort();
  }

  /**
   * Get matching statistics
   */
  getStats() {
    return {
      totalStaticRoutes: this.exactMatchMap.size,
      totalRoutes: this.allRoutes.length,
      staticRatio: (this.exactMatchMap.size / this.allRoutes.length * 100).toFixed(1) + '%'
    };
  }
}

// Global matcher cache
const staticMatcherCache = new WeakMap<any[], StaticRouteMatcher<any>>();

/**
 * Static Route Matching Function
 * 
 * Optimization features:
 * 1. O(1) exact match - direct HashMap lookup
 * 2. Precompiled results - pre-calculate all match results at startup
 * 3. Zero regex - pure string matching
 * 4. Memory friendly - matcher instance reuse
 * 5. Type safe - full TypeScript support
 * 
 * @param routes Route configuration array
 * @param location Location to match
 * @param basename Base path
 * @returns Match result or null
 */
export function matchStaticRoutes<T extends IRouteBaseObject>(
  routes: T[],
  location: string | PartialLocation,
  basename = ''
): IRouteMatch<T>[] | null {
  // Normalize input
  if (typeof location === 'string') {
    location = resolvePath(location);
  }

  let pathname = location.pathname || '/';
  
  // Handle basename
  if (basename) {
    const normalizedBasename = normalizeBase(basename);
    const pathnameWithoutBase = stripBase(pathname, normalizedBasename);
    if (pathnameWithoutBase) {
      pathname = pathnameWithoutBase;
    } else {
      return null;
    }
  }

  // Get or create matcher
  let matcher = staticMatcherCache.get(routes);
  if (!matcher) {
    matcher = new StaticRouteMatcher(routes);
    staticMatcherCache.set(routes, matcher);
  }

  // Execute matching
  const result = matcher.match(pathname);
  return result ? result.matches : null;
}

