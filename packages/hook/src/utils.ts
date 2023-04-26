import { IPluginInstance } from './types';

export const sortPluginsByRelationShip = <
  T extends IPluginInstance<any, any>[]
>(
  input: T
): T => {
  const plugins = new Map<string, IPluginInstance<any, any>>();
  /**
   * the key is the end point of the edge
   * In this way, we can easily find the plugin with zero in-degree
   */
  const edges = new Map<string, Set<string>>();

  const addEdge = (start: string, end: string) => {
    if (!edges.has(end)) {
      edges.set(end, new Set());
    }
    edges.get(end)!.add(start);
  };

  // Firstly, set plugins into map
  input.forEach(plugin => {
    plugins.set(plugin.name, plugin);
  });

  input.forEach(plugin => {
    if (!edges.has(plugin.name)) {
      edges.set(plugin.name, new Set());
    }
    if (plugin.before) {
      plugin.before.forEach(name => {
        // If the plugin is not in the input, we will ignore it
        if (plugins.has(name)) {
          addEdge(plugin.name, name);
        }
      });
    }

    if (plugin.after) {
      plugin.after.forEach(name => {
        // If the plugin is not in the input, we will ignore it
        if (plugins.has(name)) {
          addEdge(name, plugin.name);
        }
      });
    }
  });

  const sorted: T = [] as unknown as T;

  while (edges.size > 0) {
    let hasZeroInDegree = false;
    edges.forEach((value, key) => {
      if (value.size === 0) {
        hasZeroInDegree = true;
        sorted.push(plugins.get(key)!);
        edges.delete(key);
        edges.forEach(v => {
          v.delete(key);
        });
      }
    });

    if (!hasZeroInDegree) {
      throw new Error(
        `Plugin circular dependency detected: ${Array.from(edges.keys()).join(
          ', '
        )}. Please ensure the plugins have correct 'before' and 'after' property.`
      );
    }
  }

  return sorted;
};

export const sortPlugins = <T extends IPluginInstance<any, any>[]>(
  input: T
): T => {
  const groupMap = new Map<number, T>();

  input.forEach(plugin => {
    if (!groupMap.has(plugin.group)) {
      groupMap.set(plugin.group, [] as unknown as T);
    }
    groupMap.get(plugin.group)!.push(plugin);
  });

  const groupNumbers = Array.from(groupMap.keys());
  const sortedGroupNumbers = groupNumbers.sort((a, b) => a - b);
  const sorted: T = [] as unknown as T;
  sortedGroupNumbers.forEach(groupNumber => {
    sorted.push(...sortPluginsByRelationShip(groupMap.get(groupNumber)!));
  });
  return sorted;
};

export const checkPlugins = (plugins: IPluginInstance<any, any>[]) => {
  for (const current of plugins) {
    if (current.conflict) {
      for (const conflict of current.conflict) {
        for (const plugin of plugins) {
          if (conflict === plugin.name) {
            throw new Error(
              `Plugin conflict detected: ${current.name} has conflict with ${plugin.name}.`
            );
          }
        }
      }
    }
    if (current.required) {
      for (const required of current.required) {
        if (!plugins.some(plugin => plugin.name === required)) {
          throw new Error(
            `Plugin missing detected: ${required} is required by ${current.name}.`
          );
        }
      }
    }
  }
};
