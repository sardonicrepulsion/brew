document.documentElement.classList.add('js');

    (() => {
      'use strict';

      // ─── Helpers ──────────────────────────────────────────────────────
      const $ = (sel, scope = document) => scope.querySelector(sel);
      const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

      // Build elements safely — never mixes dynamic strings into HTML.
      const el = (tag, props = {}, children = []) => {
        const node = document.createElement(tag);
        for (const [key, value] of Object.entries(props)) {
          if (key === 'class') node.className = value;
          else if (key === 'dataset') Object.assign(node.dataset, value);
          else if (key in node) node[key] = value;
          else node.setAttribute(key, value);
        }
        for (const child of [].concat(children)) {
          if (child == null) continue;
          node.append(child instanceof Node ? child : document.createTextNode(String(child)));
        }
        return node;
      };

      // ─── Static menu data ─────────────────────────────────────────────
      const menuData = {
        coffee: [
          { name: 'Espresso', desc: 'Sladký profil, 18 g vstup, 36 g výstup.', price: '2,20 €', labels: ['arabica', 'classic'] },
          { name: 'Espresso tonic', desc: 'Domáci grepový tonic, ľad, dvojité espresso.', price: '4,20 €', labels: ['cold', 'signature'] },
          { name: 'Cappuccino', desc: 'Krémové, 160 ml, plnotučné alebo ovsené mlieko.', price: '3,10 €', labels: ['milk'] },
          { name: 'Flat white', desc: 'Dvojité espresso, 150 ml, výraznejšia chuť kávy.', price: '3,60 €', labels: ['favorite'] },
          { name: 'Batch brew', desc: 'Denne iný filter, rýchly a čistý.', price: '2,90 €', labels: ['filter'] },
          { name: 'V60 na objednávku', desc: 'Ručný filter pre 1–2 osoby, podľa aktuálnej kávy.', price: '4,80 €', labels: ['slow bar'] },
          { name: 'Cold brew', desc: '18 hodín lúhované, jemné a čokoládové.', price: '3,50 €', labels: ['cold'] },
          { name: 'Kakao s chilli', desc: 'Poctivé kakao, štipka chilli, šľahačka voliteľne.', price: '3,40 €', labels: ['sweet'] }
        ],
        beer: [
          { name: 'Domáci ležiak 12°', desc: 'Čistý, chlebový, jemne horký. 0,4 l.', price: '3,40 €', labels: ['tap 1'] },
          { name: 'West Coast IPA', desc: 'Borovica, citrus, vyššia horkosť. 0,4 l.', price: '4,20 €', labels: ['tap 2', 'hoppy'] },
          { name: 'Hazy APA', desc: 'Mäkké telo, tropické ovocie, nižšia horkosť. 0,4 l.', price: '3,90 €', labels: ['tap 3'] },
          { name: 'Sour malina & limeta', desc: 'Svieže kyslé pivo na štart večera. 0,3 l.', price: '4,50 €', labels: ['tap 4'] },
          { name: 'Stout s kávou', desc: 'Pražené tóny, kakao, jemná sladkosť. 0,3 l.', price: '4,80 €', labels: ['tap 5'] },
          { name: 'Nealko craft pale ale', desc: 'Chmeľové nealko, ktoré nechutí ako kompromis. 0,33 l.', price: '3,20 €', labels: ['0.0 %'] }
        ],
        snacks: [
          { name: 'Nachos Break Bowl', desc: 'Tortilla chipsy, cheddar, jalapeño, salsa, kyslá smotana.', price: '6,50 €', labels: ['sharing'] },
          { name: 'Pivná doska', desc: 'Syry, klobáska, horčica, kyslé uhorky, chlieb.', price: '12,90 €', labels: ['2–3 osoby'] },
          { name: 'Panini prosciutto', desc: 'Prosciutto, mozzarella, rukola, bazalkové pesto.', price: '5,90 €', labels: ['warm'] },
          { name: 'Veggie panini', desc: 'Grilovaná zelenina, syr, sušené paradajky.', price: '5,70 €', labels: ['veggie'] },
          { name: 'Pražené mandle', desc: 'Rozmarín, údená paprika, morská soľ.', price: '3,20 €', labels: ['snack'] },
          { name: 'Brownie ku káve', desc: 'Horká čokoláda, lieskové orechy, šľahačka podľa chuti.', price: '3,40 €', labels: ['sweet'] }
        ],
        billiard: [
          { name: 'Biliard do 17:00', desc: 'Po–Št, pokojnejší čas. Cena za stôl.', price: '8 € / h', labels: ['day'] },
          { name: 'Biliard po 17:00', desc: 'Po–Št večerný tarif. Cena za stôl.', price: '10 € / h', labels: ['evening'] },
          { name: 'Víkend & sviatky', desc: 'Piatok až nedeľa a sviatky. Odporúčaná rezervácia.', price: '12 € / h', labels: ['prime'] },
          { name: 'Študentský happy hour', desc: 'Utorok a streda 15:00–18:00 po predložení ISIC.', price: '6 € / h', labels: ['student'] }
        ]
      };

      const tableLabels = {
        any: 'Akýkoľvek voľný stôl',
        A: 'Stôl A — bližšie k baru',
        B: 'Stôl B — pokojnejší roh'
      };

      // ─── Header scroll state ──────────────────────────────────────────
      const header = $('[data-header]');
      const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 16);
      window.addEventListener('scroll', updateHeader, { passive: true });
      updateHeader();

      // ─── Mobile nav toggle ────────────────────────────────────────────
      const menuToggle = $('[data-menu-toggle]');
      const navLinks = $('[data-nav-links]');

      const setMenu = (open) => {
        document.body.classList.toggle('menu-open', open);
        menuToggle.setAttribute('aria-expanded', String(open));
        menuToggle.setAttribute('aria-label', open ? 'Zatvoriť menu' : 'Otvoriť menu');
      };
      menuToggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
      navLinks.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
      });

      // ─── Toast ────────────────────────────────────────────────────────
      const toast = $('[data-toast]');
      let toastTimer = 0;
      const showToast = (message) => {
        toast.textContent = message;
        toast.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3600);
      };

      // ─── Opening hours status ─────────────────────────────────────────
      const openingHours = {
        0: [10, 22], 1: [9, 23], 2: [9, 23], 3: [9, 23],
        4: [9, 23], 5: [9, 25], 6: [9, 25]
      };
      const formatHour = (h) => {
        const norm = h >= 24 ? h - 24 : h;
        return `${String(norm).padStart(2, '0')}:00`;
      };
      const setOpeningStatus = () => {
        const openStatus = $('[data-open-status]');
        const openDot = $('[data-open-dot]');
        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours() + now.getMinutes() / 60;

        // Still inside yesterday's overnight window? (e.g., Saturday 00:30 → Friday closes 01:00)
        const [, yClose] = openingHours[(day + 6) % 7];
        if (yClose > 24 && hour + 24 < yClose) {
          openStatus.textContent = `Ešte otvorené do ${formatHour(yClose)}`;
          openDot.classList.remove('is-closed');
          return;
        }

        const [open, close] = openingHours[day];
        const todayClose = close > 24 ? 24 : close;
        const isOpen = hour >= open && hour < todayClose;

        if (isOpen) {
          openStatus.textContent = `Dnes otvorené do ${formatHour(close)}`;
          openDot.classList.remove('is-closed');
        } else if (hour < open) {
          openStatus.textContent = `Dnes otvárame o ${formatHour(open)}`;
          openDot.classList.add('is-closed');
        } else {
          const [tOpen] = openingHours[(day + 1) % 7];
          openStatus.textContent = `Otvárame zajtra o ${formatHour(tOpen)}`;
          openDot.classList.add('is-closed');
        }
      };
      setOpeningStatus();

      // ─── Today's date label on bar board ──────────────────────────────
      const todayLabel = $('[data-today-date]');
      if (todayLabel) {
        const days = ['nedeľa', 'pondelok', 'utorok', 'streda', 'štvrtok', 'piatok', 'sobota'];
        const today = new Date();
        todayLabel.textContent = `${days[today.getDay()]} · ${today.getDate()}. ${today.getMonth() + 1}.`;
      }

      // ─── Menu rendering (DOM-safe, no innerHTML) ──────────────────────
      const menuGrid = $('[data-menu-grid]');
      const menuPanel = $('#menu-panel');
      const menuTabs = $$('.menu-tab');

      const renderMenu = (category) => {
        const items = menuData[category] || menuData.coffee;
        menuGrid.replaceChildren(
          ...items.map(item => el('article', { class: 'menu-item' }, [
            el('div', { class: 'menu-item-top' }, [
              el('h4', {}, item.name),
              el('strong', {}, item.price)
            ]),
            el('p', {}, item.desc),
            el('div', { class: 'menu-labels' },
              item.labels.map(label => el('span', { class: 'mini-label' }, label))
            )
          ]))
        );
      };

      const activateTab = (tab) => {
        menuTabs.forEach(t => {
          const active = t === tab;
          t.setAttribute('aria-selected', String(active));
          t.tabIndex = active ? 0 : -1;
        });
        menuPanel.setAttribute('aria-labelledby', tab.id);
        renderMenu(tab.dataset.menuCategory);
      };

      menuTabs.forEach(tab => {
        tab.addEventListener('click', () => activateTab(tab));
        tab.addEventListener('keydown', (e) => {
          const idx = menuTabs.indexOf(tab);
          let next = -1;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % menuTabs.length;
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx - 1 + menuTabs.length) % menuTabs.length;
          else if (e.key === 'Home') next = 0;
          else if (e.key === 'End') next = menuTabs.length - 1;
          if (next >= 0) {
            e.preventDefault();
            menuTabs[next].focus();
            activateTab(menuTabs[next]);
          }
        });
      });
      renderMenu('coffee');

      // ─── Reservation form ─────────────────────────────────────────────
      const form = $('#booking-form');
      const dateInput = $('#date');
      const timeInput = $('#time');
      const durationInput = $('#duration');
      const summaryRate = $('[data-summary-rate]');
      const summaryDuration = $('[data-summary-duration]');
      const summaryTotal = $('[data-summary-total]');

      const formatDate = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };
      dateInput.min = formatDate(new Date());
      if (!dateInput.value) dateInput.value = formatDate(new Date());

      const dayOf = (dateString) => new Date(`${dateString}T12:00:00`).getDay();

      const generateTimeSlots = () => {
        const day = dateInput.value ? dayOf(dateInput.value) : new Date().getDay();
        const [open, close] = openingHours[day];
        const startHour = Math.max(10, open);
        const lastStart = close - 1;
        const previous = timeInput.value;
        timeInput.replaceChildren(el('option', { value: '' }, 'Vyber čas'));
        for (let h = startHour; h <= lastStart; h++) {
          const value = `${String(h % 24).padStart(2, '0')}:00`;
          timeInput.append(el('option', { value }, value));
        }
        if ([...timeInput.options].some(opt => opt.value === previous)) {
          timeInput.value = previous;
        }
      };
      generateTimeSlots();
      dateInput.addEventListener('change', () => {
        generateTimeSlots();
        updateSummary();
      });

      const fitsInOpenHours = (dateValue, timeValue, duration) => {
        if (!dateValue || !timeValue) return true;
        const [, close] = openingHours[dayOf(dateValue)];
        const startHour = Number(timeValue.split(':')[0]);
        return startHour + duration <= close;
      };

      const formMounted = Date.now();

      const calculateRate = () => {
        const dateValue = dateInput.value ? new Date(`${dateInput.value}T12:00:00`) : new Date();
        const day = dateValue.getDay();
        const time = timeInput.value || '18:00';
        const hour = Number(time.split(':')[0]);
        const isWeekend = day === 0 || day === 5 || day === 6;
        const isStudentHour = (day === 2 || day === 3) && hour >= 15 && hour < 18;
        if (isStudentHour) return 6;
        if (isWeekend) return 12;
        return hour < 17 ? 8 : 10;
      };

      const formatPrice = (n) => {
        const value = n.toFixed(2).replace('.', ',');
        return value.endsWith(',00') ? value.slice(0, -3) : value;
      };

      const updateSummary = () => {
        const rate = calculateRate();
        const duration = Number(durationInput.value || 2);
        summaryRate.textContent = `${rate} € / h`;
        summaryDuration.textContent = `${String(duration).replace('.', ',')} h`;
        summaryTotal.textContent = `${formatPrice(rate * duration)} €`;
      };
      [timeInput, durationInput].forEach(input => input.addEventListener('change', updateSummary));
      updateSummary();

      $('[data-fill-demo]').addEventListener('click', () => {
        $('#name').value = 'Martin';
        $('#phone').value = '+421 948 235 114';
        dateInput.value = formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000));
        generateTimeSlots();
        timeInput.value = '19:00';
        durationInput.value = '2';
        $('#players').value = '4';
        $('#table').value = 'B';
        $('#note').value = 'Radi by sme aj 4 miesta na sedenie pri stole.';
        updateSummary();
        showToast('Ukážkové údaje sú vyplnené.');
      });

      const warning = $('[data-form-warning]');
      const success = $('[data-form-success]');
      const showAlert = (node, message) => {
        node.textContent = message;
        node.classList.add('is-visible');
      };
      const hideAlert = (node) => {
        node.textContent = '';
        node.classList.remove('is-visible');
      };

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        hideAlert(warning);
        hideAlert(success);

        // Honeypot — silently pretend success.
        if ($('#company').value.trim() !== '') {
          showAlert(success, 'Ďakujeme. Potvrdenie pošleme do hodiny.');
          return;
        }
        // Time-to-fill heuristic.
        if (Date.now() - formMounted < 800) {
          showAlert(warning, 'Skontrolujte, prosím, údaje a skúste to znova.');
          return;
        }

        if (!form.checkValidity()) {
          showAlert(warning, 'Skontroluj, prosím, meno, telefón, dátum a čas rezervácie.');
          form.reportValidity();
          return;
        }

        const requestedDuration = Number(durationInput.value || 2);
        if (!fitsInOpenHours(dateInput.value, timeInput.value, requestedDuration)) {
          const [, close] = openingHours[dayOf(dateInput.value)];
          showAlert(warning, `V tento deň zatvárame o ${formatHour(close)}. Skús skoršie alebo kratšiu dĺžku hry.`);
          return;
        }

        const fd = new FormData(form);
        const trim = (key, max = 200) => String(fd.get(key) ?? '').trim().slice(0, max);
        const name = trim('name', 80);
        const date = trim('date');
        const time = trim('time');
        const duration = Number(trim('duration')) || 2;
        const players = trim('players');
        const tableValue = trim('table');
        const tableLabel = tableLabels[tableValue] || tableLabels.any;
        const total = formatPrice(calculateRate() * duration);
        const dateLocale = date.split('-').reverse().join('. ');

        // DOM-built — never innerHTML — so user-supplied name renders as text.
        success.replaceChildren(
          el('strong', {}, 'Ďakujeme, rezerváciu sme prijali.'),
          document.createElement('br'),
          document.createTextNode(`${name}, ${dateLocale} o ${time} · ${String(duration).replace('.', ',')} h · ${players} hráči · ${tableLabel}.`),
          document.createElement('br'),
          document.createTextNode('Predpokladaná suma '),
          el('strong', {}, `${total} €`),
          document.createTextNode('. Potvrdenie pošleme do hodiny telefonicky alebo cez SMS.')
        );
        success.classList.add('is-visible');
        showToast('Rezervácia odoslaná. Ozveme sa do hodiny.');
      });

      // ─── Lightbox (native <dialog>) ───────────────────────────────────
      const lightbox = $('[data-lightbox]');
      const lightboxImg = $('[data-lightbox-img]');
      const lightboxCaption = $('[data-lightbox-caption]');

      const lightboxPlaceholder = lightboxImg.getAttribute('src');
      const closeLightbox = () => { if (lightbox.open) lightbox.close(); };

      $('[data-gallery]').addEventListener('click', (event) => {
        const button = event.target.closest('button[data-full]');
        if (!button) return;
        const src = button.dataset.full || '';
        if (!/^https:\/\/images\.unsplash\.com\//.test(src)) return;
        lightboxImg.src = src;
        lightboxImg.alt = button.dataset.caption || 'Fotografia prevádzky';
        lightboxCaption.textContent = button.dataset.caption || '';
        if (typeof lightbox.showModal === 'function') {
          lightbox.showModal();
        } else {
          lightbox.setAttribute('open', '');
        }
      });

      $('[data-lightbox-close]').addEventListener('click', closeLightbox);
      lightbox.addEventListener('mousedown', (event) => {
        if (event.target === lightbox) closeLightbox();
      });
      lightbox.addEventListener('close', () => {
        lightboxImg.src = lightboxPlaceholder;
        lightboxImg.alt = '';
        lightboxCaption.textContent = '';
      });

      // ─── Reveal on scroll ─────────────────────────────────────────────
      const revealEls = $$('.reveal');
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          }
        }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
        revealEls.forEach((node, i) => {
          node.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`;
          observer.observe(node);
        });
      } else {
        revealEls.forEach(node => node.classList.add('is-visible'));
      }

      // ─── Active link in nav based on scroll ───────────────────────────
      const sectionIds = ['kava', 'biliard', 'menu', 'rezervacia', 'kontakt'];
      const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
      if ('IntersectionObserver' in window) {
        const navObserver = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const id = entry.target.id;
            $$('.nav-links a').forEach(link => {
              link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
          }
        }, { rootMargin: '-42% 0px -50% 0px' });
        sections.forEach(s => navObserver.observe(s));
      }

      // ─── Event datetime — next occurrence ─────────────────────────────
      const pad = (n) => String(n).padStart(2, '0');
      const toIsoLocal = (date, time) => {
        const [h, m] = time.split(':').map(Number);
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(h)}:${pad(m)}`;
      };
      const nextWeekday = (from, target) => {
        const result = new Date(from.getFullYear(), from.getMonth(), from.getDate());
        const diff = ((target - result.getDay()) + 7) % 7;
        result.setDate(result.getDate() + (diff || 7));
        return result;
      };
      const lastWeekdayOfMonth = (from, target) => {
        const tryMonth = (offset) => {
          const d = new Date(from.getFullYear(), from.getMonth() + offset + 1, 0);
          while (d.getDay() !== target) d.setDate(d.getDate() - 1);
          return d;
        };
        let d = tryMonth(0);
        if (d <= from) d = tryMonth(1);
        return d;
      };
      $$('[data-event-pattern]').forEach(node => {
        const pattern = node.dataset.eventPattern;
        const time = node.dataset.eventTime || '00:00';
        const now = new Date();
        let date;
        if (pattern.startsWith('weekly:')) {
          date = nextWeekday(now, Number(pattern.split(':')[1]));
        } else if (pattern.startsWith('last-weekday:')) {
          date = lastWeekdayOfMonth(now, Number(pattern.split(':')[1]));
        }
        if (date) node.setAttribute('datetime', toIsoLocal(date, time));
      });

      // ─── Misc ─────────────────────────────────────────────────────────
      $('[data-year]').textContent = new Date().getFullYear();

      // Demo availability — deterministic per-day so the bar board feels alive.
      const tableOptions = [
        ['voľný od 16:00', 'rezervovaný 18:00–20:00', 'voľný po 20:30'],
        ['voľný od 18:30', 'voľný od 17:00', 'rezervovaný do 19:00']
      ];
      const dayPick = Math.floor(Date.now() / 86400000) % 3;
      $('[data-table-a]').textContent = tableOptions[0][dayPick];
      $('[data-table-b]').textContent = tableOptions[1][dayPick];
    })();
