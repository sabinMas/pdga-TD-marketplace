document.addEventListener('DOMContentLoaded', () => {
  const EVENT_BY_USER = {
    Mason: {
      eventName: "Discraft's Cascade Challenge",
      eventTier: 'A',
      eventLocation: 'Shelton, WA',
      eventDates: 'Apr 26–28, 2026',
      eventUrl: 'https://www.pdga.com/tour/event/79560',
      eventId: '79560',
    },
    JohnCarlo: {
      eventName: 'The Spokane Open',
      eventTier: 'B',
      eventLocation: 'Spokane, WA',
      eventDates: 'Oct 28-29, 2026',
      eventUrl: 'https://www.pdga.com/tour/event/64547',
      eventId: '64547',
    },
    Tyler: {
      eventName: 'Echo Valley Fall Challenge',
      eventTier: 'C',
      eventLocation: 'Springboro, OH',
      eventDates: 'Oct 28, 2026',
      eventUrl: 'https://www.pdga.com/tour/event/62748',
      eventId: '62748',
    },
  };
  // --- Demo "database" we will implement a database via PHP/MYSQL later
  const USERS = [
    { username: 'Mason', password: '1111', tier: 'A', name: 'Mason' },
    { username: 'JohnCarlo', password: '2222', tier: 'B', name: 'JohnCarlo' },
    { username: 'Tyler', password: '3333', tier: 'C', name: 'Tyler' },
  ];

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
        customizeHref:''
      },
      {
        title: 'Mando Arrows',
        img: 'https://fluentdisc.com/aa901ab1b4084b769a17d8772f38bb03.780x400.2416.media.php',
        href: 'tournamentItems.html#courseSetup',
        qty: 10
      },
      {
        title: 'Orange Marking Paint',
        img: 'https://thepaintstore.com/cdn/shop/products/35099-2.png?v=1698981879&width=950',
        href: 'tournamentItems.html#courseSetup',
        qty: 12
      },

      {
        title: 'Navigational Arrows',
        img: 'https://fluentdisc.com/3ab0d6eeda764e74ad56c0239ee510f1.780x400.7377.media.php',
        href: 'tournamentItems.html#Extras',
        qty: 18
      },
      {
        title: 'High Visibility Safety Vest',
        img: 'https://mobileimages.lowes.com/productimages/efb02f24-1868-4038-8e7b-e52704cc31f5/11584815.jpg?size=pdhism',
        href: 'tournamentItems.html#PlayerPacks',
        qty: 10
      },
      {
        title: 'Orange Safety Cones',
        img: 'https://mobileimages.lowes.com/productimages/75c4c573-aa34-4b99-894f-5743b2d40065/64483884.jpg?size=pdhism',
        href: 'tournamentItems.html#courseSetup',
        qty: 36
      },
      {
        title: 'Custom Event Shirts',
        img: 'https://cms.cloudinary.vpsvc.com/image/fetch/c_scale,dpr_2.0,f_auto,w_816/https%3A%2F%2Frendering.documents.cimpress.io%2Fv1%2Flat%2Fpreview%3Fwidth%3D1500%26scene%3Dhttps%253A%252F%252Fassets.documents.cimpress.io%252Fv3%252Fassets%252F197d3086-78e7-4439-a20e-7d78b6adf823%252Fcontent',
        href: 'tournamentItems.html#courseSetup',
        customize: true,
        customizeHref:''
    
      },

      {
        title: 'Custom DyeMax Disc or Marker',
        img: 'https://shop.discgolfdojo.com/cdn/shop/files/PXL_20230628_190946727.jpg?v=1687980915&width=1946',
        href: 'tournamentItems.html#Extras',
        customize: true,
        customizeHref: ''
      },
    ],

    // B Tier Recommendations
    B: [
      {
        title: 'Standard Player Packs',
        img: 'https://www.innovadiscs.com/wp-content/uploads/2023/01/player-pack_300.jpg',
        href: 'tournamentItems.html#PlayerPacks',
        customize: true,
        customizeHref: ''
      },
      {
        title: 'Mando Arrows',
        img: 'https://fluentdisc.com/aa901ab1b4084b769a17d8772f38bb03.780x400.2416.media.php',
        href: 'tournamentItems.html#Safety',
        qty: 1
      },
      {
        title: 'Orange Marking Paint case of 12',
        img: 'https://thepaintstore.com/cdn/shop/products/35099-2.png?v=1698981879&width=950',
        href: 'tournamentItems.html#courseSetup',
        qty: 1
      },
      {
        title: 'High Visibility Safety Vest 5 count',
        img: 'https://mobileimages.lowes.com/productimages/efb02f24-1868-4038-8e7b-e52704cc31f5/11584815.jpg?size=pdhism',
        href: 'tournamentItems.html#PlayerPacks',
        qty: 1
      },
      {
        title: 'Orange Safety Cones 36',
        img: 'https://mobileimages.lowes.com/productimages/75c4c573-aa34-4b99-894f-5743b2d40065/64483884.jpg?size=pdhism',
        href: 'tournamentItems.html#courseSetup',
        qty: 1
      },

      {
        title: 'PDGA T-Shirts Bulk',
        img: 'images/PDGAWorlds2025teeWhiteDMSE_2048x2048.webp',
        href: 'tournamentItems.html#Extras',
        customize: true,
        customizeHref: ''
      },
    {
        title: 'Custom Disc Golf Stickers',
        img: 'https://dgcoursecollector.com/cdn/shop/files/custompdgaplayerstickerlow3.jpg?v=1723034157&width=1445',
        href: 'tournamentItems.html#Extras',
        customize: true,
        customizeHref: ''
      },


    ],

    // C tier recommeddations
    C: [
      {
        title: 'Starter Player Packs',
        img: 'https://www.innovadiscs.com/wp-content/uploads/2023/01/player-pack_300.jpg',
        href: 'tournamentItems.html#PlayerPacks',
        qty: 1
      },
      {
        title: 'Mando Arrows',
        img: 'https://fluentdisc.com/aa901ab1b4084b769a17d8772f38bb03.780x400.2416.media.php',
        href: 'tournamentItems.html#Safety',
        qty: 1
      },
      {
        title: 'Orange Marking Paint case of 6',
        img: 'https://thepaintstore.com/cdn/shop/products/35099-2.png?v=1698981879&width=950',
        href: 'tournamentItems.html#courseSetup',
        qty: 1
      },

      {
        title: 'Orange Safety Cones 15 count',
        img: 'https://mobileimages.lowes.com/productimages/75c4c573-aa34-4b99-894f-5743b2d40065/64483884.jpg?size=pdhism',
        href: 'tournamentItems.html#Safety',
        qty: 1
      },
      {
        title: 'Stakes Kit 10 count',
        img: 'https://mobileimages.lowes.com/productimages/9ee2ded8-d275-4c0c-8d80-8d2124fa6baf/72605293.jpeg?size=xl',
        href: 'tournamentItems.html#Safety',
        qty: 1
      },
      {
        title: 'PDGA T-Shirts Bulk',
        img: 'images/PDGAWorlds2025teeWhiteDMSE_2048x2048.webp',
        href: 'tournamentItems.html#Extras',
        customize: true,
        customizeHref: ''
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
  const displayName = document.getElementById('displayName');
  const tierLabel = document.getElementById('tierLabel');
  const tierCopy = document.getElementById('tierCopy');
  const recGrid = document.getElementById('recGrid');
  const logoutBtn = document.getElementById('logoutBtn');

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
      // Find the qty input in the same card
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



  function showRecommendations(user) {
    // Merge in event info by username (if any)
    const enriched = {
      ...user,
      ...(EVENT_BY_USER[user.username] || {}),
    };

    // UI
    displayName.textContent = enriched.name;
    tierLabel.textContent = enriched.tier;
    tierCopy.textContent = TIER_COPY[enriched.tier] || '';
    renderRecs(enriched.tier);

    // Persist simple "session" (now includes event fields)
    localStorage.setItem('pdga_user', JSON.stringify(enriched));

    // Toggle sections
    authSection.style.display = 'none';
    recSection.style.display = 'block';

    // Update header buttons for logged-in state
    updateHeaderForLogin(enriched);
  }

  function handleLogin(e) {
    e.preventDefault();
    const username = (document.getElementById('username').value || '').trim();
    const password = (document.getElementById('password').value || '').trim();

    const user = USERS.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (!user) {
      errorBox.style.display = 'block';
      errorBox.textContent = 'Invalid username or password for the demo accounts above.';
      return;
    }
    errorBox.style.display = 'none';
    showRecommendations(user);
  }

  function initFromStorage() {
    try {
      const saved = JSON.parse(localStorage.getItem('pdga_user') || 'null');
      if (saved && saved.username && saved.tier) {
        showRecommendations(saved);
      }
    } catch (_) {}
  }

  loginForm.addEventListener('submit', handleLogin);
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('pdga_user');
    recSection.style.display = 'none';
    authSection.style.display = 'block';
    loginForm.reset();
    document.getElementById('username').focus();
  });

  initFromStorage();

  const signInLink = document.getElementById('signInLink');
  const authActions = document.getElementById('authActions');

  function updateHeaderForLogin(user) {
    if (!authActions) return;
    if (user) {
      authActions.innerHTML = `
      <a href="https://www.pdga.com/td/how-to-sanction-event" class="btn btn-box">Create Event</a>
      <button id="logoutHeaderBtn" class="btn btn-box" type="button">Log out</button>
    `;
      document.getElementById('logoutHeaderBtn').addEventListener('click', () => {
        localStorage.removeItem('pdga_user');
        location.reload();
      });
    }
  }

  const savedUser = JSON.parse(localStorage.getItem('pdga_user') || 'null');
  if (savedUser) updateHeaderForLogin(savedUser);
});
