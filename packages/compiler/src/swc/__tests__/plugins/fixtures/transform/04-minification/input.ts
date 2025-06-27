// Complex function with multiple variables and operations
function calculateTotal(items: Array<{ price: number; quantity: number }>) {
  let total = 0;
  const taxRate = 0.08;
  const discountRate = 0.1;

  // Calculate subtotal
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
  }

  // Apply discount if total is over 100
  if (total > 100) {
    const discount = total * discountRate;
    total -= discount;
  }

  // Add tax
  const tax = total * taxRate;
  total += tax;

  return Math.round(total * 100) / 100;
}

// Class with methods
class ShoppingCart {
  private items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }> = [];

  addItem(id: string, name: string, price: number, quantity: number = 1) {
    const existingItem = this.items.find(item => item.id === id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ id, name, price, quantity });
    }
  }

  removeItem(id: string) {
    this.items = this.items.filter(item => item.id !== id);
  }

  getTotal() {
    return calculateTotal(this.items);
  }

  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  clear() {
    this.items = [];
  }
}

// Usage example
const cart = new ShoppingCart();
cart.addItem('1', 'Apple', 0.5, 3);
cart.addItem('2', 'Banana', 0.3, 2);
cart.addItem('3', 'Orange', 0.8, 1);

console.log('Total items:', cart.getItemCount());
console.log('Total price:', cart.getTotal());

export { calculateTotal, ShoppingCart };
