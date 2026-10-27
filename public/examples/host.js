/* A first-party example host: all configuration is supplied by the host, never a visitor URL. */
window.hostConfig = { ...window.exampleConfig, pagePath: location.pathname };
window.hostEvents = [];
window.formSubmissions = 0;
const nonce = document.body.dataset.styleNonce;
window.hostTour = MicroOnboard.create(window.hostConfig, nonce);
window.configureHost = function (changes) {
  window.hostTour.destroy();
  window.hostConfig = { ...window.exampleConfig, pagePath: location.pathname, ...changes };
  window.hostTour = MicroOnboard.create(window.hostConfig, nonce);
};
const status = document.getElementById("status");
for (const name of ["completed", "dismissed", "storageUnavailable"]) document.addEventListener(`microonboard:${name}`, (event) => {
  window.hostEvents.push({ name, ...event.detail });
  status.textContent = name === "completed" ? "Tour completed." : name === "dismissed" ? "Tour dismissed." : "Completion is available only for this page session.";
});
function start(replay) { window.hostTour.start(replay).catch((error) => { status.textContent = `${error.code}: ${error.message}`; }); }
document.getElementById("start").addEventListener("click", () => start(false));
document.getElementById("replay").addEventListener("click", () => start(true));
document.getElementById("stop").addEventListener("click", () => { window.hostTour.stop(); status.textContent = "Stopped. The instance is idle."; });
document.getElementById("reset").addEventListener("click", () => { window.hostTour.resetCompletion(); status.textContent = "Completion reset for this tour/version."; });
document.getElementById("destroy").addEventListener("click", () => { window.hostTour.destroy(); status.textContent = "Destroyed. Create a new instance to start again."; });
let author;
document.getElementById("author").addEventListener("click", () => { window.hostTour.stop(); author?.destroy(); author = MicroOnboard.enableAuthorMode({ styleNonce: nonce }); });
document.getElementById("host-form").addEventListener("submit", (event) => { event.preventDefault(); window.formSubmissions++; status.textContent = "Example form submitted locally. Nothing was sent."; });
window.addEventListener("pagehide", () => { window.hostTour.destroy(); author?.destroy(); });
