console.log("WhatsApp content script cargado (detección tentativa de audio)");

// Estado para no enviar múltiples mensajes repetidos
let audioPlaying = false;

// Función para revisar todos los audios de la página
function checkAudios() {
    const audios = document.querySelectorAll("audio");
    audios.forEach(audio => {
        if (!audio.dataset.listenerAdded) {
            audio.dataset.listenerAdded = "true";
            console.log("Audio encontrado, añadiendo listeners:", audio);

            audio.addEventListener("play", () => {
                if (!audioPlaying) {
                    audioPlaying = true;
                    console.log("Audio play detectado");
                    chrome.runtime.sendMessage({ type: "WHATSAPP_AUDIO_START" });
                }
            });

            audio.addEventListener("ended", () => {
                if (audioPlaying) {
                    audioPlaying = false;
                    console.log("Audio ended detectado");
                    chrome.runtime.sendMessage({ type: "WHATSAPP_AUDIO_END" });
                }
            });

            audio.addEventListener("pause", () => {
                if (audioPlaying) {
                    audioPlaying = false;
                    console.log("Audio pause detectado");
                    chrome.runtime.sendMessage({ type: "WHATSAPP_AUDIO_END" });
                }
            });
        }
    });
}

// Observador de cambios en el DOM (para detectar audios dinámicos)
const observer = new MutationObserver(() => {
    checkAudios();
});
observer.observe(document.body, { childList: true, subtree: true });
console.log("MutationObserver activado");

// Escaneo inicial cada segundo, por si ya hay audios cargados
setInterval(() => {
    checkAudios();
}, 1000);

console.log("Versión tentativa cargada. Observando audios en WhatsApp Web...");
