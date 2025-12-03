// --- Buttons (safe-guard if not found) ---
const allOnlineBtn = document.getElementById('allOnline');
const allLocalBtn  = document.getElementById('allLocal');

/**
 * A mapping of product names to their base price and category.  When a user
 * selects an item for online checkout we use this table to determine
 * how much the item costs and whether it falls under the Player Pack
 * category or Event Supplies category.  If you add new products to
 * tournamentItems.html be sure to update this table with an entry for
 * each item.  The price field should reflect the minimum price for
 * items with a price range.
 */
const productInfo = {
  // Player packs
  "Premium Player Pack": { price: 35.00, category: "Player Packs" },
  "Standard Player Pack": { price: 15.99, category: "Player Packs" },
  "Bargain Player Pack": { price: 5.00, category: "Player Packs" },
  // Course setup products (event supplies)
  "Marking Paint Spray Cans": { price: 9.98, category: "Event Supplies" },
  "High Visibility Navigational Arrows": { price: 15.00, category: "Event Supplies" },
  "High Visibility Mando Arrows": { price: 30.00, category: "Event Supplies" },
  "Artificial Turf Tee Pad": { price: 250.00, category: "Event Supplies" },
  "Disc Golf Portable Baskets": { price: 100.00, category: "Event Supplies" },
  "Disc Golf Permanent Baskets": { price: 400.00, category: "Event Supplies" },
  // Safety products
  "High Visibility Safety Vest": { price: 12.88, category: "Event Supplies" },
  "Orange Safety Cones": { price: 12.99, category: "Event Supplies" },
  "First Aid Kit": { price: 150.00, category: "Event Supplies" },
  "Landscape Stake": { price: 12.78, category: "Event Supplies" },
  "Safety Whistle": { price: 3.99, category: "Event Supplies" },
  // Extras
  "Custom DyeMax Disc or Marker": { price: 7.99, category: "Event Supplies" },
  "Backstock PDGA Discs Bulk": { price: 6.00, category: "Event Supplies" },
  "Sport-Tek Tee": { price: 7.53, category: "Event Supplies" },
  "Sprot-Tek Tee": { price: 7.53, category: "Event Supplies" },
  "PDGA Event T-Shirts Bulk": { price: 2.50, category: "Event Supplies" },
  "21 oz Montego Water Bottle": { price: 4.50, category: "Event Supplies" },
  "Custom Hat": { price: 8.57, category: "Event Supplies" },
  "Custom Towels — Cotton": { price: 25.05, category: "Event Supplies" },
  "Custom Towel — Cotton": { price: 25.05, category: "Event Supplies" },
  "Custom Disc Golf Stickers": { price: 9.99, category: "Event Supplies" },
  // Seasonal events / extras
  "Canopy/Tent": { price: 150.00, category: "Event Supplies" },
  "Large Umbrellas": { price: 30.00, category: "Event Supplies" },
  "WaterProof Bins": { price: 15.00, category: "Event Supplies" },
  "Rope & OB Flags": { price: 25.00, category: "Event Supplies" },
  "Rope/OB Flags": { price: 25.00, category: "Event Supplies" },
  "Towels/Drying Rags": { price: 5.00, category: "Event Supplies" },
  "Jackets/Sweatshirt": { price: 30.00, category: "Event Supplies" },
  "Hand Warmers": { price: 35.00, category: "Event Supplies" },
  "Gloves": { price: 10.00, category: "Event Supplies" },
  "Ribbon Markers": { price: 10.00, category: "Event Supplies" },
  "Ice Melters": { price: 20.00, category: "Event Supplies" },
  "Portable Heaters": { price: 150.00, category: "Event Supplies" },
  "Portable Lighting": { price: 50.00, category: "Event Supplies" },
  "Leaf Blowers": { price: 120.00, category: "Event Supplies" },
  "Flags/OB ropes": { price: 25.00, category: "Event Supplies" },
  "Reflective Signage": { price: 15.00, category: "Event Supplies" },
  "Lighting/Lanterns": { price: 20.00, category: "Event Supplies" },
  "Hooded Jackets": { price: 30.00, category: "Event Supplies" },
  "Course Map Signage": { price: 15.00, category: "Event Supplies" },
  "Water Jugg": { price: 65.00, category: "Event Supplies" },
  "Tents": { price: 150.00, category: "Event Supplies" },
  "Sunscreen/Bug Sprays": { price: 25.00, category: "Event Supplies" },
  "Cooling Towels": { price: 10.00, category: "Event Supplies" },
  "Lightweight Jacket": { price: 35.00, category: "Event Supplies" },
  "PA system": { price: 55.00, category: "Event Supplies" }
};

// We'll build the checkout list as an object keyed by product name. Each
// value will be an object containing quantity, price, category and a
// computed total for that line item.  When the checkout page loads it
// will read this structure from sessionStorage.
let checkoutList = {};

// Pre-checkout button wires up to gather online selections
const preCheckoutBtn = document.getElementById('pre-checkout');
preCheckoutBtn?.addEventListener('click', onlineCheckout);

function onlineCheckout() {
  // Show the checkout button when items are prepared
  const numCheckOut = document.getElementById('numCheckOut');
  if (numCheckOut) {
    numCheckOut.hidden = false;
  }

  // Collect all radio inputs so we can detect which items are marked online
  const radios = document.querySelectorAll('input[type="radio"]');
  checkoutList = {}; // reset each time pre-checkout is clicked

  // Iterate over each radio button group; only store those with value "online"
  const itemCards = document.querySelectorAll('.item-details');
  let missingSelection = false;

  itemCards.forEach((card) => {
    const cardRadios = card.querySelectorAll('input[type="radio"]');
    if (!cardRadios.length) return;

    const anyChecked = Array.from(cardRadios).some((r) => r.checked);
    if (!anyChecked) {
      missingSelection = true;
      return;
    }

    const onlineRadio = Array.from(cardRadios).find(
      (r) => r.value === 'online' && r.checked
    );

    if (onlineRadio) {
      const productName = onlineRadio.name;
      const qtyInput = card.querySelector('input[type="number"]');
      const qty = qtyInput ? parseInt(qtyInput.value || '0', 10) : 0;

      if (qty > 0) {
        const info = productInfo[productName] || {
          price: 10.0,
          category: 'Event Supplies',
        };
        checkoutList[productName] = {
          quantity: qty,
          price: info.price,
          category: info.category,
          total: parseFloat((info.price * qty).toFixed(2)),
        };
      }
    }
  });

  if (missingSelection) {
    alert('Please select local or online for all items before proceeding.');
    return;
  }

  // Persist checkoutList to sessionStorage for checkout.js
  sessionStorage.setItem('checkoutList', JSON.stringify(checkoutList));

  // (Optional) you can auto-navigate here if you want:
  // window.location.href = 'checkoutpage.html';
}

function locOnlnUpdate(option) {
  const wrappers = document.getElementsByClassName('locOnlnBtnWrapper');
  for (const w of wrappers) {
    for (let i = 0; i < w.children.length; i++) {
      if (
        w.children[i].tagName === 'INPUT' &&
        w.children[i].value === option
      ) {
        w.children[i].checked = true;
      }
    }
  }
}

// Bulk selection buttons for convenience
allLocalBtn?.addEventListener('click', () => locOnlnUpdate('local'));
allOnlineBtn?.addEventListener('click', () => locOnlnUpdate('online'));

// ================== LIST REBUILD FROM localList ==================
document.addEventListener('DOMContentLoaded', () => {
  const listOutput = document.getElementById('listOutput');
  if (!listOutput) return;

  // We store the user's list in sessionStorage under 'localList'.  It maps
  // product names to their quantities.
  const saved = sessionStorage.getItem('localList');
  const items = saved ? JSON.parse(saved) : null;

  if (!items || typeof items !== 'object' || !Object.keys(items).length) {
    listOutput.innerHTML = '<p>No items in your list yet.</p>';
    return;
  }

  // Show the multi-select buttons now that there are items
  const wrapper = document.getElementById('listFunctionWrapper');
  if (wrapper) wrapper.hidden = false;

  // For each item, render the quantity input and radio options
  for (const item in items) {
    const listItem = document.createElement('div');
    listItem.classList.add('item-details');

    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.value = items[item];
    qtyInput.min = '1';

    const p = document.createElement('p');
    p.append(`item: ${item} \u2014 Qty: `);
    p.appendChild(qtyInput);
    listItem.appendChild(p);

    const wrapperDiv = document.createElement('div');
    wrapperDiv.classList.add('locOnlnBtnWrapper');

    // Local radio
    const lblLocal = document.createElement('label');
    lblLocal.textContent = 'Local';
    const rbLocal = document.createElement('input');
    rbLocal.type = 'radio';
    rbLocal.value = 'local';
    rbLocal.name = item;
    wrapperDiv.append(lblLocal, rbLocal);

    // Online radio
    const lblOnline = document.createElement('label');
    lblOnline.textContent = 'Online';
    const rbOnline = document.createElement('input');
    rbOnline.type = 'radio';
    rbOnline.value = 'online';
    rbOnline.name = item;
    wrapperDiv.append(lblOnline, rbOnline);

    listItem.appendChild(wrapperDiv);
    listOutput.appendChild(listItem);
  }
});

// ================== MAP + LOCAL STORE SEARCH ==================
document.addEventListener('DOMContentLoaded', () => {
  const mapDiv = document.getElementById('map');
  const resultsList = document.getElementById('storeResults');
  const findBtn = document.getElementById('findStoresBtn');

  // If those elements don’t exist on the page, do nothing
  if (!mapDiv || !resultsList || !findBtn || typeof L === 'undefined') {
    return;
  }

  let map;
  let markersLayer;

  function ensureMap(lat = 47.6062, lon = -122.3321, zoom = 9) {
    if (!map) {
      map = L.map('map').setView([lat, lon], zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
      markersLayer = L.layerGroup().addTo(map);
    } else {
      map.setView([lat, lon], zoom);
      markersLayer.clearLayers();
    }
  }

  async function geocodeZip(zip) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=us&postalcode=${encodeURIComponent(
      zip
    )}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error('Geocoding failed');
    }
    const data = await res.json();
    if (!data.length) {
      throw new Error('ZIP not found');
    }
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  }

  const milesToMeters = (mi) => Number(mi) * 1609.34;

async function findNearbyStores(lat, lon, radiusMeters) {
  const query = `
    [out:json][timeout:25];
    (
      node["shop"="sports"](around:${Math.round(radiusMeters)},${lat},${lon});
      way["shop"="sports"](around:${Math.round(radiusMeters)},${lat},${lon});
      relation["shop"="sports"](around:${Math.round(radiusMeters)},${lat},${lon});
      node["shop"="sports"]["sport"="disc_golf"](around:${Math.round(radiusMeters)},${lat},${lon});
      way["shop"="sports"]["sport"="disc_golf"](around:${Math.round(radiusMeters)},${lat},${lon});
      relation["shop"="sports"]["sport"="disc_golf"](around:${Math.round(radiusMeters)},${lat},${lon});
    );
    out center 60;
  `.trim();
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: { 'Content-Type': 'text/plain' },
    });
    if (!res.ok) {
      throw new Error('Overpass query failed');
    }
    const data = await res.json();
    return data.elements || [];
  }


  function formatAddress(tags = {}) {
    return [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:city'],
      tags['addr:state'],
      tags['addr:postcode'],
    ]
      .filter(Boolean)
      .join(', ');
  }


  function googleMapsLink(lat, lon, name = '') {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${lat},${lon} ${name}`.trim()
    )}`;
  }


  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);


    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }


  function renderStoresOnMap(elements, origin) {
    if (!elements.length) return;
    const bounds = [];
    elements.forEach((el) => {
      const c =
        el.type === 'node' ? { lat: el.lat, lon: el.lon } : el.center || el;
      if (!c || typeof c.lat !== 'number' || typeof c.lon !== 'number') return;


      const tags = el.tags || {};
      const name = tags.name || tags.brand || 'Unnamed store';
      const addr = formatAddress(tags);
      const link = googleMapsLink(c.lat, c.lon, name);
      const dist =
        origin != null
          ? (haversine(origin.lat, origin.lon, c.lat, c.lon) / 1609.34).toFixed(
              1
            )
          : null;


      const marker = L.marker([c.lat, c.lon]).bindPopup(
        `
        <div style="min-width:220px">
          <b>${name}</b><br/>
          <small>${addr || 'Address unavailable'}</small><br/>
          ${dist ? `<small>${dist} mi away</small><br/>` : ''}
          <a href="${link}" target="_blank" rel="noopener">Open in Google Maps</a>
          ${
            tags.phone
              ? `<br/><a href="tel:${tags.phone}">${tags.phone}</a>`
              : ''
          }
          ${
            tags.website
              ? `<br/><a href="${tags.website}" target="_blank" rel="noopener">Website</a>`
              : ''
          }
        </div>
      `.trim()
      );


      marker.addTo(markersLayer);
      bounds.push([c.lat, c.lon]);
    });


    if (bounds.length) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }


  function renderStoresList(elements, origin) {
    resultsList.innerHTML = '';


    if (!elements.length) {
      resultsList.innerHTML = '<li>No stores found in this radius.</li>';
      return;
    }


    const withDist = elements
      .map((el) => {
        const c =
          el.type === 'node' ? { lat: el.lat, lon: el.lon } : el.center || el;
        const dist =
          origin != null
            ? haversine(origin.lat, origin.lon, c.lat, c.lon)
            : Infinity;
        return { ...el, _coord: c, _dist: dist };
      })
      .sort((a, b) => a._dist - b._dist)
      .slice(0, 10);


    withDist.forEach((el) => {
      const c = el._coord;
      const tags = el.tags || {};
      const name = tags.name || tags.brand || 'Unnamed store';
      const addr = formatAddress(tags);
      const g = googleMapsLink(c.lat, c.lon, name);
      const miles = (el._dist / 1609.34).toFixed(1);


      const li = document.createElement('li');
      li.style.padding = '8px 0';
      li.innerHTML = `
        <b>${name}</b> — ${miles} mi<br/>
        <small>${addr || 'Address unavailable'}</small><br/>
        <a href="${g}" target="_blank" rel="noopener">Open in Google Maps</a>
        ${
          tags.phone
            ? ` &middot; <a href="tel:${tags.phone}">${tags.phone}</a>`
            : ''
        }
        ${
          tags.website
            ? ` &middot; <a href="${tags.website}" target="_blank" rel="noopener">Website</a>`
            : ''
        }
      `;
      resultsList.appendChild(li);
    });
  }


  findBtn.addEventListener('click', async () => {
    const zipInput = document.getElementById('zip');
    const radiusSelect = document.getElementById('radius');
    const zip = zipInput ? String(zipInput.value || '').trim() : '';
    const radiusMi = radiusSelect ? radiusSelect.value || '50' : '50';


    if (!zip) {
      alert('Please enter a ZIP code.');
      return;
    }


    try {
      findBtn.disabled = true;
      findBtn.textContent = 'Searching...';


      const { lat, lon } = await geocodeZip(zip);
      ensureMap(lat, lon, 11);


      const elements = await findNearbyStores(lat, lon, milesToMeters(radiusMi));
      renderStoresOnMap(elements, { lat, lon });
      renderStoresList(elements, { lat, lon });
    } catch (err) {
      console.error(err);
      ensureMap();
      resultsList.innerHTML =
        '<li>Sorry, we had trouble searching. Try a different ZIP or radius.</li>';
    } finally {
      findBtn.disabled = false;
      findBtn.textContent = 'Find Local Stores';
    }
  });
});