console.log("YouTube content script cargado");

function getVideo() {
    const video = document.querySelector("video");
    if (!video) {
        console.log("No se encontró video en YouTube");
    }
    return video;
}

chrome.runtime.onMessage.addListener((msg) => {
    console.log("Mensaje recibido en YouTube:", msg);

    const video = getVideo();
    if (!video) return;

    if (msg.type === "PAUSE_VIDEO") {
        console.log("Pausando video por orden del background");
        video.pause();
    }

    if (msg.type === "RESUME_VIDEO") {
        console.log("Reanudando video por orden del background");
        video.play().catch(err => {
            console.log("No se pudo reanudar automáticamente:", err);
        });
    }
});
