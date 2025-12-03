// ===== Cart bootstrap =====
// We support storing each list entry as an object with quantity, unitPrice and category.
// When first loading the page we attempt to rebuild this structure from sessionStorage.
// try {
//  sessionStorage.removeItem('localList');
// } catch {}
let list = {};
try {
  const saved = sessionStorage.getItem('localList');
  if (saved) {
    list = JSON.parse(saved);
  }
} catch {}
const cartCount = document.getElementById('cartCount');
function updateCartCountFromList() {
  if (!cartCount) return;
  const total = Object.values(list).reduce((a, b) => {
    // b may be a number (legacy) or an object with a quantity property
    if (typeof b === 'object' && b !== null && b.quantity !== undefined) {
      return a + Number(b.quantity || 0);
    }
    return a + Number(b || 0);
  }, 0);
  cartCount.textContent = total;
}
updateCartCountFromList();

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('q');
  const searchForm = document.querySelector('form[role="search"]');
  const saved = JSON.parse(localStorage.getItem('pdga_user') || 'null');
  const userInfo = document.getElementById('userInfo');
  const guestInfo = document.getElementById('guestInfo');

  //-- load catalog to map names to IDs
  // Fetch loop that allows the Catalog to be read in asynchronously
  fetch('catalog.json')
    .then((res) => res.json())
    .then((catalog) => {
      document.querySelectorAll('article.product-card').forEach((card) => {
        const nameE1 = card.querySelector(
          '.flip-front h3, h3.product-name, .product-details h3, h3'
        );
        if (!nameE1) return;
        const name = (nameE1.textContent || '').trim();
        const item = catalog.find((i) => i.name === name);
        if (!item) return;
        if (item.id) card.dataset.id = item.id;
        if (item.category) {
          card.dataset.category = item.category;
        }
        if (item.paymentCategory) {
          card.dataset.paymentCategory = item.paymentCategory;
        }
        if (item.section) card.dataset.section = item.section;
        if (item.season) card.dataset.season = item.season;
        const priceEl = card.querySelector('.price');
        if (priceEl && item.price) {
          priceEl.textContent = item.price;
        }
      });
      document.querySelectorAll('article.product-card').forEach((card) => {
        updateCardPrice(card);
      });
    })
    .catch((err) => {
      console.error('Error loading catalog.json:', err);
    });

  // --- sign-in UI ---
  if (saved && saved.username) {
    userInfo && (userInfo.hidden = false);
    const nameEl = document.getElementById('userName');
    const tierEl = document.getElementById('userTier');
    if (nameEl) nameEl.textContent = saved.name || saved.username;
    if (tierEl) tierEl.textContent = saved.tier || '';
    document.getElementById('logoutInline')?.addEventListener('click', () => {
      localStorage.removeItem('pdga_user');
      location.reload();
    });
  } else {
    guestInfo && (guestInfo.hidden = false);
  }

  // --- search ---
  function filterProducts() {
    const q = (searchInput?.value || '').toLowerCase();
    document.querySelectorAll('.product-grid article.product-card').forEach((card) => {
      const title = (
        card.querySelector('.flip-front h3, h3.product-name, .product-details h3, h3')
          ?.textContent || ''
      ).toLowerCase();
      card.style.display = title.includes(q) ? '' : 'none';
    });
  }
  if (searchForm) searchForm.addEventListener('input', (e) => e.preventDefault());
  if (searchInput) searchInput.addEventListener('keyup', filterProducts);

  // --- add to list (works from front/back) ---
  function getCardName(card) {
    return (
      card.querySelector(
        '.flip-front .product-details h3, .flip-front h3, h3.product-name, .product-details h3, h3'
      )?.textContent || 'Unnamed Item'
    ).trim();
  }
  document.querySelectorAll('.addToList').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('article.product-card');
      if (!card) return;

      const name = getCardName(card);

      const qtyInput = card.querySelector('.flip-back input[type="number"]');
      const qty = qtyInput ? Number(qtyInput.value || 1) : 1;

      const currentTotal = parseFloat(card.dataset.currentPrice || '0');
      const unitPrice = qty > 0 ? currentTotal / qty : currentTotal;

      // storefront vs payment category
      const storefrontCategory = card.dataset.category || 'event-supplies';
      const paymentCategory = card.dataset.paymentCategory || storefrontCategory;

      if (list[name] && typeof list[name] === 'object') {
        list[name].quantity += qty;
        list[name].totalPrice += currentTotal;
      } else {
        list[name] = {
          quantity: qty,
          unitPrice: unitPrice,
          totalPrice: currentTotal,
          storefrontCategory,
          paymentCategory,
        };
      }

      try {
        sessionStorage.setItem('localList', JSON.stringify(list));
      } catch {}
      updateCartCountFromList();
    });
  });

  // --- flip sizing and handlers ---
  function sizeFlipCards() {
    document.querySelectorAll('.flip-card .flip-inner').forEach((inner) => {
      const f = inner.querySelector('.flip-front');
      const b = inner.querySelector('.flip-back');
      if (!f || !b) return;
      inner.style.minHeight = '0px';
      inner.style.minHeight = Math.max(f.scrollHeight, b.scrollHeight, 440) + 'px';
    });
  }
  window.addEventListener('load', sizeFlipCards);
  window.addEventListener('resize', sizeFlipCards);

  document.querySelectorAll('.flip-card').forEach((card) => {
    card.querySelector('.show-details')?.addEventListener('click', (e) => {
      e.stopPropagation();
      card.classList.add('flipped');
      sizeFlipCards();
    });
    card.querySelector('.close-details')?.addEventListener('click', (e) => {
      e.stopPropagation();
      card.classList.remove('flipped');
      sizeFlipCards();
    });
  });

  // re-measure after images load
  document.querySelectorAll('.flip-card .product-image img').forEach((img) => {
    if (!img.complete) {
      img.addEventListener('load', sizeFlipCards, { once: true });
    }
  });

  // initial measure (covers already-cached images)
  sizeFlipCards();

  function parsePriceRange(text) {
    const nums = (text || '')
      .replace(/[^\d\.–-]/g, '')
      .split(/[–-]/)
      .filter(Boolean)
      .map(Number);
    if (nums.length === 0) return { min: 0, max: 0 };
    if (nums.length === 1) return { min: nums[0], max: nums[0] };
    return { min: Math.min(nums[0], nums[1]), max: Math.max(nums[0], nums[1]) };
  }

  // Convert colour selects into checkboxes for multi-select
  document.querySelectorAll('.flip-back label').forEach((label) => {
    const text = label.textContent || '';
    if (/color:/i.test(text) && label.querySelector('select')) {
      const select = label.querySelector('select');
      const options = Array.from(select.options).map((opt) => opt.textContent.trim());
      const wrapper = document.createElement('div');
      wrapper.className = 'color-options';
      options.forEach((optText) => {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = optText;
        cb.checked = false;
        const cbLabel = document.createElement('label');
        cbLabel.style.display = 'block';
        cbLabel.append(cb, ' ', optText);
        wrapper.appendChild(cbLabel);
      });
      // Insert the checkboxes before the existing label and remove the select
      label.parentNode.insertBefore(wrapper, label);
      label.remove();
    }
  });

  function updateCardPrice(card) {
    if (!card) return;
    const priceEl = card.querySelector('.flip-front .price');
    if (!priceEl) return;
    const priceText = priceEl.textContent || '';
    const { min: minPrice, max: maxPrice } = parsePriceRange(priceText);
    const checkboxes = card.querySelectorAll('.flip-back input[type="checkbox"]');
    let totalOptions = checkboxes.length;
    let selectedCount = 0;
    checkboxes.forEach((cb) => {
      if (cb.checked) selectedCount++;
    });
    // When there are no checkbox options, treat the entire product as one option
    if (totalOptions === 0) {
      totalOptions = 1;
      selectedCount = 1;
    }
    // Determine minimum selections from data attribute (default 0 for non-player packs)
    const minSelections = parseInt(card.dataset.minSelections || '0', 10);
    let perUnitPrice;
    // If user has selected fewer than the minimum required, show a message instead of price
    const qtyInput = card.querySelector('.flip-back input[type="number"]');
    let qty = 1;
    if (qtyInput) {
      qty = Number(qtyInput.value) || 1;
    }
    if (selectedCount < minSelections) {
      // Create or update display element
      let display = card.querySelector('.flip-back .current-price');
      if (!display) {
        display = document.createElement('p');
        display.className = 'current-price';
        display.style.fontWeight = 'bold';
        const backPanel = card.querySelector('.flip-back');
        const heading = backPanel.querySelector('h3');
        if (heading) {
          heading.insertAdjacentElement('afterend', display);
        } else {
          backPanel.insertBefore(display, backPanel.firstChild);
        }
      }
      display.textContent = `Select at least ${minSelections} item${
        minSelections > 1 ? 's' : ''
      } to build your player pack.`;
      // Set the currentPrice to the minimum price times quantity as a fallback
      card.dataset.currentPrice = String(minPrice * qty);
      // disable the addToList button to prevent adding incomplete packs
      const addBtn = card.querySelector('.addToList');
      if (addBtn) addBtn.disabled = true;
      return;
    }
    // Re-enable add button if previously disabled
    const addBtn = card.querySelector('.addToList');
    if (addBtn) addBtn.disabled = false;
    if (maxPrice > minPrice) {
      const fraction = selectedCount / totalOptions;
      perUnitPrice = minPrice + (maxPrice - minPrice) * fraction;
    } else {
      // Single price: scale by number of selected options to allow multiple colours.
      perUnitPrice = minPrice * selectedCount;
    }
    const totalPrice = perUnitPrice * qty;
    // Save the current total price on the card for use when adding to the list
    card.dataset.currentPrice = String(totalPrice);
    // Find or create a display element in the flip-back to show the price
    let display = card.querySelector('.flip-back .current-price');
    if (!display) {
      display = document.createElement('p');
      display.className = 'current-price';
      display.style.fontWeight = 'bold';
      const backPanel = card.querySelector('.flip-back');
      const heading = backPanel.querySelector('h3');
      if (heading) {
        heading.insertAdjacentElement('afterend', display);
      } else {
        backPanel.insertBefore(display, backPanel.firstChild);
      }
    }
    display.textContent = `Estimated Price: $${totalPrice.toFixed(2)}`;
  }

  // Attach change listeners to checkboxes and quantity inputs for each product card
  document.querySelectorAll('article.product-card').forEach((card) => {
    // Initial price calculation
    updateCardPrice(card);
    // Listen for changes on checkboxes
    card.querySelectorAll('.flip-back input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener('change', () => updateCardPrice(card));
    });
    // Listen for changes on number inputs
    card.querySelectorAll('.flip-back input[type="number"]').forEach((inp) => {
      inp.addEventListener('input', () => updateCardPrice(card));
    });
    // Listen for changes on select elements (non-colour selects)
    card.querySelectorAll('.flip-back select').forEach((sel) => {
      sel.addEventListener('change', () => updateCardPrice(card));
    });
  });
});
