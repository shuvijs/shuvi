// Large module 1
export const data1 = Array.from({ length: 100 }, (_, i) => ({
  id: i + 100,
  value: `value-${i + 100}`,
  metadata: {
    created: new Date().toISOString(),
    tags: [`tag-${i + 100}`, `category-${(i + 100) % 5}`],
    priority: (i + 100) % 10
  }
}));

export default data1;
