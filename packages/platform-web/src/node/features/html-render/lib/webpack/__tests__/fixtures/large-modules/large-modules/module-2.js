// Large module 2
export const data2 = Array.from({ length: 100 }, (_, i) => ({
  id: i + 200,
  value: `value-${i + 200}`,
  metadata: {
    created: new Date().toISOString(),
    tags: [`tag-${i + 200}`, `category-${(i + 200) % 5}`],
    priority: (i + 200) % 10
  }
}));

export default data2;
