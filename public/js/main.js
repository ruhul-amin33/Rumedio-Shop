/* ==========================================================
   RumeDio Shop  —  main.js
   Handles: cart count, add-to-cart, live search, quantity
   ========================================================== */
'use strict';

/* ── helpers ── */
function getCart(){ try{ return JSON.parse(localStorage.getItem('cart'))||[]; }catch{ return []; } }

function saveCart(cart){
  localStorage.setItem('cart', JSON.stringify(cart));
  const qty   = cart.reduce((s,i)=>s+i.quantity, 0);
  const price = cart.reduce((s,i)=>s+i.price*i.quantity, 0);
  localStorage.setItem('cartSummary', JSON.stringify({totalQuantity:qty, totalPrice:price}));
  updateCartCount();
}

function updateCartCount(){
  try{
    const s = JSON.parse(localStorage.getItem('cartSummary'))||{};
    const n = parseInt(s.totalQuantity)||0;
    document.querySelectorAll('#cart-count').forEach(el=>{
      el.textContent = n;
      el.style.display = n > 0 ? 'flex' : 'none';
    });
  }catch{}
}

function fmt(n){ return new Intl.NumberFormat('bn-BD').format(n); }
function esc(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* ── Add-to-Cart ── */
function handleAddToCart(e){
  e.preventDefault();
  e.stopPropagation();

  const btn   = e.currentTarget;
  const id    = btn.dataset.id;
  const name  = btn.dataset.name;
  const price = parseFloat(btn.dataset.price);
  const image = btn.dataset.image || '';

  /* support quantity input on product detail page */
  const qtyId = btn.dataset.quantityInput;
  let qty = 1;
  if(qtyId){
    const qEl = document.getElementById(qtyId);
    qty = Math.max(1, parseInt(qEl?.value)||1);
  }

  if(!id || isNaN(price)){ console.warn('add-to-cart: missing data'); return; }

  const cart = getCart();
  const existing = cart.find(i=>String(i.id)===String(id));
  if(existing){ existing.quantity += qty; }
  else{ cart.push({id, name, price, quantity:qty, image}); }
  saveCart(cart);

  /* button feedback */
  const orig = btn.innerHTML;
  const origBg = btn.style.background;
  btn.innerHTML = '<i class="fas fa-check"></i> যোগ হয়েছে!';
  btn.style.background = '#00A650';
  btn.disabled = true;

  if(window.showToast) showToast('✅ কার্টে যোগ হয়েছে!', 2000);

  setTimeout(()=>{
    btn.innerHTML = orig;
    btn.style.background = origBg || '';
    btn.disabled = false;
    window.location.href = '/cart';
  }, 700);
}

function attachAddToCart(){
  document.querySelectorAll('.add-to-cart').forEach(btn=>{
    btn.removeEventListener('click', handleAddToCart);
    btn.addEventListener('click', handleAddToCart);
  });
}

/* ── Live Search ── */
let searchTimer;

function initLiveSearch(){
  const inputs   = document.querySelectorAll('.site-search-input');
  const dropdown = document.getElementById('search-dropdown');
  if(!inputs.length || !dropdown) return;

  inputs.forEach(inp=>{
    inp.addEventListener('input', ()=>{
      clearTimeout(searchTimer);
      const q = inp.value.trim();
      if(!q){ hideDropdown(dropdown); return; }
      searchTimer = setTimeout(()=>fetchResults(q, dropdown), 280);
    });
    inp.addEventListener('keydown', e=>{
      if(e.key==='Escape') hideDropdown(dropdown);
    });
  });

  document.addEventListener('click', e=>{
    if(!e.target.closest('.search-box') && !e.target.closest('#mobile-search-bar')){
      hideDropdown(dropdown);
    }
  });
}

async function fetchResults(q, dropdown){
  showLoading(dropdown);
  try{
    const res = await fetch(`/search?q=${encodeURIComponent(q)}`);
    if(!res.ok) throw new Error('bad response');
    const products = await res.json();
    renderDropdown(products, q, dropdown);
  }catch(err){
    console.error('Search error:', err);
    hideDropdown(dropdown);
  }
}

function showLoading(dropdown){
  dropdown.innerHTML = `<div style="padding:16px;text-align:center;color:#9E9E9E;font-size:0.83rem;"><i class="fas fa-spinner fa-spin" style="color:#F57224;margin-right:6px;"></i>খুঁজছি...</div>`;
  dropdown.style.display = 'block';
}

function hideDropdown(dropdown){ if(dropdown) dropdown.style.display='none'; }

function renderDropdown(products, q, dropdown){
  if(!Array.isArray(products) || products.length===0){
    dropdown.innerHTML = `
      <div style="padding:20px;text-align:center;color:#9E9E9E;font-size:0.83rem;">
        <i class="fas fa-search" style="font-size:1.5rem;color:#E0E0E0;display:block;margin-bottom:8px;"></i>
        "<strong>${esc(q)}</strong>" এর কোনো পণ্য পাওয়া যায়নি
      </div>`;
    dropdown.style.display = 'block';
    return;
  }

  const items = products.slice(0,6).map(p=>{
    let img = 'default.jpg';
    try{ img = JSON.parse(p.image_name)[0]||'default.jpg'; }catch{}
    const hasDiscount = p.is_discount_enabled && p.discounted_price;
    const priceHtml = hasDiscount
      ? `<span style="color:#F57224;font-weight:700;">৳${fmt(p.discounted_price)}</span>
         <span style="color:#9E9E9E;text-decoration:line-through;font-size:0.72rem;margin-left:4px;">৳${fmt(p.price)}</span>`
      : `<span style="color:#F57224;font-weight:700;">৳${fmt(p.price)}</span>`;
    return `
      <a href="/products/${p.id}"
        style="display:flex;align-items:center;gap:11px;padding:9px 14px;border-bottom:1px solid #F5F5F5;transition:background 0.12s;"
        onmouseover="this.style.background='#FFF3EC'" onmouseout="this.style.background='transparent'">
        <img src="/images/${esc(img)}" style="width:42px;height:42px;object-fit:cover;border-radius:6px;flex-shrink:0;border:1px solid #F0F0F0;" loading="lazy">
        <div style="flex:1;min-width:0;">
          <p style="margin:0 0 3px;font-size:0.84rem;font-weight:600;color:#212121;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:'Noto Sans Bengali',sans-serif;">${esc(p.name)}</p>
          <div>${priceHtml}</div>
        </div>
        <i class="fas fa-chevron-right" style="color:#E0E0E0;font-size:0.7rem;flex-shrink:0;"></i>
      </a>`;
  }).join('');

  const viewAll = `
    <a href="/search?q=${encodeURIComponent(q)}"
      style="display:block;text-align:center;padding:9px;font-size:0.81rem;font-weight:600;color:#F57224;background:#FFF3EC;border-top:1px solid #F0F0F0;"
      onmouseover="this.style.background='#FFE8D6'" onmouseout="this.style.background='#FFF3EC'">
      সব ${products.length}টি ফলাফল দেখুন →
    </a>`;

  dropdown.innerHTML = items + viewAll;
  dropdown.style.display = 'block';
}

/* ── Search Results Page ── */
function initSearchPage(){
  const container = document.getElementById('search-results-container');
  const heading   = document.getElementById('search-results-heading');
  if(!container) return;

  const params = new URLSearchParams(window.location.search);
  const q = params.get('q')||'';
  if(!q){ container.innerHTML = renderEmpty('কোনো সার্চ টার্ম দেওয়া হয়নি'); return; }

  if(heading) heading.textContent = `"${q}" এর ফলাফল`;
  container.innerHTML = `<div style="text-align:center;padding:48px;color:#9E9E9E;"><i class="fas fa-spinner fa-spin" style="font-size:2rem;color:#F57224;"></i></div>`;

  fetch(`/search?q=${encodeURIComponent(q)}`)
    .then(r=>r.json())
    .then(products=>{
      if(!products.length){
        container.innerHTML = renderEmpty(`"${q}" এর কোনো পণ্য পাওয়া যায়নি`);
        return;
      }
      container.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;">
          ${products.map(p=>{
            let img='default.jpg';
            try{ img=JSON.parse(p.image_name)[0]||'default.jpg'; }catch{}
            const hasD = p.is_discount_enabled && p.discounted_price;
            const saveP = hasD ? Math.round((p.price-p.discounted_price)/p.price*100) : 0;
            return `
              <a href="/products/${p.id}"
                style="background:#fff;border-radius:8px;overflow:hidden;border:1px solid #E0E0E0;display:flex;flex-direction:column;transition:all 0.22s;position:relative;box-shadow:0 2px 8px rgba(0,0,0,0.05);"
                onmouseover="this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)';this.style.transform='translateY(-3px)';this.style.borderColor='#F57224'"
                onmouseout="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)';this.style.transform='translateY(0)';this.style.borderColor='#E0E0E0'">
                ${hasD?`<div style="position:absolute;top:8px;left:8px;background:#E8192C;color:#fff;font-size:0.67rem;font-weight:700;padding:2px 7px;border-radius:3px;z-index:2;">-${saveP}%</div>`:''}
                <div style="aspect-ratio:1;overflow:hidden;background:#F9F9F9;">
                  <img src="/images/${esc(img)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;transition:transform 0.35s;"
                    onmouseover="this.style.transform='scale(1.07)'" onmouseout="this.style.transform='scale(1)'">
                </div>
                <div style="padding:11px;flex:1;display:flex;flex-direction:column;">
                  <p style="margin:0 0 8px;font-size:0.86rem;font-weight:600;color:#212121;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-family:'Noto Sans Bengali',sans-serif;">${esc(p.name)}</p>
                  <div style="margin-bottom:9px;">
                    ${hasD
                      ? `<p style="margin:0 0 1px;font-size:0.73rem;color:#9E9E9E;text-decoration:line-through;">৳${fmt(p.price)}</p>
                         <p style="margin:0;font-size:1.05rem;font-weight:700;color:#F57224;">৳${fmt(p.discounted_price)}</p>`
                      : `<p style="margin:0;font-size:1.05rem;font-weight:700;color:#F57224;">৳${fmt(p.price)}</p>`
                    }
                  </div>
                  <button class="add-to-cart"
                    data-id="${p.id}" data-name="${esc(p.name)}"
                    data-price="${hasD?p.discounted_price:p.price}"
                    data-image="/images/${esc(img)}"
                    onclick="event.preventDefault();event.stopPropagation();"
                    style="background:#F57224;color:#fff;border:none;border-radius:4px;padding:8px;font-size:0.8rem;font-weight:600;cursor:pointer;width:100%;margin-top:auto;font-family:'Noto Sans Bengali',sans-serif;"
                    onmouseover="this.style.background='#D4601A'" onmouseout="this.style.background='#F57224'">
                    <i class="fas fa-cart-plus" style="margin-right:4px;"></i> কিনুন
                  </button>
                </div>
              </a>`;
          }).join('')}
        </div>`;
      attachAddToCart(); // re-attach after dynamic render
    })
    .catch(()=>{ container.innerHTML = renderEmpty('সার্চ করতে সমস্যা হয়েছে'); });
}

function renderEmpty(msg){
  return `<div style="text-align:center;padding:60px 20px;color:#9E9E9E;">
    <i class="fas fa-search" style="font-size:2.5rem;color:#E0E0E0;display:block;margin-bottom:14px;"></i>
    <p style="font-size:0.92rem;font-family:'Noto Sans Bengali',sans-serif;">${msg}</p>
    <a href="/products/category/all" style="display:inline-block;margin-top:14px;background:#F57224;color:#fff;padding:10px 22px;border-radius:4px;font-size:0.86rem;font-weight:600;">সব পণ্য দেখুন</a>
  </div>`;
}

/* ── DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded', ()=>{
  updateCartCount();
  attachAddToCart();
  initLiveSearch();
  initSearchPage();
});
