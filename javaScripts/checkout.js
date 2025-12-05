// ===== Recommendation arrows =====
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

// ===== Checkout rendering =====
document.addEventListener('DOMContentLoaded', () => {
  /* plugged in the checkout rendering calculation into a function 
  called calculateTotalsFromSavedDate() */
  function calculateTotalsFromSavedData() {
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

  // New payment-category buckets
  let playerPackTotal = 0;
  let discTotal = 0;
  let customMerchTotal = 0;
  let eventSuppliesTotal = 0;

  let grandTotal = 0;
  let totalItemsCount = 0;

  // Build cart UI
  for (const [name, data] of Object.entries(items)) {
    // quantity and prices
    const quantityVal = Number(data.quantity ?? data.qty ?? 0);
    const unitPrice = Number(data.unitPrice ?? data.price ?? 0);

    // line total: prefer totalPrice / total, fall back to qty * unit
    const lineTotal =
      data.totalPrice != null
        ? Number(data.totalPrice)
        : data.total != null
        ? Number(data.total)
        : quantityVal * unitPrice;

    // categories
    const storefrontCategory = data.storefrontCategory || data.category || 'Event Supplies';
    const paymentCategory = data.paymentCategory || 'event-supplies';

    // accumulate global totals
    grandTotal += lineTotal;
    totalItemsCount += quantityVal;

    // accumulate by payment category
    switch (paymentCategory) {
      case 'player-pack':
        playerPackTotal += lineTotal;
        break;
      case 'disc':
        discTotal += lineTotal;
        break;
      case 'custom-merch':
        customMerchTotal += lineTotal;
        break;
      default:
        // anything else goes into event supplies
        eventSuppliesTotal += lineTotal;
        break;
    }
  }

    // --- build DOM card ---
    const itemInCart = document.createElement('div');
    itemInCart.classList.add('items-in-cart');

    const cartItem = document.createElement('div');
    cartItem.classList.add('cart-item');

    const img = document.createElement('img');
    img.classList.add('item-image');
    // If you later store image URLs in checkoutList, use them:
    if (data.imageUrl) {
      img.src = data.imageUrl;
    }
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
    // Show storefront category + billing bucket
    const billingLabelMap = {
      'player-pack': 'Player Packs',
      disc: 'Discs',
      'custom-merch': 'Custom Merchandise',
      'event-supplies': 'Event Supplies',
    };
    const billingLabel = billingLabelMap[paymentCategory] || 'Event Supplies';
    itemDetails.textContent = `${storefrontCategory} — ${billingLabel}`;
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
  // try to implement ids from checkoutpage.html and loop it with this function

  function updateorderSummary() {
    const totals = calculateTotalsFromSavedData();

    const playerPackTotal = totals.playerPackTotal;
    const discTotal = totals.discTotal;
    const customMerchTotal = totals.customMerchTotal;
    const eventSuppliesTotal = totals.eventSuppliesTotal;
    const grandTotal = totals.grandTotal;
    const totalItemsCount = totals.totalItemsCount;

    const summaryLines = [
      {id : 'playerPackLine', text: `Player Packs $${playerPackTotal.toFixed(2)}`},
      {id : 'discLine', text: `Discs $${discTotal.toFixed(2)}`},
      {id : 'customMerchLine', text: `Custom Merchandise $${customMerchTotal.toFixed(2)}`},
      {id : 'eventSuppliesLine', text: `Event Supplies $${eventSuppliesTotal.toFixed(2)}`},
      {id : 'subtotalLine', text: `Subtotal $${grandTotal.toFixed(2)} (${totalItemsCount} items)`},
      {id : 'totalLine', text: `Total $${grandTotal.toFixed(2)}`},  
    ];
    // Logic to find prodcuts in the summaryLine Array and preform action.
    for (let i =0; i < summaryLines.length; i++) {
      const line = summaryLines[i];
      const element = document.getElementById(line.id);
      if(element) {
        element.textContent = line.text;
      }
    }
    
    // disables the buy button if chart is emtpy.
    const buyButton = document.getElementById('buy-button');
    if (buyButton) {
      buyButton.disabled = totalItemsCount === 0;
    }
  }


 /* const playerPackLine = document.getElementById('playerPackLine');
  const discLine = document.getElementById('discLine');
  const customMerchLine = document.getElementById('customMerchLine');
  const eventSuppliesLine = document.getElementById('eventSuppliesLine');
  const subtotalLine = document.getElementById('subtotalLine');
  const totalLine = document.getElementById('totalLine');

  if (playerPackLine) {
    playerPackLine.textContent = `Player Packs  $${playerPackTotal.toFixed(2)}`;
  }
  if (discLine) {
    discLine.textContent = `Discs  $${discTotal.toFixed(2)}`;
  }
  if (customMerchLine) {
    customMerchLine.textContent = `Custom Merchandise  $${customMerchTotal.toFixed(2)}`;
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
}); */
