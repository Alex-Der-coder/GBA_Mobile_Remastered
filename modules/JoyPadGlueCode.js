"use strict";function keyDown(e){for(var n=0|e.keyCode,t=0;(0|t)<10;t=1+(0|t)|0)if((0|IodineGUI.defaults.keyZonesGBA[0|t])==(0|n))return IodineGUI.Iodine.keyDown(0|t),void(e.preventDefault&&e.preventDefault())}function keyUpGBA(e){e|=0;for(var n=0;(0|n)<10;n=1+(0|n)|0)if((0|IodineGUI.defaults.keyZonesGBA[0|n])==(0|e))return void IodineGUI.Iodine.keyUp(0|n)}function keyUp(e){e|=0;for(var n=0;(0|n)<8;n=1+(0|n)|0)if((0|IodineGUI.defaults.keyZonesControl[0|n])==(0|e))return keyboardEmulatorControl(0|n),!0;return!1}function keyUpPreprocess(e){var n=0|e.keyCode;IodineGUI.toMap?(IodineGUI.toMap[0|IodineGUI.toMapIndice]=0|n,IodineGUI.toMap=null,saveKeyBindings()):keyUp(0|n)||keyUpGBA(n)}function keyboardEmulatorControl(e){switch(0|(e|=0)){case 0:stepVolume(-.04);break;case 1:stepVolume(.04);break;case 2:IodineGUI.Iodine.incrementSpeed(.05);break;case 3:IodineGUI.Iodine.incrementSpeed(-.05);break;case 4:IodineGUI.Iodine.setSpeed(1);break;case 5:toggleFullScreen();break;case 6:togglePlayState();break;case 7:IodineGUI.Iodine.restart()}}function toggleFullScreen(){document.fullscreenElement||document.mozFullScreenElement||document.webkitFullscreenElement||document.msFullscreenElement?document.exitFullscreen?document.exitFullscreen():document.msExitFullscreen?document.msExitFullscreen():document.mozCancelFullScreen?document.mozCancelFullScreen():document.webkitExitFullscreen&&document.webkitExitFullscreen():document.documentElement.requestFullscreen?document.documentElement.requestFullscreen():document.documentElement.msRequestFullscreen?document.documentElement.msRequestFullscreen():document.documentElement.mozRequestFullScreen?document.documentElement.mozRequestFullScreen():document.documentElement.webkitRequestFullscreen&&document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)}function togglePlayState(){IodineGUI.isPlaying?IodineGUI.Iodine.pause():IodineGUI.Iodine.play()}


/* === Support Manette GBA avec Gamepad API === */
// Mapping GBA (indices = ceux attendus par Iodine)
const gamepadMap = {
    0: 0,   // A (Bouton 0)
    1: 1,   // B (Bouton 1)
    8: 2,   // SELECT
    9: 3,   // START
    12: 6,  // Haut (D-pad Up)
    13: 7,  // Bas
    14: 5,  // Gauche 
    15: 4,  // Droite 
    4: 8,   // L
    5: 9    // R
};

// État précédent pour détecter press/release
let prevButtons = {};

// Fonction utilitaire pour gérer les axes
function handleAxis(value, keyName, gbaKey) {
    const threshold = 0.4; // deadzone
    let pressed = false;

    if (keyName.includes("LEFT") && value < -threshold) pressed = true;
    if (keyName.includes("RIGHT") && value > threshold) pressed = true;
    if (keyName.includes("UP") && value < -threshold) pressed = true;
    if (keyName.includes("DOWN") && value > threshold) pressed = true;

    if (pressed && !prevButtons[keyName]) {
        IodineGUI.Iodine.keyDown(gbaKey);
    } else if (!pressed && prevButtons[keyName]) {
        IodineGUI.Iodine.keyUp(gbaKey);
    }

    prevButtons[keyName] = pressed;
}

// Mise à jour de l'état de la manette
function updateGamepad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = pads[0]; // première manette

    if (gp) {
        // --- Gestion des boutons ---
        Object.keys(gamepadMap).forEach((btnIndex) => {
            const gbaKey = gamepadMap[btnIndex];
            const pressed = gp.buttons[btnIndex]?.pressed;

            if (pressed && !prevButtons[btnIndex]) {
                IodineGUI.Iodine.keyDown(gbaKey);
            } else if (!pressed && prevButtons[btnIndex]) {
                IodineGUI.Iodine.keyUp(gbaKey);
            }

            prevButtons[btnIndex] = pressed;
        });

        // --- Gestion du stick gauche (axes[0] = X, axes[1] = Y) ---
        handleAxis(gp.axes[0], "LEFT", 5);   // Gauche
        handleAxis(gp.axes[0], "RIGHT", 4);  // Droite
        handleAxis(gp.axes[1], "UP", 6);     // Haut
        handleAxis(gp.axes[1], "DOWN", 7);   // Bas

        // --- Gestion du stick droit (axes[2] = X, axes[3] = Y) ---
        if (gp.axes.length >= 4) {
            handleAxis(gp.axes[2], "RIGHT_LEFT", 5);   // Gauche
            handleAxis(gp.axes[2], "RIGHT_RIGHT", 4);  // Droite
            handleAxis(gp.axes[3], "RIGHT_UP", 6);     // Haut
            handleAxis(gp.axes[3], "RIGHT_DOWN", 7);   // Bas
        }
    }

    requestAnimationFrame(updateGamepad);
}

// Quand une manette est branchée
window.addEventListener("gamepadconnected", (e) => {
    console.log("Manette détectée :", e.gamepad.id);
    updateGamepad();
});

// Quand une manette est débranchée
window.addEventListener("gamepaddisconnected", (e) => {
    console.log("Manette déconnectée :", e.gamepad.id);
    prevButtons = {};
});
