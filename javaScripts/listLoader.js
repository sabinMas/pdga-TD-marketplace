// --- Buttons (safe-guard if not found) ---
const allOnlineBtn = document.getElementById('allOnline');
const allLocalBtn  = document.getElementById('allLocal');
checkoutList = {};
document.getElementById('pre-checkout').addEventListener('click', onlineCheckout);

function onlineCheckout() {
  var compList = document.getElementsByClassName("item-details");
  //iterate over each 'item-detail' wrapper
  for (const c of compList) {
    
  }

  /*
  On pre-checkout button press,
  Grab all items in list.html

      make sure that every item is checked either, local or online
      if 
        any buttons are not clicked, do a pop-up "all items need to be selected"

      else

        iterate over all of the tags with 'item-details'
      
        check if the current 'item-details', grandchild is check local or online
        if online,
          add info into checkoutList
          add all of the online items to local storage under online items

      after we are finished iterating all 'item-details'
      add the checkoutList to local storage

      iterate over online items in local storage and create elements for checkout.html
    
  */
}
function locOnlnUpdate(option) {
  const wrappers = document.getElementsByClassName('locOnlnBtnWrapper');
  for (const w of wrappers) {
    for (let i = 0; i < w.children.length; i++) {
      if (w.children[i].tagName === 'INPUT') {
        w.children[i].checked = (w.children[i].value === option);
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

  // Rebuild saved list from sessionStorage instead of localStorage
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

      const p = document.createElement('p');
      p.append(`item: ${item} --SPACING-- Qty: `);
      p.appendChild(qtyInput);
      listItem.appendChild(p);

      const wrapper = document.createElement('div');
      wrapper.classList.add('locOnlnBtnWrapper');

      // Local
      const lblLocal = document.createElement('label');
      lblLocal.textContent = 'local';
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

  // ===== Map + Local Store Search (unchanged logic, just scoped here) =====
  let map, markersLayer;

  function ensureMap(lat = 47.6062, lon = -122.3321, zoom = 9) {
    if (!map) {
      map = L.map('map').setView([lat, lon], zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);
      markersLayer = L.layerGroup().addTo(map);
    } else {
      map.setView([lat, lon], zoom);
      markersLayer.clearLayers();
    }
  }

  async function geocodeZip(zip) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=us&postalcode=${encodeURIComponent(zip)}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('Geocoding failed');
    const data = await res.json();
    if (!data.length) throw new Error('ZIP not found');
    return { lat: +data[0].lat, lon: +data[0].lon };
  }

  const milesToMeters = mi => Number(mi) * 1609.34;

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
      headers: { 'Content-Type': 'text/plain' }
    });
    if (!res.ok) throw new Error('Overpass query failed');
    const data = await res.json();
    return data.elements || [];
  }

  function formatAddress(tags = {}) {
    return [tags['addr:housenumber'], tags['addr:street'], tags['addr:city'], tags['addr:state'], tags['addr:postcode']]
      .filter(Boolean).join(', ');
  }
  const mapsLink = (lat, lon, name='') => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lon} ${name}`.trim())}`;

  //https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API/Using_the_Geolocation_API#using_the_haversine_formula

 function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // meters
  const φ1 = lat1 * Math.PI/180, φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2 - lat1) * Math.PI/180;
  const Δλ = (lon2 - lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
 }
 
 // we'll pass lat/lon of the ZIP to both render functions
 function renderStoresOnMap(elements, origin) {
   if (!elements.length) return;
   const bounds = [];
   elements.forEach(el => {
     const c = el.type === 'node' ? { lat: el.lat, lon: el.lon } : (el.center || el);
     if (!c?.lat || !c?.lon) return;
     const tags = el.tags || {};
     const name = tags.name || (tags.brand || 'Unnamed store');
     const addr = formatAddress(tags);
     const link = mapsLink(c.lat, c.lon, name);
     const dist = origin ? (haversine(origin.lat, origin.lon, c.lat, c.lon) / 1609.34).toFixed(1) : null;

     const marker = L.marker([c.lat, c.lon]).bindPopup(`
       <div style="min-width:220px">
         <b>${name}</b><br/>
         <small>${addr || 'Address unavailable'}</small><br/>
         ${dist ? `<small>${dist} mi away</small><br/>` : ''}
         <a href="${link}" target="_blank" rel="noopener">Open in Google Maps</a>
         ${tags.phone ? `<br/><a href="tel:${tags.phone}">${tags.phone}</a>` : ''}
         ${tags.website ? `<br/><a href="${tags.website}" target="_blank" rel="noopener">Website</a>` : ''}
       </div>
     `);
     marker.addTo(markersLayer);
     bounds.push([c.lat, c.lon]);
   });
   if (bounds.length) map.fitBounds(bounds, { padding: [20,20] });
 }
 
 function renderStoresList(elements, origin) {
   const ul = document.getElementById('storeResults');
   if (!ul) return;
   ul.innerHTML = '';

   if (!elements.length) {
     ul.innerHTML = '<li>No stores found in this radius.</li>';
     return;
   }

   // Compute distances, sort by distance, limit to 10
   const withDist = elements.map(el => {
     const c = el.type === 'node' ? { lat: el.lat, lon: el.lon } : (el.center || el);
     const dist = origin ? haversine(origin.lat, origin.lon, c.lat, c.lon) : Infinity;
     return { ...el, _coord: c, _dist: dist };
   }).sort((a,b) => a._dist - b._dist)
     .slice(0, 10); // 👈 limit to 10 results

   withDist.forEach(el => {
     const c = el._coord;
     const tags = el.tags || {};
     const name = tags.name || (tags.brand || 'Unnamed store');
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
       ${tags.website ? ` &middot; <a href="${tags.website}" target="_blank" rel="noopener">Website</a>` : ''}
     `;
     ul.appendChild(li);
   });
 }

  // Button wire-up
   const btn = document.getElementById('findStoresBtn');
   btn?.addEventListener('click', async () => {
     const zip = String(document.getElementById('zip')?.value || '').trim();
     const radiusMi = document.getElementById('radius')?.value || '50';
     if (!zip) { alert('Please enter a ZIP code.'); return; }

     try {
       btn.disabled = true; btn.textContent = 'Searching...';
       const { lat, lon } = await geocodeZip(zip);
       ensureMap(lat, lon, 11);
       const elements = await findNearbyStores(lat, lon, milesToMeters(radiusMi));
       renderStoresOnMap(elements);
       renderStoresList(elements);
     } catch (e) {
       console.error(e);
       ensureMap();
       const ul = document.getElementById('storeResults');
       if (ul) ul.innerHTML = '<li>Sorry, we had trouble searching. Try a different ZIP or radius.</li>';
     } finally {
       btn.disabled = false; btn.textContent = 'Find Local Stores';
     }
   });
 });