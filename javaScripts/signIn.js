/*
 * signIn.js
 *
 * This file powers the Tournament Director sign‑in page. It handles the email
 * verification flow, persisting lightweight sessions in cookies/localStorage,
 * and rendering event data, purchase history and favorite items once the user
 * has been verified. The original repository omitted calls to initiate the
 * token verification and session restoration routines on page load, so users
 * who clicked their verification links landed back on the sign‑in form with
 * no feedback. This version addresses that issue by invoking checkToken() and
 * initFromStorage() when the DOM is ready.
 *
 * Additional enhancements added here implement a dedicated recommendations
 * viewport for when a TD selects an event from their dashboard. The "Select"
 * buttons in the events table are wired up to display a recommendations
 * section based on the event's tier. A back button allows returning to the
 * event list. The sign‑in link in the header will update to "Dashboard"
 * across pages when a session exists.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Load event data from a JSON file. Each event entry should include an eventID, tier,
  // name, location, dates, URL and a list of verified emails. This data is used to
  // display recommendations and event details after a user has verified their email.
  let EVENTS = [];
  // When a user verifies via token, we'll store their email here for use across functions.
  let verifiedEmail = null;

  async function loadEvents() {
    try {
      // use a relative path instead of a leading slash – this works under /~username/
      const res = await fetch('./events.json');
      if (!res.ok) throw new Error('Failed to load events');
      EVENTS = await res.json();
    } catch (err) {
      console.error('Error loading events:', err);
      const msgEl = document.getElementById('message');
      if (msgEl) msgEl.textContent = 'Events file missing.';
    }
  }

  // Simple helpers for setting and getting cookies. Cookies are used here to persist a
  // lightweight "session" so users can return later without re‑entering their event ID and email.
  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
  }

  function getCookie(name) {
    const prefix = name + '=';
    const cookies = document.cookie.split('; ');
    for (const c of cookies) {
      if (c.startsWith(prefix)) {
        return decodeURIComponent(c.slice(prefix.length));
      }
    }
    return null;
  }

  function addToLocalList(name, qty = 1) {
    try {
      const list = JSON.parse(localStorage.getItem('localList') || '{}');
      list[name] = (Number(list[name]) || 0) + (Number(qty) || 1);
      localStorage.setItem('localList', JSON.stringify(list));

      // Optional: update a cart badge if your header has one
      const cartCountEl = document.getElementById('cartCount');
      if (cartCountEl) {
        const total = Object.values(list).reduce((a, b) => a + Number(b || 0), 0);
        cartCountEl.textContent = total;
      }
      return true;
    } catch (e) {
      console.error('Failed to add to cart:', e);
      return false;
    }
  }

  // Simple recommended items per tier (replace with real picks later)
  const RECS = {
    A: [
      {
        title: 'Premium Player Packs',
        img: 'https://www.innovadiscs.com/wp-content/uploads/2023/01/player-pack_300.jpg',
        href: 'tournamentItems.html#PlayerPacks',
        customize: true,
        customizeHref: '',
      },
      {
        title: 'Mando Arrows',
        img: 'https://fluentdisc.com/aa901ab1b4084b769a17d8772f38bb03.780x400.2416.media.php',
        href: 'tournamentItems.html#courseSetup',
        qty: 10,
      },
      {
        title: 'Orange Marking Paint',
        img: 'https://thepaintstore.com/cdn/shop/products/35099-2.png?v=1698981879&width=950',
        href: 'tournamentItems.html#courseSetup',
        qty: 12,
      },

      {
        title: 'Navigational Arrows',
        img: 'https://fluentdisc.com/3ab0d6eeda764e74ad56c0239ee510f1.780x400.7377.media.php',
        href: 'tournamentItems.html#Extras',
        qty: 18,
      },
      {
        title: 'High Visibility Safety Vest',
        img: 'https://mobileimages.lowes.com/productimages/efb02f24-1868-4038-8e7b-e52704cc31f5/11584815.jpg?size=pdhism',
        href: 'tournamentItems.html#PlayerPacks',
        qty: 10,
      },
      {
        title: 'Orange Safety Cones',
        img: 'https://mobileimages.lowes.com/productimages/75c4c573-aa34-4b99-894f-5743b2d40065/64483884.jpg?size=pdhism',
        href: 'tournamentItems.html#courseSetup',
        qty: 36,
      },
      {
        title: 'Custom Event Shirts',
        img: 'https://cms.cloudinary.vpsvc.com/image/fetch/c_scale,dpr_2.0,f_auto,w_816/https%3A%2F%2Frendering.documents.cimpress.io%2Fv1%2Flat%2Fpreview%3Fwidth%3D1500%26scene%3Dhttps%253A%252F%252Fassets.documents.cimpress.io%252Fv3%252Fassets%252F197d3086-78e7-4439-a20e-7d78b6adf823%252Fcontent',
        href: 'tournamentItems.html#courseSetup',
        customize: true,
        customizeHref: '',
      },
      {
        title: 'Custom DyeMax Disc or Marker',
        img: 'https://shop.discgolfdojo.com/cdn/shop/files/PXL_20230628_190946727.jpg?v=1687980915&width=1946',
        href: 'tournamentItems.html#Extras',
        customize: true,
        customizeHref: '',
      },
    ],
    // B Tier Recommendations
    B: [
      {
        title: 'Standard Player Packs',
        img: 'https://www.innovadiscs.com/wp-content/uploads/2023/01/player-pack_300.jpg',
        href: 'tournamentItems.html#PlayerPacks',
        customize: true,
        customizeHref: '',
      },
      {
        title: 'Mando Arrows',
        img: 'https://fluentdisc.com/aa901ab1b4084b769a17d8772f38bb03.780x400.2416.media.php',
        href: 'tournamentItems.html#Safety',
        qty: 10,
      },
      {
        title: 'Orange Marking Paint',
        img: 'https://thepaintstore.com/cdn/shop/products/35099-2.png?v=1698981879&width=950',
        href: 'tournamentItems.html#courseSetup',
        qty: 12,
      },
      {
        title: 'High Visibility Safety Vest 5 count',
        img: 'https://mobileimages.lowes.com/productimages/efb02f24-1868-4038-8e7b-e52704cc31f5/11584815.jpg?size=pdhism',
        href: 'tournamentItems.html#PlayerPacks',
        qty: 5,
      },
      {
        title: 'Orange Safety Cones 18',
        img: 'https://mobileimages.lowes.com/productimages/75c4c573-aa34-4b99-894f-5743b2d40065/64483884.jpg?size=pdhism',
        href: 'tournamentItems.html#courseSetup',
        qty: 18,
      },
      {
        title: 'PDGA T-Shirts Bulk',
        img: 'images/PDGAWorlds2025teeWhiteDMSE_2048x2048.webp',
        href: 'tournamentItems.html#Extras',
        customize: true,
        customizeHref: '',
      },
      {
        title: 'Custom Disc Golf Stickers',
        img: 'https://dgcoursecollector.com/cdn/shop/files/custompdgaplayerstickerlow3.jpg?v=1723034157&width=1445',
        href: 'tournamentItems.html#Extras',
        customize: true,
        customizeHref: '',
      },
    ],
    // C tier recommendations
    C: [
      {
        title: 'Starter Player Packs',
        img: 'https://www.innovadiscs.com/wp-content/uploads/2023/01/player-pack_300.jpg',
        href: 'tournamentItems.html#PlayerPacks',
        customize: true,
        customizeHref: '',
      },
      {
        title: 'Mando Arrows',
        img: 'https://fluentdisc.com/aa901ab1b4084b769a17d8772f38bb03.780x400.2416.media.php',
        href: 'tournamentItems.html#Safety',
        qty: 6,
      },
      {
        title: 'Orange Marking Paint',
        img: 'https://thepaintstore.com/cdn/shop/products/35099-2.png?v=1698981879&width=950',
        href: 'tournamentItems.html#courseSetup',
        qty: 6,
      },
      {
        title: 'Orange Safety Cones',
        img: 'https://mobileimages.lowes.com/productimages/75c4c573-aa34-4b99-894f-5743b2d40065/64483884.jpg?size=pdhism',
        href: 'tournamentItems.html#Safety',
        qty: 15,
      },
      {
        title: 'Boundary Stakes',
        img: 'https://mobileimages.lowes.com/productimages/9ee2ded8-d275-4c0c-8d80-8d2124fa6baf/72605293.jpeg?size=xl',
        href: 'tournamentItems.html#Safety',
        qty: 12,
      },
      {
        title: 'PDGA T-Shirts Bulk',
        img: 'images/PDGAWorlds2025teeWhiteDMSE_2048x2048.webp',
        href: 'tournamentItems.html#Extras',
        customize: true,
        customizeHref: '',
      },
    ],
  };

  const TIER_COPY = {
    A: 'Built for A-tier/elite events: premium packs, full course kits, and high-visibility signage.',
    B: 'Great fit for solid regional events: reliable packs and course essentials at smart prices.',
    C: 'Starter friendly: cost-effective gear to run smooth local events.',
  };

  const loginForm = document.getElementById('loginForm');
  const authSection = document.getElementById('authSection');
  const recSection = document.getElementById('recSection');
  const errorBox = document.getElementById('error');
  const msgBox = document.getElementById('message');
  const displayName = document.getElementById('displayName');
  const tierLabel = document.getElementById('tierLabel');
  const tierCopy = document.getElementById('tierCopy');
  const recGrid = document.getElementById('recGrid');
  const logoutBtn = document.getElementById('logoutBtn');
  const eventSelectSection = document.getElementById('eventSelectSection');
  const eventGrid = document.getElementById('eventGrid');
  const signInLink = document.getElementById('signInLink');

  // New DOM references for recommendations metadata and navigation
  const recEventName = document.getElementById('recEventName');
  const recTierLabel = document.getElementById('recTierLabel');
  const recTierCopy = document.getElementById('recTierCopy');
  const backToEventsBtn = document.getElementById('backToEventsBtn');

  // New sections for purchase history and favorite items
  const purchaseHistorySection = document.getElementById('purchaseHistorySection');
  const favoriteItemsSection = document.getElementById('favoriteItemsSection');
  const purchaseHistoryList = document.getElementById('purchaseHistoryList');
  const favoriteItemsList = document.getElementById('favoriteItemsList');
  const purchaseHistoryTable = document.getElementById('previousPurchasesBody');
  const favoriteItemsTable = document.getElementById('favoriteItemsBody');

  // Arrays to store filtered data
  let purchaseHistoryData = [];
  let favoriteItemsData = [];

  /**
   * Load purchase history JSON and filter by verifiedEmail.
   */
  async function loadPurchaseHistory() {
    try {
      const res = await fetch('./purchaseHistory.json');
      if (!res.ok) throw new Error('Failed to load purchase history');
      const data = await res.json();
      purchaseHistoryData = Array.isArray(data)
        ? data.filter(
            (p) => p.email && verifiedEmail && p.email.toLowerCase() === verifiedEmail.toLowerCase()
          )
        : [];
    } catch (err) {
      console.error('Error loading purchase history:', err);
      purchaseHistoryData = [];
    }
  }

  async function loadFavoriteItems() {
    try {
      const res = await fetch('./favoriteItems.json');
      if (!res.ok) throw new Error('Failed to load favorite items');
      const data = await res.json();
      favoriteItemsData = Array.isArray(data)
        ? data.filter(
            (f) => f.email && verifiedEmail && f.email.toLowerCase() === verifiedEmail.toLowerCase()
          )
        : [];
    } catch (err) {
      console.error('Error loading favorite items:', err);
      favoriteItemsData = [];
    }
  }

  async function loadAndRenderUserData() {
    if (!verifiedEmail) return;
    try {
      await Promise.all([loadPurchaseHistory(), loadFavoriteItems()]);
      renderPurchaseHistory();
      renderFavoriteItems();
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  }

  /**
   * Render purchase history into either a responsive card layout or a table.
   */
  function renderPurchaseHistory() {
    // Card layout support
    if (purchaseHistoryList) {
      purchaseHistoryList.innerHTML = '';
      purchaseHistoryData.forEach((purchase) => {
        const card = document.createElement('article');
        card.className = 'rec-card';
        card.innerHTML = `
        <div class="body">
          <h3 style="margin:0;">${purchase.eventName || 'Purchase'}</h3>
          <p class="muted small">Date: ${purchase.purchaseDate || ''}</p>
          <p class="muted small">Total: $${Number(purchase.totalCost || 0).toFixed(2)}</p>
          <div class="actions">
            <button class="btn" data-reorder-orderid="${purchase.orderId}">Re‑Order</button>
          </div>
        </div>
      `;
        purchaseHistoryList.appendChild(card);
      });
      if (purchaseHistorySection) {
        purchaseHistorySection.style.display = 'block';
      }
    } else if (purchaseHistoryTable) {
      purchaseHistoryTable.innerHTML = '';
      purchaseHistoryData.forEach((purchase) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${purchase.eventName || 'Purchase'}</td>
          <td>${purchase.purchaseDate || ''}</td>
          <td>$${Number(purchase.totalCost || 0).toFixed(2)}</td>
          <td class="text-right">
            <button class="link-button" data-reorder-orderid="${
              purchase.orderId
            }">add to cart</button>
          </td>
        `;
        purchaseHistoryTable.appendChild(tr);
      });
    }
  }

  /**
   * Render favorite items into either a responsive card layout or a table.
   */
  function renderFavoriteItems() {
    if (favoriteItemsList) {
      favoriteItemsList.innerHTML = '';
      favoriteItemsData.forEach((fav) => {
        const card = document.createElement('article');
        card.className = 'rec-card';
        card.innerHTML = `
        <div class="body">
          <h3 style="margin:0;">${fav.itemName || ''}</h3>
          <p class="muted small">Qty: ${fav.defaultQuantity || 1}</p>
          <p class="muted small">Last Price: $${Number(fav.lastOrderedPrice || 0).toFixed(2)}</p>
          <div class="actions">
            <button class="btn" data-reorder-favid="${fav.catalogId}">${
          fav.buttonLabel || 'Re‑Order'
        }</button>
          </div>
        </div>
      `;
        favoriteItemsList.appendChild(card);
      });
      if (favoriteItemsSection) {
        favoriteItemsSection.style.display = 'block';
      }
    } else if (favoriteItemsTable) {
      favoriteItemsTable.innerHTML = '';
      favoriteItemsData.forEach((fav) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${fav.itemName || ''}</td>
          <td>${fav.defaultQuantity || 1}</td>
          <td>$${Number(fav.lastOrderedPrice || 0).toFixed(2)}</td>
          <td class="text-right">
            <button class="link-button" data-reorder-favid="${fav.catalogId}">${
          fav.buttonLabel || 'add to cart'
        }</button>
          </td>
        `;
        favoriteItemsTable.appendChild(tr);
      });
    }
  }

  // Event delegation for reorder buttons in purchase history
  const purchaseHistoryClickRoot = purchaseHistoryList || purchaseHistoryTable;
  if (purchaseHistoryClickRoot) {
    purchaseHistoryClickRoot.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-reorder-orderid]');
      if (!btn) return;
      const orderId = btn.getAttribute('data-reorder-orderid');
      if (!orderId) return;
      const purchase = purchaseHistoryData.find((p) => String(p.orderId) === String(orderId));
      if (!purchase) return;
      (purchase.lineItems || []).forEach((item) => {
        const qty = Number(item.quantity) || 1;
        addToLocalList(item.itemName, qty);
      });
      btn.textContent = 'Added!';
      setTimeout(() => {
        btn.textContent = 'Re‑Order';
      }, 900);
    });
  }

  // Event delegation for reorder buttons in favorite items
  const favoriteItemsClickRoot = favoriteItemsList || favoriteItemsTable;
  if (favoriteItemsClickRoot) {
    favoriteItemsClickRoot.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-reorder-favid]');
      if (!btn) return;
      const favId = btn.getAttribute('data-reorder-favid');
      if (!favId) return;
      const fav = favoriteItemsData.find((f) => String(f.catalogId) === String(favId));
      if (!fav) return;
      const qty = Number(fav.defaultQuantity) || 1;
      addToLocalList(fav.itemName, qty);
      btn.textContent = 'Added!';
      setTimeout(() => {
        btn.textContent = fav.buttonLabel || 'Re‑Order';
      }, 900);
    });
  }

  function renderRecs(tier) {
    if (!recGrid) return;
    recGrid.innerHTML = '';
    (RECS[tier] || []).forEach((item) => {
      const hasFixedQty = typeof item.qty === 'number';
      const qtyUI = hasFixedQty
        ? `<p class="muted small">Suggested qty: ${item.qty}</p>`
        : `<label class="muted small">Qty&nbsp;<input type="number" min="1" step="1" value="1" class="qty-input"></label>`;
      const addBtn = hasFixedQty
        ? `<button class="btn" data-add data-title="${item.title}" data-qty="${item.qty}">Add to cart</button>`
        : `<button class="btn" data-add data-title="${item.title}" data-dynamic="1">Add to cart</button>`;
      const card = document.createElement('article');
      card.className = 'rec-card';
      card.innerHTML = `
      <img src="${item.img}" alt="">
      <div class="body">
        <h3 style="margin:0;">${item.title}</h3>
        ${qtyUI}
        <div class="actions">
          ${addBtn}
          <a class="btn btn-box" href="${item.href}">View</a>
        </div>
      </div>
    `;
      recGrid.appendChild(card);
    });
  }

  if (recGrid) {
    recGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-add]');
      if (!btn) return;
      const title = btn.getAttribute('data-title');
      if (!title) return;
      let qty;
      if (btn.hasAttribute('data-dynamic')) {
        const card = btn.closest('.rec-card');
        const input = card?.querySelector('.qty-input');
        qty = Math.max(1, parseInt(input?.value, 10) || 1);
      } else {
        qty = Number(btn.getAttribute('data-qty') || 1);
      }
      const ok = addToLocalList(title, qty);
      if (ok) {
        btn.textContent = 'Added!';
        setTimeout(() => (btn.textContent = 'Add to cart'), 900);
      }
    });
  }
  function updateHeaderForLogin(session) {
    if (!signInLink) return;

    signInLink.textContent = 'Dashboard'; // or 'Logged in'
    signInLink.href = 'signIn.html'; // always point back here
    signInLink.setAttribute('aria-current', 'page');
  }

  function showRecommendationsForEvent(event) {
    if (!event) return;

    // Hide event table, show recommendations section
    if (eventSelectSection) {
      eventSelectSection.style.display = 'none';
    }
    if (recSection) {
      recSection.style.display = 'block';
    }

    // Update text for the selected event
    if (recEventName) {
      recEventName.textContent = event.eventName || event.name || '';
    }

    const tierKey = (event.tier || '').toUpperCase();

    if (recTierLabel) {
      recTierLabel.textContent = tierKey;
    }
    if (recTierCopy) {
      recTierCopy.textContent = TIER_COPY[tierKey] || '';
    }

    // Render tier-based recommendations
    renderRecs(tierKey);
    try {
      const serialized = JSON.stringify(event);
      setCookie('pdga_event', serialized, 1); // 1-day cookie
      localStorage.setItem('pdga_event', serialized);
    } catch (e) {
      console.error('Failed to persist pdga_event session:', e);
    }
    updateHeaderForLogin(event);
  }

  /**
   * Handle the email submission. This sends a verification email to the user.
   * On success, a message is displayed instructing the user to check their inbox.
   */
  async function handleEmailSubmit(e) {
    e.preventDefault();
    const emailInputEl = document.getElementById('email');
    const emailRaw = (emailInputEl?.value || '').trim().toLowerCase();
    if (!emailRaw) return;
    // Hide previous messages
    if (errorBox) errorBox.style.display = 'none';
    if (msgBox) msgBox.style.display = 'none';
    try {
      // Cache-buster added here
      const res = await fetch(`./phpFiles/sendVerification.php?t=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailRaw }),
      });
      if (!res.ok) {
        throw new Error('Failed to send verification email.');
      }
      const data = await res.json();
      if (data && data.success) {
        if (msgBox) {
          msgBox.style.display = 'block';
          msgBox.textContent =
            'A verification link has been sent to your email. Please check your inbox.';
        }
      } else {
        throw new Error(data?.error || 'Failed to send verification email.');
      }
    } catch (err) {
      if (errorBox) {
        errorBox.style.display = 'block';
        errorBox.textContent = err.message || 'Failed to send verification email.';
      }
    }
  }

  /**
   * After a user clicks on a verification link, the page will have a "token"
   * parameter in its URL. This function checks for that token and validates it with
   * the backend. If valid, it shows the event selection dashboard.
   */
  async function checkToken() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) return;
    if (authSection) authSection.style.display = 'none';
    if (errorBox) {
      errorBox.style.display = 'none';
      errorBox.textContent = '';
    }
    if (msgBox) {
      msgBox.style.display = 'none';
      msgBox.textContent = '';
    }
    try {
      const res = await fetch('./phpFiles/verify.php?token=' + encodeURIComponent(token));
      if (!res.ok) {
        throw new Error('Invalid or expired verification link.');
      }
      const data = await res.json();
      if (!data || !data.success) {
        throw new Error(data?.error || 'Invalid or expired verification link.');
      }
      verifiedEmail = data.email || null;
      const eventIDs = data.eventIDs || [];
      if (!Array.isArray(eventIDs) || eventIDs.length === 0) {
        throw new Error('No events associated with your email.');
      }
      // Preload personalized lists now that we know the user's email
      await loadAndRenderUserData();
      // Make sure EVENTS is loaded
      if (!Array.isArray(EVENTS) || EVENTS.length === 0) {
        await loadEvents();
      }
      const matches = EVENTS.filter((ev) =>
        eventIDs.some((id) => String(ev.eventID) === String(id))
      );
      if (matches.length === 0) {
        throw new Error('No matching events found.');
      }
      // Always land on the dashboard event table for selection
      showEventSelection(matches);
    } catch (err) {
      if (errorBox) {
        errorBox.style.display = 'block';
        errorBox.textContent = err.message || 'Invalid or expired verification link.';
      }
      if (authSection) authSection.style.display = 'block';
    }
  }

  /**
   * Display multiple events for the user to select from. Each event is rendered as a row with a button.
   * When a user selects an event, its details are used to show recommendations.
   *
   * @param {Array<Object>} events Array of event objects associated with the user.
   */
  function showEventSelection(events) {
    if (!eventSelectSection || !eventGrid) return;
    // Hide sign-in form, hide rec section if it exists
    if (authSection) authSection.style.display = 'none';
    if (recSection) recSection.style.display = 'none';
    eventGrid.innerHTML = '';
    events.forEach((ev) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${ev.eventName || ''}</td>
        <td>${ev.tier || ''}</td>
        <td>${ev.eventDates || ''}</td>
        <td>${ev.eventID || ''}</td>
        <td><span class="badge">${ev.eventLocation || ''}</span></td>
        <td class="text-right">
          <button class="btn btn-small" data-select-event="${ev.eventID}" data-event-name="${
        ev.eventName || ''
      }" data-tier="${ev.tier || ''}" data-location="${ev.eventLocation || ''}" data-dates="${
        ev.eventDates || ''
      }">
            Select
          </button>
        </td>
      `;
      eventGrid.appendChild(tr);
    });
    eventSelectSection.style.display = 'block';
    // Add click handler for selection. Use one event listener for efficiency.
    eventGrid.onclick = (e) => {
      const btn = e.target.closest('button[data-select-event]');
      if (!btn) return;
      const id = btn.getAttribute('data-select-event');
      const tier = btn.getAttribute('data-tier') || '';
      const name = btn.getAttribute('data-event-name') || '';
      const location = btn.getAttribute('data-location') || '';
      const dates = btn.getAttribute('data-dates') || '';
      // Build session object and show recommendations
      const session = {
        eventId: id,
        eventID: id,
        tier: tier,
        eventName: name,
        eventLocation: location,
        eventDates: dates,
        email: verifiedEmail,
      };
      showRecommendationsForEvent(session);
    };
  }

  function initFromStorage() {
    try {
      // Attempt to restore the session from a cookie first, then fallback to localStorage.
      const cookieVal = getCookie('pdga_event');
      let saved = null;
      if (cookieVal) {
        saved = JSON.parse(cookieVal);
      } else {
        saved = JSON.parse(localStorage.getItem('pdga_event') || 'null');
      }
      if (saved && saved.eventId && saved.tier) {
        // Restore the verified email if present in the saved session
        if (saved.email) {
          verifiedEmail = saved.email;
        }
        // Load and render purchase history and favorites for the saved email
        loadAndRenderUserData()
          .then(() => {
            showRecommendationsForEvent(saved);
          })
          .catch(() => {
            // Even if data fails to load, still show recommendations
            showRecommendationsForEvent(saved);
          });
      }
    } catch (_) {
      // ignore parse errors
    }
  }

  // Bind the email submission handler
  if (loginForm) {
    loginForm.addEventListener('submit', handleEmailSubmit);
  }
  // Only add a logout handler if the button actually exists on this page
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      setCookie('pdga_event', '', -1);
      localStorage.removeItem('pdga_event');
      if (recSection) recSection.style.display = 'none';
      if (authSection) authSection.style.display = 'block';
    });
  }
  // Add handler for back button to return to event list
  if (backToEventsBtn) {
    backToEventsBtn.addEventListener('click', () => {
      if (recSection) recSection.style.display = 'none';
      if (eventSelectSection) eventSelectSection.style.display = 'block';
    });
  }

  // ---
  // Kick off initial page logic.
  // Attempt to validate a token in the URL; if none exists, attempt to restore an existing session.
  // Without these calls the original implementation never progressed past the sign‑in screen.
  checkToken();
  initFromStorage();
});
