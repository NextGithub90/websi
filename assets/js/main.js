// Basic site interactions and WhatsApp flows + Finance tabs
(function () {
const WHATSAPP_NUMBER = '6281284415836'; // Change to your number without '+'

  function openWhatsApp(message) {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  function formToMessage(form, title) {
    const data = new FormData(form);
    const lines = [
      `${title}`,
      `Name: ${data.get('name') || '-'} `,
      `Email: ${data.get('email') || '-'} `,
      `WhatsApp: ${data.get('whatsapp') || '-'} `,
      `Country: ${data.get('country') || '-'} `,
      `Business: ${data.get('business') || '-'} `,
      `Budget: ${data.get('budget') || '-'} `,
      `Message: ${data.get('message') || '-'} `,
    ];
    return lines.join('\n');
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Init AOS
    if (window.AOS) {
      AOS.init({ duration: 700, once: true, easing: 'ease-out' });
    }

    // Modern navbar: shrink/elevate on scroll
    const nav = document.querySelector('.navbar');
    const setNavScrolled = () => {
      if (!nav) return;
      const scrolled = window.scrollY > 8;
      nav.classList.toggle('navbar-scrolled', scrolled);
    };
    setNavScrolled();
    window.addEventListener('scroll', setNavScrolled, { passive: true });

    // Scroll reveal without external lib
    const revealTargets = document.querySelectorAll('.card, .list-group-item, .accordion-item, .hero-visual, section .h3, .feature-item');
    revealTargets.forEach(el => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('reveal-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(el => io.observe(el));

    // Year in footer
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();

    // Product buy buttons
    document.querySelectorAll('.btn-buy').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const product = btn.getAttribute('data-product') || 'Product';
        const msg = `Hi! I am interested in ${product}. Please share details and pricing.`;
        openWhatsApp(msg);
      });
    });

    // Consultation form
    const consultationForm = document.getElementById('consultationForm');
    if (consultationForm) {
      consultationForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const msg = formToMessage(consultationForm, 'New Consultation Request');
        openWhatsApp(msg);
      });
    }

    // Contact form
    const contactForm = document.getElementById('contactForm');
    const contactWhatsapp = document.getElementById('contactWhatsapp');
    if (contactForm) {
      contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const msg = formToMessage(contactForm, 'New Contact Inquiry');
        openWhatsApp(msg);
      });
    }
    if (contactWhatsapp && contactForm) {
      contactWhatsapp.addEventListener('click', function () {
        const msg = formToMessage(contactForm, 'New Contact via WhatsApp');
        openWhatsApp(msg);
      });
    }

    // ---- Finance per unit (tabs: income/expense) ----
    const incomeData = [
      { unit: 'Laundry', tahun: 2023, sumber: 'APBN - BOS Tahap 1', jumlah: 'Rp 68.880.000', ket: 'Dana BOS Tahap 1' },
      { unit: 'Laundry', tahun: 2023, sumber: 'APBN - BOS Tahap 2', jumlah: 'Rp 72.160.000', ket: 'Dana BOS Tahap 2' }
    ];
    const expenseData = [
      { unit: 'Water Refill', tahun: 2024, sumber: 'Pembelian Mesin', jumlah: 'Rp 95.000.000', ket: 'Equipment' },
      { unit: 'Kost', tahun: 2024, sumber: 'Furnishing', jumlah: 'Rp 45.000.000', ket: 'Meubel & Interior' }
    ];

    const incomeTbody = document.getElementById('incomeTbody');
    const expenseTbody = document.getElementById('expenseTbody');
    const unitSelect = document.getElementById('financeUnit');
    const searchInput = document.getElementById('financeSearch');
    const financeForm = document.getElementById('financeForm');
    let activeCategory = 'income';

    function renderFinance() {
      const unit = unitSelect ? unitSelect.value : 'All';
      const query = (searchInput ? searchInput.value : '').toLowerCase();
      const dataset = activeCategory === 'income' ? incomeData : expenseData;
      const rows = dataset
        .filter(r => unit === 'All' || r.unit === unit)
        .filter(r => {
          const text = `${r.tahun} ${r.sumber} ${r.jumlah} ${r.ket}`.toLowerCase();
          return text.includes(query);
        });
      const target = activeCategory === 'income' ? incomeTbody : expenseTbody;
      if (!target) return;
      target.innerHTML = rows.map((r, idx) => `
        <tr>
          <td>${r.tahun}</td>
          <td>${r.sumber}</td>
          <td>${r.jumlah}</td>
          <td>${r.ket}</td>
          <td>
            <button class="btn btn-light btn-sm me-2" data-cat="${activeCategory}" data-edit="${idx}"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-light btn-sm" data-cat="${activeCategory}" data-del="${idx}"><i class="bi bi-trash"></i></button>
          </td>
        </tr>
      `).join('');

      // Bind actions
      target.querySelectorAll('[data-del]').forEach(btn => {
        btn.addEventListener('click', function () {
          const i = parseInt(btn.getAttribute('data-del'), 10);
          const cat = btn.getAttribute('data-cat');
          const arr = cat === 'income' ? incomeData : expenseData;
          arr.splice(i, 1);
          renderFinance();
        });
      });
      target.querySelectorAll('[data-edit]').forEach(btn => {
        btn.addEventListener('click', function () {
          const i = parseInt(btn.getAttribute('data-edit'), 10);
          const cat = btn.getAttribute('data-cat');
          const arr = cat === 'income' ? incomeData : expenseData;
          const item = arr[i];
          const modalEl = document.getElementById('modalTambah');
          const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
          // Prefill
          financeForm.unit.value = item.unit;
          financeForm.tahun.value = item.tahun;
          financeForm.sumber.value = item.sumber;
          financeForm.jumlah.value = item.jumlah;
          financeForm.ket.value = item.ket;
          financeForm.setAttribute('data-edit-index', i);
          financeForm.setAttribute('data-category', cat);
          modal.show();
        });
      });
    }

    renderFinance();
    if (unitSelect) unitSelect.addEventListener('change', renderFinance);
    if (searchInput) searchInput.addEventListener('input', renderFinance);

    // Switch tabs
    const incomeTab = document.getElementById('income-tab');
    const expenseTab = document.getElementById('expense-tab');
    [incomeTab, expenseTab].forEach(tab => {
      if (!tab) return;
      tab.addEventListener('shown.bs.tab', function (e) {
        activeCategory = e.target.id === 'income-tab' ? 'income' : 'expense';
        renderFinance();
      });
    });

    if (financeForm) {
      financeForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const fd = new FormData(financeForm);
        const newItem = {
          unit: fd.get('unit'),
          tahun: Number(fd.get('tahun')),
          sumber: fd.get('sumber'),
          jumlah: fd.get('jumlah'),
          ket: fd.get('ket')
        };
        const editIndex = financeForm.getAttribute('data-edit-index');
        const cat = financeForm.getAttribute('data-category') || activeCategory;
        const arr = cat === 'income' ? incomeData : expenseData;
        if (editIndex !== null) {
          arr[parseInt(editIndex, 10)] = newItem;
          financeForm.removeAttribute('data-edit-index');
          financeForm.removeAttribute('data-category');
        } else {
          arr.push(newItem);
        }
        const modalEl = document.getElementById('modalTambah');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        financeForm.reset();
        renderFinance();
      });
    }
  });
})();