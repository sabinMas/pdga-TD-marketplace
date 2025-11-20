// recommendation arrows function
const list = document.getElementById('items');
const output = document.getElementById('cart');

function scrollLeftBtn() {
  if (list) {
    list.scrollBy({ left: -250, behavior: 'smooth' });
  }
}

function scrollRightBtn() {
  if (list) {
    list.scrollBy({ left: 250, behavior: 'smooth' });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('checkoutList');
  if (!saved) {
    console.log('No checkoutList found in sessionStorage');
    return;
  }

  let items;
  try {
    items = JSON.parse(saved) || {};
  } catch (e) {
    console.error('Failed to parse checkoutList:', e);
    return;
  }

  if (!items || typeof items !== 'object' || !Object.keys(items).length) {
    console.log('checkoutList is empty');
    return;
  }

  if (!output) return;

  let playerPackTotal = 0;
  let eventSuppliesTotal = 0;
  let grandTotal = 0;
  let totalItemsCount = 0;

  // Build cart UI
  for (const [name, data] of Object.entries(items)) {
    const quantityVal = Number(data.quantity ?? data.qty ?? 0);
    const unitPrice = Number(
      data.price ??
      data.unitPrice ??
      0
    );
    const category = data.category || 'Event Supplies';
    const lineTotal = data.total != null
      ? Number(data.total)
      : quantityVal * unitPrice;

    // accumulate totals
    grandTotal += lineTotal;
    totalItemsCount += quantityVal;

    if (category === 'Player Packs') {
      playerPackTotal += lineTotal;
    } else {
      eventSuppliesTotal += lineTotal;
    }

    // --- build DOM card ---
    const itemInCart = document.createElement('div');
    itemInCart.classList.add('items-in-cart');

    const cartItem = document.createElement('div');
    cartItem.classList.add('cart-item');

    const img = document.createElement('img');
    img.classList.add('item-image');
    // if you later store image URLs in checkoutList, you can use them here
    img.alt = name;
    cartItem.appendChild(img);

    const itemInfo = document.createElement('div');
    itemInfo.classList.add('cart-item-info');

    const itemName = document.createElement('p');
    itemName.classList.add('cart-item-name');
    itemName.textContent = name;
    itemInfo.appendChild(itemName);

    const itemDetails = document.createElement('p');
    itemDetails.classList.add('cart-item-details');
    itemDetails.textContent = category;
    itemInfo.appendChild(itemDetails);

    cartItem.appendChild(itemInfo);

    const quantity = document.createElement('p');
    quantity.classList.add('cart-item-quantity');
    quantity.textContent = `Quantity: ${quantityVal}`;
    cartItem.appendChild(quantity);

    const price = document.createElement('p');
    price.classList.add('cart-item-price');
    if (unitPrice > 0) {
      price.textContent = `$${unitPrice.toFixed(2)} ea — $${lineTotal.toFixed(2)} total`;
    } else {
      price.textContent = `$${lineTotal.toFixed(2)}`;
    }
    cartItem.appendChild(price);

    itemInCart.appendChild(cartItem);
    output.appendChild(itemInCart);
  }

  // ----- Update order summary under payment section -----
  const playerPackLine   = document.getElementById('playerPackLine');
  const eventSuppliesLine = document.getElementById('eventSuppliesLine');
  const subtotalLine     = document.getElementById('subtotalLine');
  const totalLine        = document.getElementById('totalLine');

  if (playerPackLine) {
    playerPackLine.textContent = `Player Packs  $${playerPackTotal.toFixed(2)}`;
  }
  if (eventSuppliesLine) {
    eventSuppliesLine.textContent = `Event Supplies  $${eventSuppliesTotal.toFixed(2)}`;
  }
  if (subtotalLine) {
    subtotalLine.textContent = `Subtotal  $${grandTotal.toFixed(2)} (${totalItemsCount} items)`;
  }
  if (totalLine) {
    totalLine.textContent = `Total  $${grandTotal.toFixed(2)}`;
  }
});
