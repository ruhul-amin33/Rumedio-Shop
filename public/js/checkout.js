/* ================================================
   RumeDio Shop — checkout.js
   ================================================ */
document.addEventListener('DOMContentLoaded', () => {

  const form       = document.getElementById('checkoutForm');
  const bn         = new Intl.NumberFormat('bn-BD');

  /* ── show cart summary in checkout if container exists ── */
  const cartContainer = document.getElementById('cartContainer');
  if (cartContainer) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const deliveryCharge = parseInt(localStorage.getItem('deliveryCharge')) || 0;
    if (cart.length === 0) {
      cartContainer.innerHTML = '<p style="color:#9E9E9E;text-align:center;font-family:\'Noto Sans Bengali\',sans-serif;">কার্টে কোনো পণ্য নেই।</p>';
    } else {
      let html = `<div style="border:1px solid #E0E0E0;border-radius:8px;overflow:hidden;margin-bottom:16px;">
        <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
          <thead><tr style="background:#F8F8F8;border-bottom:1px solid #E0E0E0;">
            <th style="padding:10px 14px;text-align:left;color:#9E9E9E;font-weight:700;">পণ্য</th>
            <th style="padding:10px 14px;text-align:center;color:#9E9E9E;font-weight:700;">পরিমাণ</th>
            <th style="padding:10px 14px;text-align:right;color:#9E9E9E;font-weight:700;">মোট</th>
          </tr></thead><tbody>`;
      let sub = 0;
      cart.forEach(item => {
        const t = item.price * item.quantity;
        sub += t;
        html += `<tr style="border-bottom:1px solid #F5F5F5;">
          <td style="padding:10px 14px;color:#212121;font-family:'Noto Sans Bengali',sans-serif;">${item.name}</td>
          <td style="padding:10px 14px;text-align:center;color:#616161;">${item.quantity}</td>
          <td style="padding:10px 14px;text-align:right;color:#F57224;font-weight:600;">৳${bn.format(t)}</td>
        </tr>`;
      });
      html += `</tbody></table></div>
        <div style="display:flex;justify-content:space-between;padding:10px 14px;background:#FFF3EC;border-radius:6px;font-size:0.88rem;">
          <span style="font-family:'Noto Sans Bengali',sans-serif;">ডেলিভারি চার্জ</span>
          <span style="font-weight:600;color:#212121;">৳${bn.format(deliveryCharge)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:12px 14px;margin-top:8px;border-top:2px dashed #F0F0F0;">
          <span style="font-weight:700;font-size:0.95rem;font-family:'Noto Sans Bengali',sans-serif;">সর্বমোট</span>
          <span style="font-size:1.15rem;font-weight:800;color:#F57224;font-family:'Noto Sans Bengali',sans-serif;">৳${bn.format(sub + deliveryCharge)}</span>
        </div>`;
      cartContainer.innerHTML = html;
    }
  }

  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const cart         = JSON.parse(localStorage.getItem('cart')) || [];
    const deliveryCharge = parseInt(localStorage.getItem('deliveryCharge')) || 0;
    const deliveryArea   = localStorage.getItem('deliveryArea') || 'unknown';

    if (cart.length === 0) {
      alert('কার্ট খালি! আগে পণ্য কিনুন।');
      return;
    }

    const cartTotal          = cart.reduce((s,i)=>s+i.price*i.quantity, 0);
    const totalAmountWithCharge = cartTotal + deliveryCharge;

    /* update cartSummary before sending */
    localStorage.setItem('cartSummary', JSON.stringify({
      cartTotal, deliveryCharge, totalAmountWithCharge,
      totalQuantity: cart.reduce((s,i)=>s+i.quantity, 0)
    }));

    const submitBtn = form.querySelector('button[type="submit"]');
    const origText  = submitBtn?.innerHTML;
    if (submitBtn) {
      submitBtn.disabled  = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> অপেক্ষা করুন...';
    }

    const payload = {
      firstName:    form.firstName?.value || '',
      street:       form.street?.value    || '',
      city:         form.city?.value      || '',
      district:     form.district?.value  || '',
      phone:        form.phone?.value     || '',
      payment:      form.payment?.value   || 'ক্যাশ অন ডেলিভারি',
      cartItems:    cart,
      totalAmount:  totalAmountWithCharge,
      deliveryCharge,
      deliveryArea,
    };

    try {
      const res  = await fetch('/cart/add', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      });

      let data = {};
      try { data = await res.json(); } catch {}

      if (res.ok && data.orderId) {
        localStorage.removeItem('cart');
        localStorage.removeItem('cartSummary');
        localStorage.removeItem('deliveryCharge');
        localStorage.removeItem('deliveryArea');
        const tcParam = data.trackingCode ? '&trackingCode=' + encodeURIComponent(data.trackingCode) : '';
        window.location.href = '/thank-you?orderId=' + data.orderId + tcParam;
      } else {
        const errMsg = data.error || data.message || 'সার্ভার সমস্যা হয়েছে। আবার চেষ্টা করুন।';
        alert('অর্ডার ব্যর্থ: ' + errMsg);
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = origText; }
      }
    } catch (err) {
      console.error(err);
      alert('সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = origText; }
    }
  });
});
