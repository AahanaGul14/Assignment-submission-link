/* script.js
   Handles:
   - packages data + rendering
   - booking estimator + validation
   - gallery modal behavior using data-large attributes
   - active nav highlighting
*/

(() => {
  /* ------ Data: packages array ------ */
  const packages = [
    { id: 1, destination: "Kasauli", durationDays: 4, basePrice: 1200, season: "Summer" },
    { id: 2, destination: "Chakrata", durationDays: 3, basePrice: 5000, season: "Winter" },
    { id: 3, destination: "Amritsar", durationDays: 2, basePrice: 4100, season: "Spring" }
  ];

  /* ------ Utility functions ------ */
  function seasonMultiplier(season) {
    switch ((season || "").toLowerCase()) {
      case "summer": return 1.10; // +10%
      case "winter": return 1.05; // +5%
      default: return 1.0;        // no change
    }
  }

  // If reservation includes a weekend day (Sat or Sun), apply 10% weekend surcharge
  function weekendSurcharge(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 1.0;
    // loop nights and check day
    let surcharge = 0;
    const cur = new Date(checkIn);
    const end = new Date(checkOut);
    while (cur < end) {
      const day = cur.getDay(); // 0 Sun, 6 Sat
      if (day === 0 || day === 6) { surcharge = 0.10; break; }
      cur.setDate(cur.getDate() + 1);
    }
    return 1 + surcharge;
  }

  function calculateFinalPrice(pkg, checkIn=null, checkOut=null) {
    let price = pkg.basePrice;
    price *= seasonMultiplier(pkg.season);
    price *= weekendSurcharge(checkIn, checkOut);
    return Math.round(price);
  }

  /* ------ Render packages table ------ */
  function renderPackagesTable() {
    const container = document.getElementById('packagesContainer');
    if (!container) return;

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `<tr>
      <th>Destination</th><th>Duration</th><th>Base Price</th><th>Season</th><th>Final Price</th>
    </tr>`;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    packages.forEach(pkg => {
      const tr = document.createElement('tr');
      const final = calculateFinalPrice(pkg);
      tr.innerHTML = `<td>${pkg.destination}</td>
                      <td>${pkg.durationDays} Days</td>
                      <td>₹${pkg.basePrice}</td>
                      <td>${pkg.season}</td>
                      <td id="final-${pkg.id}">₹${final}</td>`;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.innerHTML = '';
    container.appendChild(table);
  }

  /* ------ Booking estimator and validation ------ */
  function initBookingForm() {
    const form = document.getElementById('bookingForm');
    if (!form) return;

    const nameInput = document.getElementById('name');
    const startInput = document.getElementById('start');
    const endInput = document.getElementById('end');
    const packageSelect = document.getElementById('packageSelect');
    const promoInput = document.getElementById('promo');
    const nightsSpan = document.getElementById('nights');
    const totalSpan = document.getElementById('total');
    const submitBtn = document.getElementById('submitBtn');

    // populate package select
    packages.forEach(pkg => {
      const opt = document.createElement('option');
      opt.value = pkg.id;
      opt.textContent = `${pkg.destination} (${pkg.durationDays}d) - ₹${pkg.basePrice}`;
      packageSelect.appendChild(opt);
    });

    function nightsBetween(a, b) {
      if (!a || !b) return 0;
      const d1 = new Date(a);
      const d2 = new Date(b);
      const diff = d2 - d1;
      if (isNaN(diff) || diff <= 0) return 0;
      return Math.round(diff / (1000*60*60*24));
    }

    function applyPromo(total, code) {
      if (!code) return total;
      switch (code.trim().toUpperCase()) {
        case 'EARLYBIRD': return Math.round(total * 0.90); // -10%
        case 'FESTIVE5': return Math.round(total * 0.95);  // example -5%
        default: return total;
      }
    }

    function computeEstimate() {
      const nights = nightsBetween(startInput.value, endInput.value);
      nightsSpan.textContent = nights;
      const pkgId = Number(packageSelect.value);
      const pkg = packages.find(p => p.id === pkgId) || packages[0];
      // Base final price per package (with season + weekend factors)
      const perPerson = calculateFinalPrice(pkg, startInput.value, endInput.value);
      // Total before promo = perPerson * nights
      let total = perPerson * Math.max(1, nights); // ensure at least 1 night if pkg chosen
      // Guests multiplier: if guests >2 +20% (we include a default of 1 guest)
      // Note: Assignment required guests multiplier — but your preference was minimal UI.
      // If you later want guests input, it can be added; currently assume 1 guest.
      // If you add a guests input in future, you can multiply here.
      // Apply promo
      total = applyPromo(total, promoInput.value);
      totalSpan.textContent = `₹${total}`;
      // disable submit if invalid
      const valid = nameInput.value.trim() !== '' &&
                    startInput.value && endInput.value &&
                    nights > 0 &&
                    packageSelect.value;
      submitBtn.disabled = !valid;
      return total;
    }

    // events
    [nameInput, startInput, endInput, packageSelect, promoInput].forEach(el => {
      el.addEventListener('change', computeEstimate);
      el.addEventListener('input', computeEstimate);
    });

    // initial compute
    computeEstimate();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const total = computeEstimate();
      if (submitBtn.disabled) return;
      alert(`Booking submitted!\nEstimated total: ₹${total}\nWe would normally send this to the server.`);
      form.reset();
      computeEstimate();
    });
  }

  /* ------ Gallery modal driven by data-large attribute ------ */
  function initGalleryModal() {
    const gallery = document.getElementById('gallery');
    const modal = document.getElementById('modal');
    const modalImage = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    const modalClose = document.getElementById('modalClose');
    if (!gallery || !modal) return;

    gallery.addEventListener('click', (e) => {
      const target = e.target.closest('img.thumb');
      if (!target) return;
      const large = target.getAttribute('data-large') || target.src;
      const alt = target.getAttribute('alt') || '';
      modalImage.src = large;
      modalImage.alt = alt;
      modalCaption.textContent = alt;
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
    });

    modalClose.addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
      modalImage.src = '';
    });

    // close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        modalImage.src = '';
      }
    });

    // Esc to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        modalImage.src = '';
      }
    });
  }

  /* ------ Active nav highlight ------ */
  function highlightActiveNav() {
    const links = document.querySelectorAll('nav a');
    const path = location.pathname.split('/').pop() || 'index.html';
    links.forEach(a => {
      const href = a.getAttribute('href');
      if (href === path) a.classList.add('active');
      else a.classList.remove('active');
    });
  }

  /* ------ On DOM ready ------ */
  document.addEventListener('DOMContentLoaded', () => {
    renderPackagesTable();
    initBookingForm();
    initGalleryModal();
    highlightActiveNav();
  });

})();
