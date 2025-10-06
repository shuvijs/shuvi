// Large module 0
export const data0 = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  value: `value-${i}`,
  metadata: {
    created: new Date().toISOString(),
    tags: [`tag-${i}`, `category-${i % 5}`],
    priority: i % 10
  }
}));

export default data0;
