/* ================================================
   RumeDio Shop — cart.js
   ================================================ */
document.addEventListener('DOMContentLoaded', () => {

  const radios          = document.querySelectorAll('.area-radio');
  const checkoutBtn     = document.getElementById('checkoutBtn');
  const deliveryChargeEl= document.getElementById('delivery-charge');
  const tbody           = document.getElementById('cart-items-body');
  const grandTotalEl    = document.getElementById('grand-total');
  const subtotalEl      = document.getElementById('subtotal');

  if (!tbody) return;

  const bn = new Intl.NumberFormat('bn-BD');
  let deliveryCharge = parseInt(localStorage.getItem('deliveryCharge')) || 0;

  /* ── restore saved area ── */
  const savedArea = localStorage.getItem('deliveryArea');
  if (savedArea) {
    const radio = document.querySelector(`input[value="${savedArea}"]`);
    if (radio) { radio.checked = true; deliveryCharge = savedArea === 'dhaka' ? 80 : 130; }
    if (checkoutBtn) checkoutBtn.disabled = false;
  }

  /* ── delivery radio change ── */
  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      const area = radio.value;
      deliveryCharge = area === 'dhaka' ? 80 : 130;
      localStorage.setItem('deliveryArea', area);
      localStorage.setItem('deliveryCharge', deliveryCharge);
      if (checkoutBtn) checkoutBtn.disabled = false;
      updateTotals();
    });
  });

  /* ── checkout button ── */
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (!checkoutBtn.disabled) window.location.href = '/checkout';
    });
  }

  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  /* ── render cart table ── */
  function renderCart() {
    if (cart.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" style="padding:60px 20px;text-align:center;color:#9E9E9E;">
            <i class="fas fa-shopping-cart" style="font-size:2.5rem;color:#E0E0E0;display:block;margin-bottom:12px;"></i>
            <p style="font-family:'Noto Sans Bengali',sans-serif;font-size:0.9rem;">আপনার কার্ট খালি</p>
            <a href="/products/category/all" style="display:inline-block;margin-top:12px;background:#F57224;color:#fff;padding:9px 20px;border-radius:4px;font-size:0.85rem;font-weight:600;text-decoration:none;">পণ্য কিনুন</a>
          </td>
        </tr>`;
      updateTotals();
      return;
    }

    tbody.innerHTML = cart.map(item => `
      <tr data-id="${item.id}" style="border-bottom:1px solid #F0F0F0;">
        <td style="padding:12px 16px;vertical-align:middle;">
          <div style="display:flex;align-items:center;gap:12px;">
            <img src="${item.image||'/images/default.jpg'}" loading="lazy"
              style="width:58px;height:58px;object-fit:cover;border-radius:6px;border:1px solid #F0F0F0;flex-shrink:0;">
            <div>
              <p style="margin:0 0 4px;font-size:0.88rem;font-weight:600;color:#212121;font-family:'Noto Sans Bengali',sans-serif;line-height:1.35;">${item.name}</p>
              <p style="margin:0;font-size:0.8rem;color:#9E9E9E;">৳${bn.format(item.price)} × এককটি</p>
            </div>
          </div>
        </td>
        <td style="padding:12px 16px;vertical-align:middle;text-align:center;">
          <div style="display:inline-flex;align-items:center;border:1.5px solid #E0E0E0;border-radius:6px;overflow:hidden;">
            <button class="decrease"
              style="width:32px;height:32px;background:#F5F5F5;border:none;cursor:pointer;font-size:1rem;font-weight:700;color:#616161;transition:background 0.15s;"
              onmouseover="this.style.background='#F57224';this.style.color='white'" onmouseout="this.style.background='#F5F5F5';this.style.color='#616161'">−</button>
            <span style="width:36px;text-align:center;font-size:0.9rem;font-weight:600;color:#212121;">${item.quantity}</span>
            <button class="increase"
              style="width:32px;height:32px;background:#F5F5F5;border:none;cursor:pointer;font-size:1rem;font-weight:700;color:#616161;transition:background 0.15s;"
              onmouseover="this.style.background='#F57224';this.style.color='white'" onmouseout="this.style.background='#F5F5F5';this.style.color='#616161'">+</button>
          </div>
        </td>
        <td style="padding:12px 16px;vertical-align:middle;text-align:right;">
          <div style="display:flex;align-items:center;justify-content:flex-end;gap:12px;">
            <span style="font-size:1rem;font-weight:700;color:#F57224;font-family:'Noto Sans Bengali',sans-serif;">৳${bn.format(item.price * item.quantity)}</span>
            <button class="remove-item"
              style="width:28px;height:28px;border-radius:50%;background:#FEF2F2;border:1px solid #FCA5A5;color:#DC2626;cursor:pointer;font-size:0.8rem;display:flex;align-items:center;justify-content:center;transition:all 0.15s;"
              onmouseover="this.style.background='#DC2626';this.style.color='white'" onmouseout="this.style.background='#FEF2F2';this.style.color='#DC2626'">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </td>
      </tr>`).join('');

    attachEvents();
    updateTotals();
  }

  function attachEvents() {
    tbody.querySelectorAll('.increase').forEach(btn => {
      btn.onclick = () => {
        const id = btn.closest('tr').dataset.id;
        const p  = cart.find(i => String(i.id) === String(id));
        if (p) { p.quantity++; persistAndRerender(); }
      };
    });
    tbody.querySelectorAll('.decrease').forEach(btn => {
      btn.onclick = () => {
        const id  = btn.closest('tr').dataset.id;
        const idx = cart.findIndex(i => String(i.id) === String(id));
        if (idx !== -1) {
          if (cart[idx].quantity > 1) cart[idx].quantity--;
          else cart.splice(idx, 1);
          persistAndRerender();
        }
      };
    });
    tbody.querySelectorAll('.remove-item').forEach(btn => {
      btn.onclick = () => {
        const id  = btn.closest('tr').dataset.id;
        const idx = cart.findIndex(i => String(i.id) === String(id));
        if (idx !== -1) { cart.splice(idx, 1); persistAndRerender(); }
      };
    });
  }

  function persistAndRerender() {
    localStorage.setItem('cart', JSON.stringify(cart));
    const qty   = cart.reduce((s,i)=>s+i.quantity, 0);
    const price = cart.reduce((s,i)=>s+i.price*i.quantity, 0);
    localStorage.setItem('cartSummary', JSON.stringify({totalQuantity:qty, totalPrice:price}));
    /* update cart count badge */
    document.querySelectorAll('#cart-count').forEach(el => { el.textContent = qty; el.style.display = qty>0?'flex':'none'; });
    renderCart();
  }

  function updateTotals() {
    const sub = cart.reduce((s,i)=>s+i.price*i.quantity, 0);
    if (deliveryChargeEl) deliveryChargeEl.textContent = '৳' + bn.format(deliveryCharge);
    if (subtotalEl)       subtotalEl.textContent       = '৳' + bn.format(sub);
    if (grandTotalEl)     grandTotalEl.textContent     = '৳' + bn.format(sub + deliveryCharge);

    /* disable checkout if cart empty */
    if (checkoutBtn) {
      const hasArea = !!localStorage.getItem('deliveryArea');
      checkoutBtn.disabled = cart.length === 0 || !hasArea;
      checkoutBtn.style.opacity = checkoutBtn.disabled ? '0.55' : '1';
    }
  }

  renderCart();
});
