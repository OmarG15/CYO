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

document.addEventListener("DOMContentLoaded", () => {
  updateCountdown();
  setInterval(updateCountdown, 1000);
  bindSmoothScroll();
  bindParallax();
});
