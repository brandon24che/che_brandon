/* Avery Cole — interactions, theme, filters, form, motion */

const CONFIG = {
  formspreeId: "YOUR_FORM_ID",
};

const PROJECTS = {
  maison: {
    tag: "Web development",
    title: "Maison Atelier",
    body: "A headless commerce experience for a luxury home label. Custom product storytelling, restrained motion, and a 98 Lighthouse performance score on production.",
  },
  northline: {
    tag: "Graphic design",
    title: "Northline",
    body: "Identity, typography, and a 48-page brand book for a climate-tech studio. Built to scale from investor decks to wayfinding without losing warmth.",
  },
  orbit: {
    tag: "Motion design",
    title: "Orbit — Launch",
    body: "A 45-second product film with a reusable kinetic type system. Cutdowns shipped for paid social, the website hero, and a live keynote.",
  },
  lumen: {
    tag: "Digital marketing",
    title: "Lumen Series",
    body: "Always-on acquisition: creative testing, landing-page variants, and analytics instrumentation that delivered a 3.4× ROAS over two quarters.",
  },
  journal: {
    tag: "Web development",
    title: "Atelier Journal",
    body: "An editorial web magazine with chaptered scroll, custom CMS fields, and a reading experience that feels closer to print than a blog.",
  },
  solace: {
    tag: "Graphic design",
    title: "Solace Botanics",
    body: "Packaging architecture and campaign stills for an 11-SKU wellness launch. Quiet materials, strong type, shelf presence without shouting.",
  },
};

document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();

  initTheme();
  initNav();
  initHeroRipple();
  initRoleCycle();
  initSkills();
  initSkillOrbit();
  initHeroCanvas();
  initFilters();
  initReveal();
  initScrollSpy();
  initScrollProgress();
  initForm();
  initModal();
  initAboutCounters();
  initProjectTilt();
  initCursor();
  initMagnetic();

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
});

/* ---------- Theme ---------- */
function initTheme() {
  const stored = localStorage.getItem("ac-theme");
  const theme = stored || "dark";
  applyTheme(theme);

  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem("ac-theme", next);
    });
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

/* ---------- Mobile nav ---------- */
function initNav() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const drawer = document.getElementById("mobile-nav");
  const overlay = document.querySelector("[data-nav-overlay]");
  if (!toggle || !drawer || !overlay) return;

  const burst = () => {
    toggle.classList.remove("is-bursting");
    void toggle.offsetWidth;
    toggle.classList.add("is-bursting");
    setTimeout(() => toggle.classList.remove("is-bursting"), 600);
  };

  const close = () => {
    drawer.classList.remove("is-open");
    toggle.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    overlay.hidden = true;
    document.body.style.overflow = "";
  };

  const open = () => {
    drawer.classList.add("is-open");
    toggle.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
  };

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    burst();
    drawer.classList.contains("is-open") ? close() : open();
  });
  overlay.addEventListener("click", () => {
    burst();
    close();
  });

  drawer.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      drawer.querySelectorAll("a").forEach((a) => a.classList.remove("is-picked"));
      link.classList.add("is-picked");
      burst();
      const href = link.getAttribute("href");
      setTimeout(() => {
        close();
        link.classList.remove("is-picked");
        if (href) {
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
            history.pushState(null, "", href);
          }
        }
      }, 380);
    });
  });
}

/* ---------- Hero ripple (pointer / touch) ---------- */
function initHeroRipple() {
  const root = document.getElementById("hero-ripple");
  if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const textNodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach((node) => {
    const value = node.textContent;
    if (!value) return;
    const frag = document.createDocumentFragment();
    [...value].forEach((ch) => {
      if (ch === "\n" || ch === "\t") return;
      if (ch === " ") {
        frag.appendChild(document.createTextNode(" "));
        return;
      }
      const span = document.createElement("span");
      span.className = "ripple-char";
      span.textContent = ch;
      frag.appendChild(span);
    });
    node.parentNode.replaceChild(frag, node);
  });

  const chars = [...root.querySelectorAll(".ripple-char")];
  const motion = chars.map(() => ({ tx: 0, ty: 0, rot: 0, scale: 1, lift: 0 }));

  const pointer = { x: 0, y: 0, active: false };
  const RADIUS = 130;
  let raf = 0;

  const settleIdle = () => motion.every((m) => Math.abs(m.tx) < 0.08 && Math.abs(m.ty) < 0.08 && Math.abs(m.rot) < 0.08 && Math.abs(m.scale - 1) < 0.01);

  const tick = () => {
    const now = performance.now() * 0.006;
    chars.forEach((el, i) => {
      const box = el.getBoundingClientRect();
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      const dx = cx - pointer.x;
      const dy = cy - pointer.y;
      const dist = Math.hypot(dx, dy);

      let tx = 0;
      let ty = 0;
      let rot = 0;
      let scale = 1;
      let lift = 0;

      if (pointer.active && dist < RADIUS) {
        const falloff = 1 - dist / RADIUS;
        const force = falloff * falloff;
        const wave = Math.sin(dist * 0.085 - now) * force;
        const nx = dist ? dx / dist : 0;
        tx = nx * force * 8;
        ty = -20 * force + wave * 7;
        rot = nx * force * 10;
        scale = 1 + force * 0.14;
        lift = force;
      }

      const m = motion[i];
      const ease = pointer.active ? 0.28 : 0.16;
      m.tx += (tx - m.tx) * ease;
      m.ty += (ty - m.ty) * ease;
      m.rot += (rot - m.rot) * ease;
      m.scale += (scale - m.scale) * ease;
      m.lift += (lift - m.lift) * ease;

      el.style.transform = `translate(${m.tx.toFixed(2)}px, ${m.ty.toFixed(2)}px) rotate(${m.rot.toFixed(2)}deg) scale(${m.scale.toFixed(3)})`;
      if (m.lift > 0.04) {
        el.style.color = `color-mix(in srgb, var(--accent) ${Math.round(m.lift * 85)}%, var(--ink))`;
      } else {
        el.style.color = "";
      }
    });

    if (pointer.active || !settleIdle()) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = 0;
      chars.forEach((el) => {
        el.style.transform = "";
        el.style.color = "";
      });
    }
  };

  const start = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };

  const setPointer = (event) => {
    const point = event.touches ? event.touches[0] : event;
    pointer.x = point.clientX;
    pointer.y = point.clientY;
    pointer.active = true;
    start();
  };

  const endPointer = () => {
    pointer.active = false;
    start();
  };

  root.addEventListener("pointerenter", setPointer);
  root.addEventListener("pointermove", setPointer);
  root.addEventListener("pointerleave", endPointer);
  root.addEventListener("touchstart", setPointer, { passive: true });
  root.addEventListener("touchmove", setPointer, { passive: true });
  root.addEventListener("touchend", endPointer);
  root.addEventListener("touchcancel", endPointer);
}

/* ---------- Role typing cycle + wiggle ---------- */
function initRoleCycle() {
  const el = document.getElementById("role-title");
  if (!el) return;

  const roles = JSON.parse(el.dataset.roles || "[]");
  if (!roles.length) return;

  let index = 0;
  let char = roles[0].length;
  let deleting = true;

  const tick = () => {
    const current = roles[index];

    if (!deleting && char === current.length) {
      el.classList.add("is-wiggling");
      setTimeout(() => el.classList.remove("is-wiggling"), 900);
      setTimeout(() => {
        deleting = true;
        tick();
      }, 1600);
      return;
    }

    if (deleting && char === 0) {
      deleting = false;
      index = (index + 1) % roles.length;
    }

    char += deleting ? -1 : 1;
    el.textContent = (deleting ? current : roles[index]).slice(0, Math.max(char, 0)) || "\u00a0";

    setTimeout(tick, deleting ? 36 : 70);
  };

  setTimeout(tick, 1800);
}

/* ---------- Skill tabs + animated progress rings ---------- */
function initSkills() {
  const tabs = document.querySelectorAll(".skill-tab");
  const panels = document.querySelectorAll(".skill-panel");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CIRC = 2 * Math.PI * 52; // matches SVG circle r="52"
  const animated = new WeakSet();

  function animateRings(panel) {
    if (!panel || animated.has(panel)) return;
    animated.add(panel);
    const rings = panel.querySelectorAll(".ring-value[data-target]");

    rings.forEach((valueEl, i) => {
      const target = Number(valueEl.dataset.target) || 0;
      const fill = valueEl.closest(".ring")?.querySelector(".ring-fill");

      if (reduceMotion) {
        valueEl.firstChild && (valueEl.firstChild.textContent = String(target));
        if (fill) fill.style.strokeDashoffset = String(CIRC * (1 - target / 100));
        return;
      }

      const delay = i * 110;
      const duration = 1000;
      setTimeout(() => {
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          const value = Math.round(target * eased);
          if (valueEl.firstChild) valueEl.firstChild.textContent = String(value);
          if (fill) fill.style.strokeDashoffset = String(CIRC * (1 - (target * eased) / 100));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, delay);
    });
  }

  // Reset a panel's rings so switching back to it replays the animation.
  function resetRings(panel) {
    if (!panel) return;
    animated.delete(panel);
    panel.querySelectorAll(".ring-value[data-target]").forEach((valueEl) => {
      if (valueEl.firstChild) valueEl.firstChild.textContent = "0";
      const fill = valueEl.closest(".ring")?.querySelector(".ring-fill");
      if (fill) fill.style.strokeDashoffset = String(CIRC);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.dataset.tab;
      tabs.forEach((t) => {
        t.classList.toggle("is-active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });
      panels.forEach((panel) => {
        const on = panel.dataset.panel === id;
        if (on && !panel.classList.contains("is-active")) resetRings(panel);
        panel.classList.toggle("is-active", on);
        panel.hidden = !on;
        if (on) animateRings(panel);
      });
    });
  });

  const activePanel = document.querySelector(".skill-panel.is-active");
  if (activePanel && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateRings(activePanel);
            io.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );
    io.observe(activePanel);
  } else {
    animateRings(activePanel);
  }
}

/* ---------- Portfolio filters ---------- */
function initFilters() {
  const buttons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".project-card");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      buttons.forEach((b) => b.classList.toggle("is-active", b === btn));
      let visible = 0;
      cards.forEach((card) => {
        const show = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !show);
        card.classList.remove("filter-in");
        if (show) {
          const delay = visible * 70;
          visible += 1;
          card.style.animationDelay = `${delay}ms`;
          void card.offsetWidth;
          card.classList.add("filter-in");
        }
      });
    });
  });
}

/* ---------- Reveal on scroll ---------- */
function initReveal() {
  const nodes = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => entry.target.classList.add("is-in"), Number(delay));
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  nodes.forEach((n) => io.observe(n));
}

/* ---------- Active nav on scroll ---------- */
function initScrollSpy() {
  const links = document.querySelectorAll(".nav-desktop a");
  const sections = ["about", "skills", "work", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const spy = () => {
    const y = window.scrollY + 120;
    let current = "";
    sections.forEach((sec) => {
      if (y >= sec.offsetTop) current = sec.id;
    });
    links.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${current}`);
    });
  };

  window.addEventListener("scroll", spy, { passive: true });
  spy();
}

/* ---------- Contact form ---------- */
function initForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  const submit = document.getElementById("form-submit");
  if (!form) return;

  const fields = ["name", "email", "inquiry-type", "subject", "message"]
    .map((id) => form.querySelector(`#${id}`))
    .filter(Boolean);

  fields.forEach((field) => {
    field.addEventListener("input", () => field.classList.remove("is-invalid"));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "";
    status.className = "form-status";

    let valid = true;
    fields.forEach((field) => {
      const ok = field.checkValidity();
      field.classList.toggle("is-invalid", !ok);
      if (!ok) valid = false;
    });

    if (!valid) {
      status.textContent = "Please complete the highlighted fields.";
      status.classList.add("error");
      return;
    }

    submit.disabled = true;
    submit.textContent = "Sending…";

    const isPlaceholder = form.action.includes(CONFIG.formspreeId);
    try {
      if (isPlaceholder) {
        await new Promise((r) => setTimeout(r, 500));
        showSuccess();
      } else {
        const res = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Request failed");
        showSuccess();
      }
    } catch {
      status.textContent = "Something went wrong. Please try WhatsApp or email instead.";
      status.classList.add("error");
    } finally {
      submit.disabled = false;
      submit.textContent = "Send message";
    }

    function showSuccess() {
      form.reset();
      form.classList.add("is-success");
      status.textContent = "Message sent. I’ll get back to you shortly.";
      status.classList.add("success");
    }
  });
}

/* ---------- Project modal ---------- */
function initModal() {
  const modal = document.getElementById("project-modal");
  if (!modal) return;

  document.querySelectorAll("[data-project]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const data = PROJECTS[btn.dataset.project];
      if (!data) return;
      document.getElementById("modal-tag").textContent = data.tag;
      document.getElementById("modal-title").textContent = data.title;
      document.getElementById("modal-body").textContent = data.body;
      if (window.lucide) lucide.createIcons();
      modal.showModal();
    });
  });

  modal.querySelector("[data-close-modal]").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
  });
}

/* ---------- About counters ---------- */
function initAboutCounters() {
  const cards = document.querySelectorAll(".stat-card strong[data-count]");
  if (!cards.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.count);
        const start = performance.now();
        const duration = 1100;
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = String(Math.round(target * eased));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );

  cards.forEach((el) => io.observe(el));
}

/* ---------- Work card tilt ---------- */
function initProjectTilt() {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const box = card.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width;
      const y = (event.clientY - box.top) / box.height;
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
      card.style.transform = `rotateY(${(x - 0.5) * 12}deg) rotateX(${(0.5 - y) * 9}deg) translateY(-4px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

/* ---------- Skills orbit: eased 3D turntable ---------- */
function initSkillOrbit() {
  const scene = document.querySelector(".skill-orbit-3d");
  if (!scene) return;
  const tilt = scene.querySelector("[data-orbit-tilt]");
  const stage = scene.querySelector(".orbit-stage");
  const ring = scene.querySelector(".orbit-ring");
  const chips = [...scene.querySelectorAll(".orbit-chip")];
  if (!tilt || !chips.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (ring) ring.classList.add("is-live");

  const state = {
    angle: 0,
    speed: 0.22,
    targetSpeed: 0.22,
    tiltX: -14,
    tiltY: 0,
    targetTiltX: -14,
    targetTiltY: 0,
    radius: 150,
    hover: false,
    t: 0,
  };

  const measure = () => {
    state.radius = stage && stage.offsetWidth < 300 ? 110 : 150;
  };
  measure();
  window.addEventListener("resize", () => {
    measure();
    if (reduceMotion) render();
  });

  scene.addEventListener("pointerenter", () => {
    state.hover = true;
  });
  scene.addEventListener("pointerleave", () => {
    state.hover = false;
    state.targetTiltX = -14;
    state.targetTiltY = 0;
  });
  if (finePointer) {
    scene.addEventListener("pointermove", (event) => {
      const box = scene.getBoundingClientRect();
      const nx = (event.clientX - box.left) / box.width - 0.5;
      const ny = (event.clientY - box.top) / box.height - 0.5;
      state.targetTiltY = nx * 20;
      state.targetTiltX = -14 - ny * 12;
    });
  }

  const render = () => {
    state.t += 0.016;
    state.targetSpeed = reduceMotion ? 0 : state.hover ? 0.045 : 0.22;
    state.speed += (state.targetSpeed - state.speed) * 0.05;
    state.tiltX += (state.targetTiltX - state.tiltX) * 0.06;
    state.tiltY += (state.targetTiltY - state.tiltY) * 0.06;
    state.angle = (state.angle + state.speed) % 360;

    tilt.style.transform = `rotateX(${state.tiltX.toFixed(2)}deg) rotateY(${state.tiltY.toFixed(2)}deg)`;

    const step = 360 / chips.length;
    chips.forEach((chip, i) => {
      const a = ((state.angle + step * i) * Math.PI) / 180;
      const x = Math.sin(a) * state.radius;
      const z = Math.cos(a) * state.radius;
      const depth = (z + state.radius) / (2 * state.radius);
      const bob = reduceMotion ? 0 : Math.sin(state.t * 1.2 + i * 1.9) * 3.5;
      chip.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${bob.toFixed(1)}px, ${z.toFixed(1)}px)`;
      chip.style.opacity = (0.32 + depth * 0.68).toFixed(2);
      chip.classList.toggle("is-front", depth > 0.82);
    });
  };

  if (reduceMotion) {
    render();
    return;
  }

  let raf = 0;
  const loop = () => {
    render();
    raf = requestAnimationFrame(loop);
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!raf) raf = requestAnimationFrame(loop);
          } else if (raf) {
            cancelAnimationFrame(raf);
            raf = 0;
          }
        });
      },
      { threshold: 0.05 }
    );
    io.observe(scene);
  } else {
    raf = requestAnimationFrame(loop);
  }
}

/* ---------- Hero particle constellation ---------- */
function initHeroCanvas() {
  const canvas = document.getElementById("hero-canvas");
  const hero = document.querySelector(".hero");
  if (!canvas || !hero) return;

  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const LINK_DIST = 110;
  const MOUSE_DIST = 170;

  let width = 0;
  let height = 0;
  let particles = [];
  let raf = 0;
  let inView = false;
  const mouse = { x: -9999, y: -9999 };
  const accent = { r: 201, g: 242, b: 74 };

  const readAccent = () => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    if (raw.startsWith("#")) {
      const h = raw.slice(1);
      if (h.length === 6) {
        accent.r = parseInt(h.slice(0, 2), 16);
        accent.g = parseInt(h.slice(2, 4), 16);
        accent.b = parseInt(h.slice(4, 6), 16);
        return;
      }
    }
    const parts = raw.match(/[\d.]+/g);
    if (parts && parts.length >= 3) {
      accent.r = Number(parts[0]);
      accent.g = Number(parts[1]);
      accent.b = Number(parts[2]);
    }
  };

  const seed = () => {
    const count = Math.round(Math.min(90, Math.max(40, (width * height) / 15000)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.7,
    }));
  };

  const resize = () => {
    const rect = hero.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    if (reduceMotion) draw();
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    const { r, g, b } = accent;

    for (const p of particles) {
      if (reduceMotion) break;
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -24) p.x = width + 24;
      else if (p.x > width + 24) p.x = -24;
      if (p.y < -24) p.y = height + 24;
      else if (p.y > height + 24) p.y = -24;
    }

    ctx.lineWidth = 1;
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const c = particles[j];
        const dx = a.x - c.x;
        const dy = a.y - c.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < LINK_DIST * LINK_DIST) {
          const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.35;
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(c.x, c.y);
          ctx.stroke();
        }
      }

      if (!reduceMotion) {
        const mdx = a.x - mouse.x;
        const mdy = a.y - mouse.y;
        const md2 = mdx * mdx + mdy * mdy;
        if (md2 < MOUSE_DIST * MOUSE_DIST) {
          const alpha = (1 - Math.sqrt(md2) / MOUSE_DIST) * 0.85;
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      ctx.fillStyle = `rgba(${r},${g},${b},0.75)`;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  if (reduceMotion) {
    readAccent();
    resize();
    window.addEventListener("resize", resize);
    return;
  }

  const loop = () => {
    draw();
    raf = requestAnimationFrame(loop);
  };
  const start = () => {
    if (!raf && inView && !document.hidden) raf = requestAnimationFrame(loop);
  };
  const stop = () => {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  hero.addEventListener(
    "pointermove",
    (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    },
    { passive: true }
  );
  hero.addEventListener("pointerleave", () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          inView = entry.isIntersecting;
          if (inView) start();
          else stop();
        });
      },
      { threshold: 0.02 }
    );
    io.observe(hero);
  } else {
    inView = true;
    start();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  if ("MutationObserver" in window) {
    new MutationObserver(readAccent).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  }

  readAccent();
  window.addEventListener("resize", resize);
  resize();
}

/* ---------- Custom cursor ---------- */
function initCursor() {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const dot = document.querySelector("[data-cursor-dot]");
  const ring = document.querySelector("[data-cursor-ring]");
  if (!dot || !ring) return;

  const root = document.documentElement;
  root.classList.add("has-cursor");

  const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const dotPos = { x: target.x, y: target.y };
  const ringPos = { x: target.x, y: target.y };
  let visible = false;
  let raf = 0;

  const apply = () => {
    dot.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0)`;
    ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
  };

  const tick = () => {
    dotPos.x += (target.x - dotPos.x) * 0.4;
    dotPos.y += (target.y - dotPos.y) * 0.4;
    ringPos.x += (target.x - ringPos.x) * 0.18;
    ringPos.y += (target.y - ringPos.y) * 0.18;
    apply();
    raf = requestAnimationFrame(tick);
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      target.x = event.clientX;
      target.y = event.clientY;
      if (!visible) {
        visible = true;
        dotPos.x = ringPos.x = target.x;
        dotPos.y = ringPos.y = target.y;
        apply();
        root.classList.add("has-cursor-visible");
      }
      if (!raf) raf = requestAnimationFrame(tick);
    },
    { passive: true }
  );

  const HOVERABLE = "a, button, input, textarea, select, .project-card, .orbit-chip";
  document.addEventListener("pointerover", (event) => {
    root.classList.toggle("has-cursor-hover", Boolean(event.target.closest(HOVERABLE)));
  });
  window.addEventListener("pointerdown", () => root.classList.add("has-cursor-down"));
  window.addEventListener("pointerup", () => root.classList.remove("has-cursor-down"));
  root.addEventListener("mouseleave", () => root.classList.remove("has-cursor-visible"));
  root.addEventListener("mouseenter", () => {
    if (visible) root.classList.add("has-cursor-visible");
  });
}

/* ---------- Magnetic hover on buttons ---------- */
function initMagnetic() {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.querySelectorAll(".btn, .filter-btn, .skill-tab, .whatsapp-btn, .socials a, .platform-btn").forEach((el) => {
    el.classList.add("is-magnetic");

    const state = { x: 0, y: 0, tx: 0, ty: 0, raf: 0 };
    const strength = 0.32;

    const apply = () => {
      el.style.transform = `translate(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px)`;
    };

    const tick = () => {
      state.x += (state.tx - state.x) * 0.18;
      state.y += (state.ty - state.y) * 0.18;
      if (!state.tx && !state.ty && Math.abs(state.x) < 0.1 && Math.abs(state.y) < 0.1) {
        state.raf = 0;
        state.x = 0;
        state.y = 0;
        el.style.transform = "";
        return;
      }
      apply();
      state.raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!state.raf) state.raf = requestAnimationFrame(tick);
    };

    el.addEventListener("pointerenter", (event) => {
      const rect = el.getBoundingClientRect();
      state.tx = (event.clientX - (rect.left + rect.width / 2)) * strength;
      state.ty = (event.clientY - (rect.top + rect.height / 2)) * strength;
      start();
    });
    el.addEventListener("pointermove", (event) => {
      const rect = el.getBoundingClientRect();
      state.tx = (event.clientX - (rect.left + rect.width / 2)) * strength;
      state.ty = (event.clientY - (rect.top + rect.height / 2)) * strength;
      start();
    });
    el.addEventListener("pointerleave", () => {
      state.tx = 0;
      state.ty = 0;
      start();
    });
  });
}

/* ---------- Scroll progress bar ---------- */
function initScrollProgress() {
  const bar = document.querySelector("[data-scroll-progress]");
  if (!bar) return;

  let raf = 0;
  const update = () => {
    raf = 0;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.width = `${(progress * 100).toFixed(2)}%`;
  };
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
}
