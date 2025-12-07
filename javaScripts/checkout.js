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
  //Start of rendering items onto checkout
  const listOutput = document.getElementById('cart');
  if (!listOutput) return;

  // We store the user's list in sessionStorage under 'localList'.  It maps
  // product names to their quantities.
  const saved = sessionStorage.getItem('localList');
  const items = saved ? JSON.parse(saved) : null;

  if (!items || typeof items !== 'object' || !Object.keys(items).length) {
    listOutput.innerHTML = '<p>No items in your list yet.</p>';
    return;
  }
  // Function to add items to their respective paymentCategory
  function addToCategory(listItem, paymentCategory) {
    const buckets = {
      'player-pack': 'cat-playerpacks',
      'event-supplies': 'cat-eventsupplies',
      'custom-merch': 'cat-customitems',
      discs: 'cat-customdiscs',
    };

    const bucketId = buckets[paymentCategory] || 'cat-eventsupplies';
    document.getElementById(bucketId).appendChild(listItem);
  }
  /*
  let playerPackList = document.createElement('ul');
  playerPackList.innerText = "Player packs";

  let discList = document.createElement('ul');
  discList.innerHTML = "Disks"

  let eventSuppliesList = document.createElement('ul');
  eventSuppliesList.innerText = "Event Supplies";

  let extrasList = document.createElement('ul');
  extrasList.innerText = "Extras";
  */
  let itemsAsArray = Object.entries(items);
  console.log('itemsAsArray');
  for (let k = 0; k < itemsAsArray.length; k++) {
    let item = itemsAsArray[k];
    fetch('./catalog.json')
      .then((response) => response.json())
      .then((data) => {
        console.log(item);
        for (var i = 0; i < data.length; i++) {
          //check the names are matching
          var itemName = item[0];
          if (data[i].name == itemName) {
            const listItem = document.createElement('div');
            listItem.classList.add('cart-item');
            //info contains qty and total price
            const itemInfo = document.createElement('div');
            itemInfo.classList.add('cart-item-info');
            const qtyInput = document.createElement('input');
            //add unit price right after input box

            qtyInput.type = 'number';
            qtyInput.value = item[1].quantity;
            qtyInput.min = '1';

            //total for this item at the end

            // start image creation
            const img = document.createElement('img');
            img.classList.add('item-image');

            // If you later store image URLs in checkoutList, use them:
            if (data[i].imageUrl) {
              img.src = data[i].imageUrl;
            }
            img.alt = name;
            listItem.appendChild(img);
            // end image creation

            const infoText = document.createElement('div');
            infoText.classList.add('cart-item-text');
            infoText.textContent = `${itemName} — Qty: `;
            infoText.appendChild(qtyInput);
            listItem.appendChild(infoText);

            /* //split the items into their category 
          if(data[i].paymentCategory == "player-pack") {
            playerPackList.appendChild(listItem);
          } else if(data[i].paymentCategory == "event-supplies") {
            eventSuppliesList.appendChild(listItem);
          } else if (data[i].category == "custom-merch") {
            customMerchList.appendChild(listItem);
          } else {
            discList.appendChild(listItem);
          } */
            // Function to add items to their category list
            addToCategory(listItem, data[i].paymentCategory);
          }
        }
      })
      .catch((error) => console.log(error));
  }
  //listOutput.appendChild(playerPackList);
  //listOutput.appendChild(eventSuppliesList);
  //listOutput.appendChild(extrasList);
  //listOutput.appendChild(discList);

  //end of rendering items onto checkout
  // Trying Something new above, commenting out below for now. 12/6/2023
  /* --- build DOM card ---
  const itemInCart = document.createElement('div');
  itemInCart.classList.add('items-in-cart');

  const cartItem = document.createElement('div');
  cartItem.classList.add('cart-item');
  /*
    // start image creation
  const img = document.createElement('img');
  img.classList.add('item-image');

  // If you later store image URLs in checkoutList, use them:
  if (data.imageUrl) {
    img.src = data.imageUrl;
  }
  img.alt = name;
  cartItem.appendChild(img);
    // end image creation
  
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
  */

  calculateTotalsFromSavedData(saved);
  //updateorderSummary();

  /*

  const playerPackLine = document.getElementById('playerPackLine');
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
  */
  document.querySelectorAll('.cart-category').forEach((section) => {
    const header = section.querySelector('.cart-category-header');
    const items = section.querySelector('.cart-items');
    const toggle = section.querySelector('.toggle-category');

    header.addEventListener('click', () => {
      const isCollapsed = items.classList.toggle('collapsed');
      toggle.textContent = isCollapsed ? '►' : '▼';
    });
  });
});

/* plugged in the checkout rendering calculation into a function 
called calculateTotalsFromSavedDate() */

function calculateTotalsFromSavedData(saved) {
  if (!saved) return;

  let items;
  try {
    items = JSON.parse(saved) || {};
  } catch (e) {
    console.error('Failed to parse saved items in calculateTotalsFromSavedData:', e);
    return;
  }

  const entries = Object.entries(items);
  if (!entries.length) return;

  // Totals per payment category
  let playerPackTotal = 0;
  let discTotal = 0;
  let customMerchTotal = 0;
  let eventSuppliesTotal = 0;

  // Item counts per category
  let playerPackCount = 0;
  let discCount = 0;
  let customMerchCount = 0;
  let eventSuppliesCount = 0;

  let grandTotal = 0;
  let totalItemsCount = 0;

  for (const [name, data] of entries) {
    const quantityVal = Number(data.quantity ?? data.qty ?? 0);
    const unitPrice = Number(data.unitPrice ?? data.price ?? 0);

    const lineTotal =
      data.totalPrice != null
        ? Number(data.totalPrice)
        : data.total != null
        ? Number(data.total)
        : quantityVal * unitPrice;

    const paymentCategory = data.paymentCategory || 'event-supplies';

    grandTotal += lineTotal;
    totalItemsCount += quantityVal;

    switch (paymentCategory) {
      case 'player-pack':
        playerPackTotal += lineTotal;
        playerPackCount += quantityVal;
        break;
      case 'discs': // matches your catalog.json
        discTotal += lineTotal;
        discCount += quantityVal;
        break;
      case 'custom-merch':
        customMerchTotal += lineTotal;
        customMerchCount += quantityVal;
        break;
      default:
        eventSuppliesTotal += lineTotal;
        eventSuppliesCount += quantityVal;
        break;
    }
  }

  // --- Update right-hand order summary lines ---
  const playerPackLine = document.getElementById('playerPackLine');
  const discLine = document.getElementById('discLine');
  const customMerchLine = document.getElementById('customMerchLine');
  const eventSuppliesLine = document.getElementById('eventSuppliesLine');
  const subtotalLine = document.getElementById('subtotalLine');
  const totalLine = document.getElementById('totalLine');

  if (playerPackLine) {
    playerPackLine.textContent = `Player Packs $${playerPackTotal.toFixed(2)}`;
  }
  if (discLine) {
    discLine.textContent = `Discs $${discTotal.toFixed(2)}`;
  }
  if (customMerchLine) {
    customMerchLine.textContent = `Custom Merchandise $${customMerchTotal.toFixed(2)}`;
  }
  if (eventSuppliesLine) {
    eventSuppliesLine.textContent = `Event Supplies $${eventSuppliesTotal.toFixed(2)}`;
  }
  if (subtotalLine) {
    subtotalLine.textContent = `Subtotal $${grandTotal.toFixed(2)} (${totalItemsCount} items)`;
  }
  if (totalLine) {
    totalLine.textContent = `Total $${grandTotal.toFixed(2)}`;
  }

  // --- Update header summaries on each collapsible category ---
  const countPlayer = document.getElementById('count-playerpacks');
  const totalPlayer = document.getElementById('total-playerpacks');
  if (countPlayer)
    countPlayer.textContent = `${playerPackCount} item${playerPackCount === 1 ? '' : 's'}`;
  if (totalPlayer) totalPlayer.textContent = `$${playerPackTotal.toFixed(2)}`;

  const countEvent = document.getElementById('count-eventsupplies');
  const totalEvent = document.getElementById('total-eventsupplies');
  if (countEvent)
    countEvent.textContent = `${eventSuppliesCount} item${eventSuppliesCount === 1 ? '' : 's'}`;
  if (totalEvent) totalEvent.textContent = `$${eventSuppliesTotal.toFixed(2)}`;

  const countCustomItems = document.getElementById('count-customitems');
  const totalCustomItems = document.getElementById('total-customitems');
  if (countCustomItems)
    countCustomItems.textContent = `${customMerchCount} item${customMerchCount === 1 ? '' : 's'}`;
  if (totalCustomItems) totalCustomItems.textContent = `$${customMerchTotal.toFixed(2)}`;

  const countDiscs = document.getElementById('count-customdiscs');
  const totalDiscs = document.getElementById('total-customdiscs');
  if (countDiscs) countDiscs.textContent = `${discCount} item${discCount === 1 ? '' : 's'}`;
  if (totalDiscs) totalDiscs.textContent = `$${discTotal.toFixed(2)}`;

  // --- Enable/disable checkout button ---
  const buyButton = document.getElementById('buy-button');
  if (buyButton) {
    buyButton.disabled = totalItemsCount === 0;
  }
}

// ----- Update order summary under payment section -----
// add prices to show up in the chart
//
function updateorderSummary() {
  console.log('inside update order');
  const totals = calculateTotalsFromSavedData();

  const playerPackTotal = totals.playerPackTotal;
  const discTotal = totals.discTotal;
  const customMerchTotal = totals.customMerchTotal;
  const eventSuppliesTotal = totals.eventSuppliesTotal;
  const grandTotal = totals.grandTotal;
  const totalItemsCount = totals.totalItemsCount;

  const summaryLines = [
    { id: 'playerPackLine', text: `Player Packs $${playerPackTotal.toFixed(2)}` },
    { id: 'discLine', text: `Discs $${discTotal.toFixed(2)}` },
    { id: 'customMerchLine', text: `Custom Merchandise $${customMerchTotal.toFixed(2)}` },
    { id: 'eventSuppliesLine', text: `Event Supplies $${eventSuppliesTotal.toFixed(2)}` },
    { id: 'subtotalLine', text: `Subtotal $${grandTotal.toFixed(2)} (${totalItemsCount} items)` },
    { id: 'totalLine', text: `Total $${grandTotal.toFixed(2)}` },
  ];
  // Logic to find prodcuts in the summaryLine Array and preform action.
  for (let i = 0; i < summaryLines.length; i++) {
    const line = summaryLines[i];
    const element = document.getElementById(line.id);
    if (element) {
      element.textContent = line.text;
    }
  }

  // disables the buy button if chart is emtpy.
  const buyButton = document.getElementById('buy-button');
  if (buyButton) {
    buyButton.disabled = totalItemsCount === 0;
  }
}
