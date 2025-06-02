// script.js

// Load cart from localStorage or initialize as empty
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(productId, productName, productPrice) {
  const existingProduct = cart.find(item => item.id === productId);
  if (existingProduct) {
    existingProduct.quantity++;
  } else {
    cart.push({ id: productId, name: productName, price: productPrice, quantity: 1 });
  }

  saveCart();
  showToast(`${productName} added to cart.`);
  updateCartDisplay();
}

function removeFromCart(productId) {
  const index = cart.findIndex(item => item.id === productId);
  if (index !== -1) {
    cart.splice(index, 1);
    saveCart();
    updateCartDisplay();
  }
}

function changeQuantity(productId, delta) {
  const item = cart.find(p => p.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    saveCart();
    updateCartDisplay();
  }
}

function updateCartDisplay() {
  const cartContainer = document.getElementById('cart-items');
  const totalPriceEl = document.getElementById('total-price');

  if (!cartContainer || !totalPriceEl) return;

  cartContainer.innerHTML = '';
  let total = 0;

  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <span>${item.name}</span>
      <div class="quantity-controls">
        <button onclick="changeQuantity('${item.id}', -1)">−</button>
        <span>${item.quantity}</span>
        <button onclick="changeQuantity('${item.id}', 1)">+</button>
      </div>
      <span>$${(item.price * item.quantity).toFixed(2)}</span>
      <button class="remove-item" onclick="removeFromCart('${item.id}')">Remove</button>
    `;
    cartContainer.appendChild(div);
    total += item.price * item.quantity;
  });

  totalPriceEl.textContent = `$${total.toFixed(2)}`;
}

// Toast message
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Handle checkout form submission
function handleCheckoutSubmit(event) {
  event.preventDefault();

  // Save the current cart to sessionStorage
  sessionStorage.setItem('orderSummary', JSON.stringify(cart));

  // Clear cart
  cart = [];
  saveCart();
  updateCartDisplay();

  // Redirect to confirmation page
  window.location.href = 'confirmation.html';
}

// Populate order summary on confirmation page
function populateOrderSummary() {
  const container = document.getElementById('order-summary');
  if (!container) return;

  const order = JSON.parse(sessionStorage.getItem('orderSummary') || '[]');
  if (order.length === 0) {
    container.innerHTML = "<p>No items found in your order.</p>";
    return;
  }

  let total = 0;
  order.forEach(item => {
    const div = document.createElement('div');
    div.className = 'summary-item';
    div.innerHTML = `
      <p><strong>${item.name}</strong> x ${item.quantity} — $${(item.price * item.quantity).toFixed(2)}</p>
    `;
    container.appendChild(div);
    total += item.price * item.quantity;
  });

  const totalDiv = document.createElement('div');
  totalDiv.className = 'summary-total';
  totalDiv.innerHTML = `<p><strong>Total:</strong> $${total.toFixed(2)}</p>`;
  container.appendChild(totalDiv);
}

// DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  // Attach checkout form listener
  const checkoutForm = document.querySelector('.checkout form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  }

  // Update cart display
  updateCartDisplay();

  // Show order summary if on confirmation page
  populateOrderSummary();
});