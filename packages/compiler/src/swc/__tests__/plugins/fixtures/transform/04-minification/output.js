function a(a) {
  let b = 0,
    c = 0.08,
    d = 0.1;
  for (let e = 0; e < a.length; e++) {
    let f = a[e],
      g = f.price * f.quantity;
    b += g;
  }
  if (b > 100) {
    let h = b * d;
    b -= h;
  }
  let i = b * c;
  return Math.round(100 * (b += i)) / 100;
}
class b {
  addItem(a, b, c, d = 1) {
    let e = this.items.find(b => b.id === a);
    e
      ? (e.quantity += d)
      : this.items.push({ id: a, name: b, price: c, quantity: d });
  }
  removeItem(a) {
    this.items = this.items.filter(b => b.id !== a);
  }
  getTotal() {
    return a(this.items);
  }
  getItemCount() {
    return this.items.reduce((a, b) => a + b.quantity, 0);
  }
  clear() {
    this.items = [];
  }
  constructor() {
    this.items = [];
  }
}
let c = new b();
c.addItem('1', 'Apple', 0.5, 3),
  c.addItem('2', 'Banana', 0.3, 2),
  c.addItem('3', 'Orange', 0.8, 1),
  console.log('Total items:', c.getItemCount()),
  console.log('Total price:', c.getTotal());
export { a as calculateTotal, b as ShoppingCart };
