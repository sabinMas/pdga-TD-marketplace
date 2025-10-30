// ===== Cart bootstrap =====
let list = {};
try { list = JSON.parse(localStorage.getItem('localList') || '{}'); } catch {}
const cartCount = document.getElementById('cartCount');
function updateCartCountFromList(){
  if (!cartCount) return;
  const total = Object.values(list).reduce((a,b)=>a + Number(b||0), 0);
  cartCount.textContent = total;
}
updateCartCountFromList();

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('q');
  const searchForm  = document.querySelector('form[role="search"]'); // ✅ defined
  const saved       = JSON.parse(localStorage.getItem('pdga_user') || 'null');
  const userInfo    = document.getElementById('userInfo');
  const guestInfo   = document.getElementById('guestInfo');

  // --- sign-in UI ---
  if (saved && saved.username) {
    userInfo && (userInfo.hidden = false);
    const nameEl = document.getElementById('userName');
    const tierEl = document.getElementById('userTier');
    if (nameEl) nameEl.textContent = saved.name || saved.username;
    if (tierEl) tierEl.textContent = saved.tier || '';
    document.getElementById('logoutInline')?.addEventListener('click', () => {
      localStorage.removeItem('pdga_user'); location.reload();
    });
  } else {
    guestInfo && (guestInfo.hidden = false);
  }

  // --- search ---
  function filterProducts(){
    const q = (searchInput?.value || '').toLowerCase();
    document.querySelectorAll('.product-grid article.product-card').forEach(card=>{
      const title = (card.querySelector('.flip-front h3, h3.product-name, .product-details h3, h3')?.textContent || '').toLowerCase();
      card.style.display = title.includes(q) ? '' : 'none';
    });
  }
  if (searchForm) searchForm.addEventListener('input', e=>e.preventDefault());
  if (searchInput) searchInput.addEventListener('keyup', filterProducts);

  // --- add to list (works from front/back) ---
  function getCardName(card){
    return (card.querySelector('.flip-front .product-details h3, .flip-front h3, h3.product-name, .product-details h3, h3')?.textContent || 'Unnamed Item').trim();
  }
  document.querySelectorAll('.addToList').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const card = e.target.closest('article.product-card'); if (!card) return;
      const name = getCardName(card);
      list[name] = (Number(list[name]) || 0) + 1;
      localStorage.setItem('localList', JSON.stringify(list));
      updateCartCountFromList();
    });
  });

  // --- flip sizing and handlers ---
  function sizeFlipCards(){
    document.querySelectorAll('.flip-card .flip-inner').forEach(inner=>{
      const f = inner.querySelector('.flip-front'); const b = inner.querySelector('.flip-back');
      if (!f || !b) return;
      inner.style.minHeight = '0px';
      inner.style.minHeight = Math.max(f.scrollHeight, b.scrollHeight, 440) + 'px';
    });
  }
  window.addEventListener('load', sizeFlipCards);
  window.addEventListener('resize', sizeFlipCards);

  document.querySelectorAll('.flip-card').forEach(card=>{
    card.querySelector('.show-details')?.addEventListener('click', e=>{
      e.stopPropagation(); card.classList.add('flipped'); sizeFlipCards();
    });
    card.querySelector('.close-details')?.addEventListener('click', e=>{
      e.stopPropagation(); card.classList.remove('flipped'); sizeFlipCards();
    });
  });

  // re-measure after images load
  document.querySelectorAll('.flip-card .product-image img').forEach(img=>{
    if (!img.complete) {
      img.addEventListener('load', sizeFlipCards, { once: true });
    }
  });

  // initial measure (covers already-cached images)
  sizeFlipCards();
});
