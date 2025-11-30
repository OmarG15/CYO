

const targetDate = new Date("2026-03-21T15:30:00-05:00");

// Edita este mapa: cada invitado y sus cupos reservados
const guestSeatsMap = {
  "celia": 2,
  "anthony": 2,
};

function getGuestName() {
  const params = new URLSearchParams(window.location.search);
  const guestParam =
    params.get("guest") || params.get("nombre") || params.get("invitado");
  return guestParam ? guestParam.trim() : "";
}

function formatGuestName(name) {
  if (!name) return "";
  return name
    .split(/\s+/)
    .map((word) =>
      word.length ? word[0].toUpperCase() + word.slice(1).toLowerCase() : ""
    )
    .join(" ");
}

function normalizeName(name) {
  if (!name) return "";
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getGuestSeats(guestName = "") {
  const params = new URLSearchParams(window.location.search);
  const seatsParam =
    params.get("seats") ||
    params.get("lugares") ||
    params.get("cupos") ||
    params.get("reserva");

  const fromList = guestSeatsMap[normalizeName(guestName)];
  if (Number.isFinite(fromList) && fromList > 0) {
    return Math.min(fromList, 6);
  }

  const seats = parseInt(seatsParam, 10);
  if (!Number.isFinite(seats) || seats <= 0) return 1;
  return Math.min(seats, 6); // evita valores absurdos
}

function pad(num) {
  return String(num).padStart(2, "0");
}

function updateCountdown() {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) {
    ["days", "hours", "minutes", "seconds"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = "00";
    });
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const map = { days, hours, minutes, seconds };
  Object.entries(map).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = pad(value);
  });
}

function smoothScrollTo(selector) {
  const section = document.querySelector(selector);
  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function bindSmoothScroll() {
  document.querySelectorAll("[data-scroll]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      const target = btn.getAttribute("data-scroll");
      if (target) smoothScrollTo(target);
    });
  });
}

function updateSaveParallax() {
  const saveSection = document.getElementById("save-the-date");
  if (!saveSection) return;

  // Disable the parallax shift on small screens to avoid jittery image movement
  if (window.innerWidth <= 720) {
    saveSection.style.setProperty("--save-parallax", "0px");
    return;
  }

  const rect = saveSection.getBoundingClientRect();
  const viewport = window.innerHeight;
  const total = rect.height + viewport;

  const progress = Math.min(1, Math.max(0, (viewport - rect.top) / total));
  const offset = (progress - 0.5) * 120; // move backgrounds subtly

  saveSection.style.setProperty("--save-parallax", `${offset}px`);
}

function bindParallax() {
  updateSaveParallax();
  window.addEventListener("scroll", updateSaveParallax, { passive: true });
  window.addEventListener("resize", updateSaveParallax);
}

function personalizeRsvp() {
  const button = document.querySelector("[data-wa-base]");
  if (!button) return;

  const baseUrl = button.dataset.waBase;
  if (!baseUrl) return;

  const defaultMessage = button.dataset.waDefault || "Confirmo mi asistencia";
  const guestName = getGuestName();
  const seats = getGuestSeats(guestName);

  let message = defaultMessage;
  if (guestName) {
    message = `Yo ${guestName} confirmo mi asistencia`;
    if (seats > 1) message += ` para ${seats} personas`;
    const personalizedText = document.getElementById("rsvpPersonalized");
    if (personalizedText) {
      const seatsText =
        seats > 1
          ? `Tienes ${seats} lugares reservados.`
          : "Tienes 1 lugar reservado.";
      personalizedText.textContent = `Hola ${guestName}, este enlace ya incluye tu nombre. ${seatsText}`;
      personalizedText.hidden = false;
    }
  }

  const encoded = encodeURIComponent(message);
  button.href = `${baseUrl}?text=${encoded}`;
}

function setupEnvelopeOverlay() {
  const overlay = document.getElementById("envelopeOverlay");
  if (!overlay) return;

  const body = document.body;
  const envelope = document.getElementById("envelope");
  const stamp = document.querySelector(".envelope-stamp");
  const openBtn = document.getElementById("envelopeOpen");
  const resetBtn = document.getElementById("envelopeReset");
  const closeBtn = document.getElementById("overlayClose");
  const bgAudio = document.getElementById("bgMusic");
  let musicStarted = false;

  const startMusic = () => {
    if (musicStarted || !bgAudio) return;
    bgAudio.volume = 0.65;
    const playPromise = bgAudio.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.then(() => {
        musicStarted = true;
      }).catch(() => {
        // Autoplay might be blocked; we'll retry on envelope open
      });
    } else {
      musicStarted = true;
    }
  };

  const hideOverlay = () => {
    overlay.classList.add("overlay-hidden");
    overlay.setAttribute("aria-hidden", "true");
    body.classList.remove("has-envelope-overlay");
  };

  const openEnvelope = () => {
    if (!envelope) return;
    envelope.classList.add("open");
    envelope.classList.remove("close");
    stamp?.classList.add("envelope-stamp--show");
    startMusic();
  };

  const closeEnvelope = () => {
    if (!envelope) return;
    envelope.classList.add("close");
    envelope.classList.remove("open");
    stamp?.classList.remove("envelope-stamp--show");
  };

  envelope?.addEventListener("click", openEnvelope);
  openBtn?.addEventListener("click", openEnvelope);
  resetBtn?.addEventListener("click", closeEnvelope);

  closeBtn?.addEventListener("click", hideOverlay);
  stamp?.addEventListener("click", hideOverlay);

  // Intentar reproducir apenas se cargue la página
  startMusic();
}

function setGuestLabel() {
  const label = document.querySelector(".envelope-overlay__label");
  if (!label) return;

  const guestName = getGuestName();
  const seats = getGuestSeats(guestName);
  if (guestName) {
    const displayName = formatGuestName(guestName);
    const seatsSuffix = seats > 1 ? ` (+${seats - 1})` : "";
    label.textContent = `${displayName}${seatsSuffix}`;
    label.hidden = false;
  } else {
    label.textContent = "";
    label.hidden = true;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateCountdown();
  setInterval(updateCountdown, 1000);
  bindSmoothScroll();
  bindParallax();
  personalizeRsvp();
  setupEnvelopeOverlay();
  setGuestLabel();
});
