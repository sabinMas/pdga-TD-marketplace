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
            
            // added event listener for product qty input
            qtyInput.addEventListener('input', function() {
              // safe checks for nulls or less than 1 values.
              let newQty = parseInt(qtyInput.value);
              if(isNaN(newQty) || newQty < 1) {
                newQty = 1;
                qtyInput.value = newQty
              }

              const savedKey = 'localList';
              // converts JSON string into useable data and stored in items
              let items = JSON.parse(sessionStorage.getItem(savedKey));
              const currentItemName = item[0];

              if (items && items [currentItemName]) {
                items[currentItemName].quantity = newQty;
              }
              const updatedSaved = JSON.stringify(items);
              sessionStorage.setItem(savedKey, updatedSaved);

              calculateTotalsFromSavedData(updatedSaved);
            });
              

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

            // Function to add items to their category list
            addToCategory(listItem, data[i].paymentCategory);
          }
        }
      })
      .catch((error) => console.log(error));
  }
  calculateTotalsFromSavedData(saved);

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

/*
*Function Calculate the total of each payment category in the users cart
*@Param: String saved, a object string of the users cart
*/
function calculateTotalsFromSavedData(saved) {
  console.log('inside calculate total')
  console.log(typeof(saved));
  console.log(saved);
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

    const lineTotal = quantityVal * unitPrice;

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
  
  //truthy statements to add text content to summary line of each payment category
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
} // end of calculateTotalsFromSavedData
