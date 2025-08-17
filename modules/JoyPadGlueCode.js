/* === Support Manette GBA avec Gamepad API === */

// Mapping GBA (indices = ceux attendus par Iodine)
// ⚠️ On garde exactement tes chiffres
const gamepadMap = {
    0: 0,   // A
    1: 1,   // B
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

// Mise à jour de l'état de la manette
function updateGamepad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = pads[0]; // première manette connectée

    if (gp) {
        // --- Gestion des boutons (croix + ABLR etc.)
        Object.keys(gamepadMap).forEach((btnIndex) => {
            const gbaKey = gamepadMap[btnIndex];
            const button = gp.buttons[btnIndex];
            const pressed = button ? button.pressed : false;

            if (pressed && !prevButtons[btnIndex]) {
                IodineGUI.Iodine.keyDown(gbaKey);
            } else if (!pressed && prevButtons[btnIndex]) {
                IodineGUI.Iodine.keyUp(gbaKey);
            }

            prevButtons[btnIndex] = pressed;
        });

        // --- Gestion des sticks (gauche et droit)
        const threshold = 0.4;

        // Stick gauche = gp.axes[0] (X), gp.axes[1] (Y)
        handleAxis(gp.axes[0], "LEFT", 5);   // Gauche
        handleAxis(gp.axes[0], "RIGHT", 4);  // Droite
        handleAxis(gp.axes[1], "UP", 6);     // Haut
        handleAxis(gp.axes[1], "DOWN", 7);   // Bas

        // Stick droit = gp.axes[2] (X), gp.axes[3] (Y)
        if (gp.axes.length >= 4) {
            handleAxis(gp.axes[2], "RIGHT_LEFT", 5);  // Gauche
            handleAxis(gp.axes[2], "RIGHT_RIGHT", 4); // Droite
            handleAxis(gp.axes[3], "RIGHT_UP", 6);    // Haut
            handleAxis(gp.axes[3], "RIGHT_DOWN", 7);  // Bas
        }
    }

    requestAnimationFrame(updateGamepad);
}

// Fonction utilitaire pour gérer les axes
function handleAxis(value, keyName, gbaKey) {
    const threshold = 0.4;
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
