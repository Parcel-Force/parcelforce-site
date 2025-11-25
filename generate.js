// generate.js — local-only invoice generator (Firebase removed)
// Saves invoices to localStorage and redirects to receipt.html?ref=<id>

(function () {
  const form = document.getElementById('invoiceForm');
  const senderName = document.getElementById('senderName');
  const senderEmail = document.getElementById('senderEmail');
  const senderContact = document.getElementById('senderContact');
  const recipientName = document.getElementById('recipientName');
  const recipientEmail = document.getElementById('recipientEmail');
  const recipientContact = document.getElementById('recipientContact');
  const itemDescription = document.getElementById('itemDescription');
  const itemQty = document.getElementById('itemQty');
  const itemPrice = document.getElementById('itemPrice');
  const subtotalPreview = document.getElementById('subtotalPreview');
  const vatPreview = document.getElementById('vatPreview');
  const totalPreview = document.getElementById('totalPreview');
  const statusEl = document.getElementById('status');
  const zoneEl = document.getElementById('zone');
  const adminNotes = document.getElementById('adminNotes');
  const errorMsg = document.getElementById('errorMsg');
  const successBanner = document.getElementById('successBanner');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const generateBtn = document.getElementById('generateBtn');

  const STORAGE_KEY = 'pf_invoices';

  function formatCurrency(n) {
    return '£' + Number(n || 0).toFixed(2);
  }

  function calculatePreview() {
    const qty = Number(itemQty.value) || 0;
    const price = Number(itemPrice.value) || 0;
    const subtotal = qty * price;
    const vat = subtotal * 0.2;
    const total = subtotal + vat;
    subtotalPreview.textContent = formatCurrency(subtotal);
    vatPreview.textContent = formatCurrency(vat);
    totalPreview.textContent = formatCurrency(total);
    return { subtotal, vat, total };
  }

  // live preview updates
  [itemQty, itemPrice].forEach(el => el.addEventListener('input', calculatePreview));
  // initial preview
  calculatePreview();

  function showError(text) {
    errorMsg.style.display = 'block';
    errorMsg.textContent = text;
    errorMsg.focus && errorMsg.focus();
  }
  function clearError() {
    errorMsg.style.display = 'none';
    errorMsg.textContent = '';
  }

  function setLoading(on = true) {
    if (on) {
      loadingSpinner.style.display = 'block';
      loadingSpinner.setAttribute('aria-hidden', 'false');
      generateBtn.disabled = true;
      generateBtn.setAttribute('aria-busy', 'true');
    } else {
      loadingSpinner.style.display = 'none';
      loadingSpinner.setAttribute('aria-hidden', 'true');
      generateBtn.disabled = false;
      generateBtn.removeAttribute('aria-busy');
    }
  }

  function readInvoices() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }
  function saveInvoiceObject(inv) {
    const list = readInvoices();
    list.unshift(inv);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) { console.warn('save failed', e); }
  }

  function generateId() {
    const t = Date.now().toString(36);
    const r = Math.random().toString(36).slice(2, 8);
    return `${t}-${r}`.toUpperCase();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();
    successBanner.style.display = 'none';

    // HTML5 validation
    if (!form.checkValidity()) {
      showError('Please fill in all required fields correctly.');
      return;
    }

    // Extra validation
    if (!itemDescription.value.trim()) {
      showError('Please describe the item.');
      itemDescription.focus();
      return;
    }

    const { subtotal, vat, total } = calculatePreview();

    const invoice = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      sender: {
        name: senderName.value.trim(),
        email: senderEmail.value.trim(),
        contact: senderContact.value.trim()
      },
      recipient: {
        name: recipientName.value.trim(),
        email: recipientEmail.value.trim(),
        contact: recipientContact.value.trim()
      },
      item: {
        description: itemDescription.value.trim(),
        qty: Number(itemQty.value) || 0,
        unitPrice: Number(itemPrice.value) || 0,
        subtotal,
        vat,
        total
      },
      delivery: {
        status: statusEl.value,
        zone: zoneEl.value.trim()
      },
      adminNotes: adminNotes.value.trim(),
      createdBy: (localStorage.getItem('pf_current_user') ? JSON.parse(localStorage.getItem('pf_current_user')).email : 'local')
    };

    // Save locally (demo mode)
    setLoading(true);
    try {
      // simulate small delay
      await new Promise(r => setTimeout(r, 600));
      saveInvoiceObject(invoice);
      successBanner.style.display = 'block';
      // redirect to receipt with ref param so receipt page can show it
      setTimeout(() => {
        window.location.href = `receipt.html?ref=${encodeURIComponent(invoice.id)}`;
      }, 900);
    } catch (err) {
      console.error('Save invoice error', err);
      showError('Failed to save invoice locally. Try again.');
    } finally {
      setLoading(false);
    }
  });

  // accessibility: clear error on input
  Array.from(form.elements).forEach(el => {
    el.addEventListener('input', () => clearError());
  });

  // expose helper for dev: download latest invoice as JSON (optional)
  window.downloadLastInvoice = function () {
    const list = readInvoices();
    if (!list || list.length === 0) return alert('No invoices to download');
    const data = JSON.stringify(list[0], null, 2);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    a.download = `${list[0].id}.json`;
    a.click();
  };

  // set form defaults if needed
  document.addEventListener('DOMContentLoaded', () => {
    // Pre-fill sender if demo user exists
    try {
      const u = JSON.parse(localStorage.getItem('pf_current_user') || 'null');
      if (u && u.email) {
        senderEmail.value = u.email;
        senderName.value = u.name || u.email.split('@')[0];
      }
    } catch (e) { /* ignore */ }
    calculatePreview();
  });
})();