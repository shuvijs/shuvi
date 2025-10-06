// Large data module with extensive data
const largeData = {
  users: Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `User ${i}`,
    email: `user${i}@example.com`,
    profile: {
      avatar: `https://example.com/avatar/${i}.jpg`,
      bio: `This is a long bio for user ${i} with lots of text content`,
      preferences: {
        theme: i % 2 === 0 ? 'dark' : 'light',
        language: ['en', 'es', 'fr'][i % 3],
        notifications: i % 4 === 0
      }
    }
  })),
  products: Array.from({ length: 500 }, (_, i) => ({
    id: i,
    name: `Product ${i}`,
    price: Math.random() * 1000,
    category: ['electronics', 'clothing', 'books', 'home'][i % 4],
    description: `Detailed description for product ${i} with lots of information`
  }))
};

export default largeData;
