// --- Buttons (safe-guard if not found) ---
const allOnlineBtn = document.getElementById('allOnline');
const allLocalBtn = document.getElementById('allLocal');
let checkoutList = {};

// Pre-checkout button: validate selections + build checkoutList
const preCheckoutBtn = document.getElementById('pre-checkout');
preCheckoutBtn?.addEventListener('click', handlePreCheckout);

function handlePreCheckout() {
  document.getElementById('numCheckOut').hidden = false;

  const itemCards = document.querySelectorAll('.item-details');
  let missingSelection = false;
  checkoutList = {};

  itemCards.forEach((card) => {
    const radios = card.querySelectorAll('input[type="radio"]');
    if (!radios.length) return;

    // Did the user pick local or online for this item?
    const anyChecked = [...radios].some((r) => r.checked);
    if (!anyChecked) {
      missingSelection = true;
      return;
    }

    // If it's marked "online", capture it for checkout
    const onlineRadio = [...radios].find((r) => r.value === 'online' && r.checked);
    if (onlineRadio) {
      const productName = onlineRadio.name;
      const qtyInput = card.querySelector('input[type="number"]');
      const qty = qtyInput ? Number(qtyInput.value || 0) : 0;
      if (qty > 0) {
        checkoutList[productName] = qty;
      }
    }
  });

  if (missingSelection) {
    alert('Please choose Local or Online for every item before continuing to checkout.');
    return;
  }

  // Persist only online items for the checkout page
  sessionStorage.setItem('checkoutList', JSON.stringify(checkoutList));

  // navigate to checkout page (if you want this behavior)
  window.location.href = 'checkoutpage.html';
}

// Toggle all Local / all Online
function locOnlnUpdate(option) {
  const wrappers = document.getElementsByClassName('locOnlnBtnWrapper');
  for (const w of wrappers) {
    for (let i = 0; i < w.children.length; i++) {
      if (w.children[i].tagName === 'INPUT') {
        w.children[i].checked = w.children[i].value === option;
      }
    }
  }
}
allLocalBtn?.addEventListener('click', () => locOnlnUpdate('local'));
allOnlineBtn?.addEventListener('click', () => locOnlnUpdate('online'));

document.addEventListener('DOMContentLoaded', () => {
  // Grab the list container AFTER DOM is ready
  const listOutput = document.getElementById('listOutput');
  if (!listOutput) return; // nothing to do

  // Rebuild saved list from sessionStorage
  const saved = sessionStorage.getItem('localList');
  const items = saved ? JSON.parse(saved) : null;

  if (!items || typeof items !== 'object' || !Object.keys(items).length) {
    listOutput.innerHTML = '<p>No items in your list yet.</p>';
  } else {
    for (const item in items) {
      const listItem = document.createElement('div');
      listItem.classList.add('item-details');

      const qtyInput = document.createElement('input');
      qtyInput.type = 'number';
      qtyInput.value = items[item];
      qtyInput.min = '1';

      const p = document.createElement('p');
      p.append(`item: ${item} — Qty: `);
      p.appendChild(qtyInput);
      listItem.appendChild(p);

      const wrapper = document.createElement('div');
      wrapper.classList.add('locOnlnBtnWrapper');

      // Local
      const lblLocal = document.createElement('label');
      lblLocal.textContent = 'Local';
      const rbLocal = document.createElement('input');
      rbLocal.type = 'radio';
      rbLocal.value = 'local';
      rbLocal.name = item;
      wrapper.append(lblLocal, rbLocal);

      // Online
      const lblOnline = document.createElement('label');
      lblOnline.textContent = 'Online';
      const rbOnline = document.createElement('input');
      rbOnline.type = 'radio';
      rbOnline.value = 'online';
      rbOnline.name = item;
      wrapper.append(lblOnline, rbOnline);

      listItem.appendChild(wrapper);
      listOutput.appendChild(listItem);
    }
  }

  // ===== Map + Local Store Search (unchanged from your version) =====
  let map, markersLayer;

  function ensureMap(lat = 47.6062, lon = -122.3321, zoom = 9) {
    if (!map) {
      map = L.map('map').setView([lat, lon], zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
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
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('Geocoding failed');
    const data = await res.json();
    if (!data.length) throw new Error('ZIP not found');
    return { lat: +data[0].lat, lon: +data[0].lon };
  }

  const milesToMeters = (mi) => Number(mi) * 1609.34;

  async function findNearbyStores(lat, lon, r) {
    const query = `
      [out:json][timeout:25];
      (
        node["shop"~"hardware|doityourself|sports"](around:${Math.round(r)},${lat},${lon});
        way["shop"~"hardware|doityourself|sports"](around:${Math.round(r)},${lat},${lon});
        relation["shop"~"hardware|doityourself|sports"](around:${Math.round(r)},${lat},${lon});
      );
      out center 60;`.trim();

    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: { 'Content-Type': 'text/plain' },
    });
    if (!res.ok) throw new Error('Overpass query failed');
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
  const mapsLink = (lat, lon, name = '') =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${lat},${lon} ${name}`.trim()
    )}`;

  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // meters
    const φ1 = (lat1 * Math.PI) / 180,
      φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function renderStoresOnMap(elements, origin) {
    if (!elements.length) return;
    const bounds = [];
    elements.forEach((el) => {
      const c = el.type === 'node' ? { lat: el.lat, lon: el.lon } : el.center || el;
      if (!c?.lat || !c?.lon) return;
      const tags = el.tags || {};
      const name = tags.name || tags.brand || 'Unnamed store';
      const addr = formatAddress(tags);
      const link = mapsLink(c.lat, c.lon, name);
      const dist = origin
        ? (haversine(origin.lat, origin.lon, c.lat, c.lon) / 1609.34).toFixed(1)
        : null;

      const marker = L.marker([c.lat, c.lon]).bindPopup(`
        <div style="min-width:220px">
          <b>${name}</b><br/>
          <small>${addr || 'Address unavailable'}</small><br/>
          ${dist ? `<small>${dist} mi away</small><br/>` : ''}
          <a href="${link}" target="_blank" rel="noopener">Open in Google Maps</a>
          ${tags.phone ? `<br/><a href="tel:${tags.phone}">${tags.phone}</a>` : ''}
          ${
            tags.website
              ? `<br/><a href="${tags.website}" target="_blank" rel="noopener">Website</a>`
              : ''
          }
        </div>
      `);
      marker.addTo(markersLayer);
      bounds.push([c.lat, c.lon]);
    });
    if (bounds.length) map.fitBounds(bounds, { padding: [20, 20] });
  }

  function renderStoresList(elements, origin) {
    const ul = document.getElementById('storeResults');
    if (!ul) return;
    ul.innerHTML = '';

    if (!elements.length) {
      ul.innerHTML = '<li>No stores found in this radius.</li>';
      return;
    }

    const withDist = elements
      .map((el) => {
        const c = el.type === 'node' ? { lat: el.lat, lon: el.lon } : el.center || el;
        const dist = origin ? haversine(origin.lat, origin.lon, c.lat, c.lon) : Infinity;
        return { ...el, _coord: c, _dist: dist };
      })
      .sort((a, b) => a._dist - b._dist)
      .slice(0, 10);

    withDist.forEach((el) => {
      const c = el._coord;
      const tags = el.tags || {};
      const name = tags.name || tags.brand || 'Unnamed store';
      const addr = formatAddress(tags);
      const g = mapsLink(c.lat, c.lon, name);
      const miles = (el._dist / 1609.34).toFixed(1);

      const li = document.createElement('li');
      li.style.padding = '8px 0';
      li.innerHTML = `
        <b>${name}</b> — ${miles} mi<br/>
        <small>${addr || 'Address unavailable'}</small><br/>
        <a href="${g}" target="_blank" rel="noopener">Open in Google Maps</a>
        ${tags.phone ? ` &middot; <a href="tel:${tags.phone}">${tags.phone}</a>` : ''}
        ${
          tags.website
            ? ` &middot; <a href="${tags.website}" target="_blank" rel="noopener">Website</a>`
            : ''
        }
      `;
      ul.appendChild(li);
    });
  }

  const btn = document.getElementById('findStoresBtn');
  btn?.addEventListener('click', async () => {
    const zip = String(document.getElementById('zip')?.value || '').trim();
    const radiusMi = document.getElementById('radius')?.value || '50';
    if (!zip) {
      alert('Please enter a ZIP code.');
      return;
    }

    try {
      btn.disabled = true;
      btn.textContent = 'Searching...';
      const { lat, lon } = await geocodeZip(zip);
      ensureMap(lat, lon, 11);
      const elements = await findNearbyStores(lat, lon, milesToMeters(radiusMi));
      renderStoresOnMap(elements, { lat, lon });
      renderStoresList(elements, { lat, lon });
    } catch (e) {
      console.error(e);
      ensureMap();
      const ul = document.getElementById('storeResults');
      if (ul)
        ul.innerHTML = '<li>Sorry, we had trouble searching. Try a different ZIP or radius.</li>';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Find Local Stores';
    }
  });
});
