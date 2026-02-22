/* ══════════════════════════════════════════════
   SPEEDDANSYS LANDING PAGE — JavaScript v2
   ══════════════════════════════════════════════ */


document.addEventListener('DOMContentLoaded', () => {

    // ─── CAROUSEL ───
    const track = document.getElementById('carouselTrack');
    const slides = track.children;
    const totalSlides = slides.length;
    const dotsContainer = document.getElementById('carouselDots');
    let currentSlide = 0;
    let autoplayInterval;

    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
    const dots = dotsContainer.querySelectorAll('.dot');

    function goToSlide(index) {
        currentSlide = index;
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
    }

    document.getElementById('nextBtn').addEventListener('click', () => {
        goToSlide((currentSlide + 1) % totalSlides);
        resetAutoplay();
    });
    document.getElementById('prevBtn').addEventListener('click', () => {
        goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
        resetAutoplay();
    });

    function startAutoplay() { autoplayInterval = setInterval(() => goToSlide((currentSlide + 1) % totalSlides), 5000); }
    function resetAutoplay() { clearInterval(autoplayInterval); startAutoplay(); }
    startAutoplay();

    // Touch / Swipe
    let touchStartX = 0;
    const viewport = document.querySelector('.carousel-viewport');
    viewport.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
    viewport.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? goToSlide((currentSlide + 1) % totalSlides) : goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
            resetAutoplay();
        }
    });


    // ─── BILLING TOGGLE ───
    const toggle = document.getElementById('billingToggle');
    const lblMonthly = document.getElementById('lblMonthly');
    const lblAnnual = document.getElementById('lblAnnual');
    const annualMap = { 50: 40, 90: 72, 150: 120 };

    toggle.addEventListener('change', () => {
        const isAnnual = toggle.checked;
        lblMonthly.classList.toggle('active', !isAnnual);
        lblAnnual.classList.toggle('active', isAnnual);

        document.querySelectorAll('.monthly-price').forEach(el => {
            const orig = parseInt(el.getAttribute('data-monthly') || el.textContent);
            if (!el.getAttribute('data-monthly')) el.setAttribute('data-monthly', el.textContent);
            el.textContent = isAnnual ? annualMap[orig] || orig : orig;
        });
        document.querySelectorAll('.annual-price').forEach(el => { el.style.display = isAnnual ? 'block' : 'none'; });
        document.querySelectorAll('.period').forEach(el => { el.textContent = isAnnual ? '/mes (anual)' : '/mes'; });
    });


    // ─── STATS COUNTER ───
    let statsCounted = false;
    function animateStats() {
        if (statsCounted) return;
        statsCounted = true;
        document.querySelectorAll('.stat-number').forEach(el => {
            const target = parseInt(el.getAttribute('data-target'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            const counter = setInterval(() => {
                current += step;
                if (current >= target) { current = target; clearInterval(counter); }
                el.textContent = target >= 1000 ? Math.floor(current).toLocaleString() : Math.floor(current);
            }, 16);
        });
    }

    const statsEl = document.querySelector('.stats-section');
    if (statsEl) {
        new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) animateStats(); });
        }, { threshold: 0.5 }).observe(statsEl);
    }


    // ─── SCROLL ANIMATIONS ───
    document.querySelectorAll('[data-aos]').forEach(el => {
        new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
        }, { threshold: 0.1 }).observe(el);
    });


    // ─── FAQ ACCORDION ───
    document.querySelectorAll('.faq-q').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            document.querySelectorAll('.faq-item').forEach(fi => { if (fi !== item) fi.classList.remove('open'); });
            item.classList.toggle('open');
        });
    });


    // ─── NAVBAR SCROLL ───
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => { navbar.classList.toggle('scrolled', window.scrollY > 10); });


    // ─── HAMBURGER ───
    document.getElementById('hamburger').addEventListener('click', () => {
        document.getElementById('navLinks').classList.toggle('open');
    });


    // ─── PLAN SELECTOR ───
    const planCards = document.querySelectorAll('.plan-card');
    // Empresarial empieza seleccionado
    const defaultCard = document.querySelector('.plan-card.featured');
    if (defaultCard) defaultCard.classList.add('selected');

    planCards.forEach(card => {
        card.addEventListener('click', function (e) {
            // Si el click fue en el botón "Solicitar", no cambia selección
            if (e.target.closest('a.btn')) return;
            planCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
        });
    });


    // ─── SMOOTH SCROLL ───
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return; // bare # links (logo, social placeholders) — skip
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                document.getElementById('navLinks').classList.remove('open');
            }
        });
    });
});
