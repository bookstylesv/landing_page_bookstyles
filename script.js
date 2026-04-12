/* ══════════════════════════════════════════════
   BOOKSTYLES LANDING PAGE — JavaScript v2
   ══════════════════════════════════════════════ */


document.addEventListener('DOMContentLoaded', () => {

    // ─── CAROUSEL — Infinite Loop (clone technique) ───
    // Structure after cloning:
    // [clone-last | slide0 | slide1 | ... | slide(N-1) | clone-first]
    //  pos=0        pos=1   pos=2          pos=N         pos=N+1
    // When arriving at pos=0  → snap instantly to pos=N  (same visual = last slide)
    // When arriving at pos=N+1→ snap instantly to pos=1  (same visual = first slide)

    const track = document.getElementById('carouselTrack');
    const dotsContainer  = document.getElementById('carouselDots');
    const slideCurrentNum = document.getElementById('slideCurrentNum');
    const slideTotalNum   = document.getElementById('slideTotalNum');
    const progressFill    = document.getElementById('carouselProgressFill');
    const AUTOPLAY_MS     = 5500;

    // Grab originals BEFORE cloning
    const origSlides  = Array.from(track.children);
    const totalSlides = origSlides.length;

    // Prepend clone of last slide, append clone of first slide
    track.insertBefore(origSlides[totalSlides - 1].cloneNode(true), origSlides[0]);
    track.appendChild(origSlides[0].cloneNode(true));

    let pos = 1; // position 1 = real slide 0
    let autoplayInterval;

    function pad2(n) { return String(n).padStart(2, '0'); }
    if (slideTotalNum) slideTotalNum.textContent = pad2(totalSlides);

    // Build dots (one per real slide)
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        dot.addEventListener('click', () => { moveTo(i + 1); resetAutoplay(); });
        dotsContainer.appendChild(dot);
    }
    const dots = dotsContainer.querySelectorAll('.dot');

    // Real 0-based index from track position
    function realIdx(p) { return ((p - 1) % totalSlides + totalSlides) % totalSlides; }

    function updateUI(p) {
        const ri = realIdx(p);
        dots.forEach((d, i) => d.classList.toggle('active', i === ri));
        if (slideCurrentNum) slideCurrentNum.textContent = pad2(ri + 1);
    }

    // Move track: animated = with CSS transition / false = instant snap
    function setPos(p, animated) {
        if (!animated) {
            track.style.transition = 'none';
            track.style.transform  = `translateX(-${p * 100}%)`;
            track.offsetHeight; // force reflow so 'none' is applied before next paint
        } else {
            track.style.transition = '';
            track.style.transform  = `translateX(-${p * 100}%)`;
        }
        pos = p;
    }

    // Progress bar: fill 0→100% over AUTOPLAY_MS
    function startProgressBar() {
        if (!progressFill) return;
        progressFill.style.transition = 'none';
        progressFill.style.width = '0%';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                progressFill.style.transition = `width ${AUTOPLAY_MS}ms linear`;
                progressFill.style.width = '100%';
            });
        });
    }

    // Navigate to a position with animation + update UI
    function moveTo(newPos) {
        setPos(newPos, true);
        updateUI(newPos);
        startProgressBar();
    }

    // After CSS transition ends: if we're on a clone, snap to the real slide
    track.addEventListener('transitionend', (e) => {
        if (e.propertyName !== 'transform') return;
        if (pos === 0)              setPos(totalSlides, false); // was clone-last → jump to real last
        if (pos === totalSlides + 1) setPos(1, false);          // was clone-first → jump to real first
    });

    // Autoplay
    function startAutoplay() { autoplayInterval = setInterval(() => moveTo(pos + 1), AUTOPLAY_MS); }
    function resetAutoplay() { clearInterval(autoplayInterval); startAutoplay(); }

    // Init
    setPos(1, false);
    updateUI(1);
    startProgressBar();
    startAutoplay();

    // Buttons
    document.getElementById('nextBtn').addEventListener('click', () => { moveTo(pos + 1); resetAutoplay(); });
    document.getElementById('prevBtn').addEventListener('click', () => { moveTo(pos - 1); resetAutoplay(); });

    // Touch / Swipe
    let touchStartX = 0;
    const viewport = document.querySelector('.carousel-viewport');
    viewport.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    viewport.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? moveTo(pos + 1) : moveTo(pos - 1);
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

    // Cerrar menú mobile al hacer click fuera
    document.addEventListener('click', (e) => {
        const navLinks = document.getElementById('navLinks');
        const hamburger = document.getElementById('hamburger');
        if (navLinks.classList.contains('open') &&
            !navLinks.contains(e.target) &&
            !hamburger.contains(e.target)) {
            navLinks.classList.remove('open');
        }
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


    // ─── LAZY YOUTUBE ───
    const ytContainer = document.getElementById('ytContainer');
    if (ytContainer) {
        ytContainer.addEventListener('click', () => {
            const videoId = ytContainer.getAttribute('data-videoid');
            const iframe = document.createElement('iframe');
            iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0&modestbranding=1';
            iframe.title = 'BookStyles Demo';
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            iframe.setAttribute('allowfullscreen', '');
            iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none;';
            ytContainer.innerHTML = '';
            ytContainer.style.paddingBottom = '';
            ytContainer.appendChild(iframe);
        });
    }


    // ─── SCROLL PROGRESS BAR ───
    const scrollProgress = document.getElementById('scrollProgress');
    function updateScrollProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        if (scrollProgress) scrollProgress.style.width = pct + '%';
    }
    window.addEventListener('scroll', updateScrollProgress, { passive: true });


    // ─── BACK TO TOP ───
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 400);
        }, { passive: true });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    // ─── NAV SCROLL SPY ───
    const spySections = document.querySelectorAll('section[id], header[id]');
    const spyLinks = document.querySelectorAll('.nav-links a[href^="#"]');

    function updateScrollSpy() {
        let current = '';
        spySections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 120) {
                current = section.id;
            }
        });
        spyLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === '#' + current);
        });
    }

    window.addEventListener('scroll', updateScrollSpy, { passive: true });
    updateScrollSpy();


});
