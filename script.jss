/* ==========================================================
  THE GYM — Premium Website (Vanilla JS Only)
  Features:
  - Preloader hide
  - Intro screen (3s) transition to hero
  - Sticky nav already via CSS; JS: active states & mobile menu
  - Smooth scrolling enhancements + focus management
  - Scroll progress bar
  - Back-to-top show/hide
  - Scroll reveal (IntersectionObserver)
  - Parallax scrolling for elements with data-parallax
  - Anti-gravity floating shapes (scroll + mouse drift)
  - Ripple effect on buttons
  - Gallery filtering with smooth transitions
  - Lightbox with next/prev + keyboard navigation
  - Testimonials carousel auto-scroll with dots + controls
  - Enquiry form -> WhatsApp redirect with formatted message
========================================================== */

(() => {
  "use strict";

  /* ==========================================================
    Helpers
  =========================================================== */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function rafThrottle(fn) {
    let ticking = false;
    return (...args) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        fn(...args);
        ticking = false;
      });
    };
  }

  function safeText(v) {
    return String(v ?? "").replace(/\s+/g, " ").trim();
  }

  /* ==========================================================
    Preloader
  =========================================================== */
  const preloader = $("#preloader");
  window.addEventListener("load", () => {
    // Give a tiny delay for smoother feel (production-safe)
    setTimeout(() => {
      preloader?.classList.add("is-hidden");
    }, 350);
  });

  /* ==========================================================
    Intro Screen (3 seconds then hide)
  =========================================================== */
  const intro = $("#intro");
  const introDuration = 3000;

  function hideIntro() {
    if (!intro) return;
    intro.classList.add("is-hidden");
    // Ensure body scroll is available after intro
    document.body.style.overflowY = "auto";
  }

  // Disable scroll during intro
  document.body.style.overflowY = "hidden";
  setTimeout(hideIntro, introDuration);

  /* ==========================================================
    Year
  =========================================================== */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ==========================================================
    Mobile Navigation
  =========================================================== */
  const navToggle = $("#navToggle");
  const navMenu = $("#navMenu");
  const menuOverlay = $("#menuOverlay");

  function openMenu() {
    navMenu?.classList.add("is-open");
    navToggle?.classList.add("is-open");
    menuOverlay?.classList.add("is-open");
    navToggle?.setAttribute("aria-expanded", "true");
    document.body.style.overflowY = "hidden";
  }

  function closeMenu() {
    navMenu?.classList.remove("is-open");
    navToggle?.classList.remove("is-open");
    menuOverlay?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
    document.body.style.overflowY = "auto";
  }

  navToggle?.addEventListener("click", () => {
    const isOpen = navMenu?.classList.contains("is-open");
    if (isOpen) closeMenu();
    else openMenu();
  });

  menuOverlay?.addEventListener("click", closeMenu);

  // Close menu on link click (mobile)

  $$(".nav__link", navMenu || document).forEach((a) => {
    a.addEventListener("click", () => {
      if (navMenu?.classList.contains("is-open")) closeMenu();
    });
  });

  // Close menu on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navMenu?.classList.contains("is-open")) {
      closeMenu();
    }
  });

  /* ==========================================================
    Smooth scroll focus management for anchor links
    (Enhances accessibility; native CSS smooth scroll is already enabled)
  =========================================================== */
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;

    const link = target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href === "#") return;

    const el = document.querySelector(href);
    if (!el) return;

    // Let browser do smooth scroll; after scroll, set focus
    // Avoid focusing if reduced motion is preferred
    if (prefersReducedMotion) return;

    setTimeout(() => {
      el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
      // Remove tabindex later to keep DOM clean
      setTimeout(() => el.removeAttribute("tabindex"), 800);
    }, 500);
  });

  /* ==========================================================
    Scroll Progress Bar + Back To Top
  =========================================================== */
  const scrollProgressBar = $("#scrollProgressBar");
  const backToTop = $("#backToTop");

  const onScrollUI = rafThrottle(() => {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

    if (scrollProgressBar) scrollProgressBar.style.width = `${progress}%`;

    // Back-to-top toggle
    if (backToTop) {
      if (scrollTop > 600) backToTop.classList.add("is-show");
      else backToTop.classList.remove("is-show");
    }
  });

  window.addEventListener("scroll", onScrollUI, { passive: true });
  onScrollUI();

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  /* ==========================================================
    Scroll Reveal (IntersectionObserver)
  =========================================================== */
  const revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -10% 0px" }
    );

    revealEls.forEach((el) => io.observe(el));
  } else {
    // Fallback
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ==========================================================
    Parallax Scrolling
    - Elements with data-parallax (0.05..0.25 recommended)
  =========================================================== */
  const parallaxEls = $$("[data-parallax]");
  const onParallax = rafThrottle(() => {
    if (prefersReducedMotion) return;
    const y = window.scrollY || window.pageYOffset;
    parallaxEls.forEach((el) => {
      const strength = parseFloat(el.getAttribute("data-parallax") || "0");
      const offset = y * strength;
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
  });
  window.addEventListener("scroll", onParallax, { passive: true });
  onParallax();

  /* ==========================================================
    Anti-Gravity Floating Shapes
    - Shapes with [data-float] drift based on scroll + mouse
  =========================================================== */
  const floatShapes = $$("[data-float]");
  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener("mousemove", (e) => {
    const vw = window.innerWidth || 1;
    const vh = window.innerHeight || 1;
    mouseX = (e.clientX / vw) * 2 - 1; // -1..1
    mouseY = (e.clientY / vh) * 2 - 1; // -1..1
  }, { passive: true });

  const onFloat = rafThrottle(() => {
    if (prefersReducedMotion) return;
    const y = window.scrollY || 0;

    floatShapes.forEach((el, idx) => {
      const speed = parseFloat(el.getAttribute("data-speed") || "1");
      const base = (Math.sin((y * 0.002) + idx) + Math.cos((y * 0.0014) + idx * 1.7)) * 10;
      const driftX = mouseX * 18 * speed;
      const driftY = mouseY * 14 * speed;

      const translateY = base * speed + driftY;
      const translateX = driftX * 0.55;

      const rotate = base * 0.35;
      el.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotate}deg)`;
    });
  });
  window.addEventListener("scroll", onFloat, { passive: true });
  onFloat();

  /* ==========================================================
    Ripple Effect
    - Attach to [data-ripple]
  =========================================================== */
  function createRipple(e, el) {
    const rect = el.getBoundingClientRect();
    const circle = document.createElement("span");
    circle.className = "ripple__circle";

    const size = Math.max(rect.width, rect.height);
    circle.style.width = circle.style.height = `${size}px`;

    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;

    // Remove existing ripple quickly for performance
    const existing = el.querySelector("span.ripple__circle");
    if (existing) existing.remove();

    el.appendChild(circle);

    circle.addEventListener("animationend", () => {
      circle.remove();
    });
  }


  $$("[data-ripple]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (prefersReducedMotion) return;
      // Only ripple for pointer clicks
      if (!(e instanceof MouseEvent)) return;
      createRipple(e, el);
    });
  });

  /* ==========================================================
    Gallery Filtering
  =========================================================== */
  const chips = $$(".chip");
  const galleryItems = $$(".gallery-item");

  function setActiveChip(btn) {
    chips.forEach((c) => c.classList.remove("chip--active"));
    btn.classList.add("chip--active");
  }

  function filterGallery(category) {
    galleryItems.forEach((item) => {
      const itemCat = item.getAttribute("data-category") || "";
      const show = category === "all" || itemCat === category;

      if (show) item.classList.remove("is-filtered-out");
      else item.classList.add("is-filtered-out");
    });
  }

  chips.forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.getAttribute("data-filter") || "all";
      setActiveChip(btn);
      filterGallery(category);
    });
  });

  /* ==========================================================
    Lightbox
  =========================================================== */
  const lightbox = $("#lightbox");
  const lightboxImg = $("#lightboxImg");
  const lightboxCaption = $("#lightboxCaption");
  const lightboxClose = $("#lightboxClose");
  const lightboxPrev = $("#lightboxPrev");
  const lightboxNext = $("#lightboxNext");

  const lightboxButtons = $$("[data-lightbox]");

  let currentIndex = 0;
  let currentVisible = []; // references to visible items (post-filter)

  function getVisibleLightboxButtons() {
    // Visible: item does not have .is-filtered-out
    return lightboxButtons.filter((btn) => {
      const fig = btn.closest(".gallery-item");
      return fig && !fig.classList.contains("is-filtered-out");
    });
  }

  function openLightboxByIndex(i) {
    currentVisible = getVisibleLightboxButtons();
    if (!currentVisible.length) return;

    currentIndex = ((i % currentVisible.length) + currentVisible.length) % currentVisible.length;
    const btn = currentVisible[currentIndex];

    const src = btn.getAttribute("data-src") || "";
    const caption = btn.getAttribute("data-caption") || "";

    if (lightboxImg) lightboxImg.src = src;
    if (lightboxCaption) lightboxCaption.textContent = caption;

    lightbox?.classList.add("is-open");
    lightbox?.setAttribute("aria-hidden", "false");
    document.body.style.overflowY = "hidden";

    // Focus close button for accessibility
    setTimeout(() => lightboxClose?.focus(), 50);
  }

  function closeLightbox() {
    lightbox?.classList.remove("is-open");
    lightbox?.setAttribute("aria-hidden", "true");
    document.body.style.overflowY = "auto";

    // Stop loading current image to reduce memory if needed
    if (lightboxImg) lightboxImg.src = "";
  }

  function nextLightbox() {
    openLightboxByIndex(currentIndex + 1);
  }

  function prevLightbox() {
    openLightboxByIndex(currentIndex - 1);
  }

  lightboxButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const visible = getVisibleLightboxButtons();
      const idx = visible.indexOf(btn);
      openLightboxByIndex(idx >= 0 ? idx : 0);
    });
  });

  lightboxClose?.addEventListener("click", closeLightbox);
  lightboxNext?.addEventListener("click", nextLightbox);
  lightboxPrev?.addEventListener("click", prevLightbox);

  lightbox?.addEventListener("click", (e) => {
    // Close on overlay click (not on figure or buttons)
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox?.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") nextLightbox();
    if (e.key === "ArrowLeft") prevLightbox();
  });

  /* ==========================================================
    Testimonials Carousel (auto-scroll)
  =========================================================== */
  const track = $("#testimonialTrack");
  const prevBtn = $("#testiPrev");
  const nextBtn = $("#testiNext");
  const dotsWrap = $("#testiDots");

  let testiIndex = 0;
  let testiTimer = null;

  function getCards() {
    return track ? $$(".testimonial-card", track) : [];
  }

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = "";
    const cards = getCards();
    cards.forEach((_, i) => {
      const d = document.createElement("span");
      d.className = "dot" + (i === 0 ? " is-active" : "");
      d.addEventListener("click", () => goToTestimonial(i, true));
      dotsWrap.appendChild(d);
    });
  }

  function setActiveDot(i) {
    if (!dotsWrap) return;
    const dots = $$(".dot", dotsWrap);
    dots.forEach((d, idx) => d.classList.toggle("is-active", idx === i));
  }

  function goToTestimonial(i, userInitiated = false) {
    const cards = getCards();
    if (!track || !cards.length) return;

    testiIndex = ((i % cards.length) + cards.length) % cards.length;
    const card = cards[testiIndex];
    const left = card.offsetLeft;

    track.scrollTo({ left, behavior: prefersReducedMotion ? "auto" : "smooth" });
    setActiveDot(testiIndex);

    if (userInitiated) restartAutoScroll();
  }

  function nextTestimonial(userInitiated = false) {
    goToTestimonial(testiIndex + 1, userInitiated);
  }

  function prevTestimonial(userInitiated = false) {
    goToTestimonial(testiIndex - 1, userInitiated);
  }

  function startAutoScroll() {
    if (prefersReducedMotion) return;
    stopAutoScroll();
    testiTimer = window.setInterval(() => {
      nextTestimonial(false);
    }, 4200);
  }

  function stopAutoScroll() {
    if (testiTimer) {
      clearInterval(testiTimer);
      testiTimer = null;
    }
  }

  function restartAutoScroll() {
    stopAutoScroll();
    startAutoScroll();
  }

  prevBtn?.addEventListener("click", () => prevTestimonial(true));
  nextBtn?.addEventListener("click", () => nextTestimonial(true));

  // Pause auto-scroll on hover/focus
  if (track) {
    track.addEventListener("mouseenter", stopAutoScroll);
    track.addEventListener("mouseleave", startAutoScroll);
    track.addEventListener("focusin", stopAutoScroll);
    track.addEventListener("focusout", startAutoScroll);
  }

  // When user scrolls manually, update nearest dot
  const onTestiScroll = rafThrottle(() => {
    if (!track) return;
    const cards = getCards();
    if (!cards.length) return;

    // Find closest card by scrollLeft distance
    const sl = track.scrollLeft;
    let closest = 0;
    let best = Infinity;
    cards.forEach((c, idx) => {
      const d = Math.abs(c.offsetLeft - sl);
      if (d < best) {
        best = d;
        closest = idx;
      }
    });

    testiIndex = closest;
    setActiveDot(testiIndex);
  });

  track?.addEventListener("scroll", onTestiScroll, { passive: true });

  buildDots();
  startAutoScroll();

  /* ==========================================================
    Enquiry Form -> WhatsApp Redirect
    WhatsApp API format: https://wa.me/<number>?text=<encoded>
  =========================================================== */
  const enquiryForm = $("#enquiryForm");
  const toast = $("#formToast");
  const WA_NUMBER = "918605463560";

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-show");
    setTimeout(() => toast.classList.remove("is-show"), 2800);
  }

  function validateForm(data) {
    // Basic production-safe validation
    const fullName = safeText(data.fullName);
    const age = safeText(data.age);
    const gender = safeText(data.gender);
    const phone = safeText(data.phone);
    const email = safeText(data.email);
    const goal = safeText(data.goal);
    const program = safeText(data.program);
    const message = safeText(data.message);

    if (!fullName) return { ok: false, msg: "Please enter your full name." };
    if (!age || Number(age) < 12 || Number(age) > 80) return { ok: false, msg: "Please enter a valid age (12-80)." };
    if (!gender) return { ok: false, msg: "Please select your gender." };
    if (!phone || phone.replace(/\D/g, "").length < 10) return { ok: false, msg: "Please enter a valid phone number." };
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return { ok: false, msg: "Please enter a valid email address." };
    if (!goal) return { ok: false, msg: "Please select your fitness goal." };
    if (!program) return { ok: false, msg: "Please select a preferred program." };
    if (!message || message.length < 6) return { ok: false, msg: "Please write a short message (min 6 characters)." };

    return { ok: true, msg: "OK" };
  }

  function buildWhatsAppMessage(data) {
    // EXACT required format:
    // Name:
    // Age:
    // Gender:
    // Phone:
    // Email:
    // Goal:
    // Program:
    // Message:
    const fullName = safeText(data.fullName);
    const age = safeText(data.age);
    const gender = safeText(data.gender);
    const phone = safeText(data.phone);
    const email = safeText(data.email);
    const goal = safeText(data.goal);
    const program = safeText(data.program);
    const message = safeText(data.message);

    return (
      `Name: ${fullName}\n` +
      `Age: ${age}\n` +
      `Gender: ${gender}\n` +
      `Phone: ${phone}\n` +
      `Email: ${email}\n` +
      `Goal: ${goal}\n` +
      `Program: ${program}\n` +
      `Message: ${message}`
    );
  }

  enquiryForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    if (!(form instanceof HTMLFormElement)) return;

    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());

    const check = validateForm(data);
    if (!check.ok) {
      showToast(check.msg);
      // focus first invalid field loosely
      // (Keep simple for production; no heavy validation lib)
      return;
    }

    const msg = buildWhatsAppMessage(data);
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

    showToast("Opening WhatsApp with your enquiry...");
    // Redirect
    window.location.href = url;
  });

  /* ==========================================================
    Active nav link on scroll (lightweight)
  =========================================================== */
  const sections = ["about","facilities","programs","trainers","gallery","testimonials","timetable","enquiry"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const navLinks = $$(".nav__link").filter((a) => (a.getAttribute("href") || "").startsWith("#"));

  const onActiveLink = rafThrottle(() => {
    const y = window.scrollY || 0;
    const offset = 120;

    let current = "";
    for (const sec of sections) {
      const top = sec.offsetTop - offset;
      const bottom = top + sec.offsetHeight;
      if (y >= top && y < bottom) {
        current = `#${sec.id}`;
        break;
      }
    }

    navLinks.forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;
      // Avoid overriding CTA styling too strongly; just add a subtle state
      a.classList.toggle("is-active", href === current);
    });
  });

  window.addEventListener("scroll", onActiveLink, { passive: true });
  onActiveLink();

  /* ==========================================================
    Minor enhancement: If user scrolls during intro, ignore
  =========================================================== */
  window.addEventListener("wheel", (e) => {
    if (!intro) return;
    if (!intro.classList.contains("is-hidden")) {
      e.preventDefault?.();
    }
  }, { passive: false });

})();
