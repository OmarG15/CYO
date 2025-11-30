/* TODO LISTA DE CAMBIOS

1.  en las imagenes de  donde se ven el contador  en el modo mobile tienen un efecto raro se ven como si se movieran
2.de talles de ceremonia actualizar fecha y lugar
3. en la seccion de itinerario, el texto de la descripcion de cada evento deberia estar justificado y hay que actualizarlo
3.1 actualizarlo con la hora que son y con lo que se va a aser 
4:30 inicio de ceremonia
6:00 brindis y cocktail
7:00 cena
8:30 baile y fiesta
4.  reglas y estilo
actualizar los colores 
lluvia de yappys
5. cambiar la historia de nosotros
6. hsopedaje colocar el contacto de alassandra de casa greca rio hato
7. en la seccion de fotos ver si hay una app para agergar fotos de los invitados
8.antes de la historiade  nosotros agregar una seccion de fotos
y en la ultima donde dice confirmar agergar el nombre de la persona 

*/

const targetDate = new Date("2026-03-21T15:30:00-05:00");

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
  const params = new URLSearchParams(window.location.search);
  const guestParam = params.get("guest") || params.get("nombre") || params.get("invitado");
  const guestName = guestParam ? guestParam.trim() : "";

  let message = defaultMessage;
  if (guestName) {
    message = `Yo ${guestName} confirmo mi asistencia`;
    const personalizedText = document.getElementById("rsvpPersonalized");
    if (personalizedText) {
      personalizedText.textContent = `Hola ${guestName}, este enlace ya incluye tu nombre.`;
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

  const openEnvelope = () => {
    if (!envelope) return;
    envelope.classList.add("open");
    envelope.classList.remove("close");
    stamp?.classList.add("envelope-stamp--show");
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

  closeBtn?.addEventListener("click", () => {
    overlay.classList.add("overlay-hidden");
    overlay.setAttribute("aria-hidden", "true");
    body.classList.remove("has-envelope-overlay");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateCountdown();
  setInterval(updateCountdown, 1000);
  bindSmoothScroll();
  bindParallax();
  personalizeRsvp();
  setupEnvelopeOverlay();
});
