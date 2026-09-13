// Définition de nos 7 thèmes
const totalThemes = 7;

// Fonction exécutée au chargement de chaque page
document.addEventListener('DOMContentLoaded', () => {
    // On regarde si un thème est déjà sauvegardé, sinon on met le 0 par défaut
    let savedTheme = localStorage.getItem('currentTheme') || 0;
    applyTheme(parseInt(savedTheme), false);
});

function changeTheme(direction) {
    let currentTheme = parseInt(localStorage.getItem('currentTheme') || 0);
    let newTheme = currentTheme + direction;

    // Boucle pour passer du dernier au premier et inversement
    if (newTheme >= totalThemes) newTheme = 0;
    if (newTheme < 0) newTheme = totalThemes - 1;

    // On sauvegarde le nouveau choix et on l'applique avec la musique
    localStorage.setItem('currentTheme', newTheme);
    applyTheme(newTheme, true);
}

function applyTheme(themeIndex, playMusic) {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');

    // 1. Changer la classe CSS du body
    body.className = ''; // On nettoie les anciennes classes
    body.classList.add(`theme-${themeIndex}`);

    // 2. Changer l'icône (ON REMET 'acceuil' POUR CORRESPONDRE À VOTRE DOSSIER)
    if(themeIcon) {
        themeIcon.src = `PNG_page_acceuil/icon${themeIndex}.png`;
    }

    // 3. Gérer la musique
    // On coupe toutes les musiques
    for (let i = 0; i < totalThemes; i++) {
        let audio = document.getElementById(`audio-theme-${i}`);
        if(audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }

    // On lance la nouvelle musique SEULEMENT si l'utilisateur a cliqué sur le bouton
    if (playMusic) {
        let currentAudio = document.getElementById(`audio-theme-${themeIndex}`);
        if (currentAudio) currentAudio.play();
    }
}

// 4. NOUVELLE FONCTION : Permet de Play/Pause en cliquant sur l'icône !
function toggleAudio() {
    let currentTheme = parseInt(localStorage.getItem('currentTheme') || 0);
    let currentAudio = document.getElementById(`audio-theme-${currentTheme}`);
    
    if (currentAudio) {
        if (currentAudio.paused) {
            currentAudio.play();
        } else {
            currentAudio.pause();
        }
    }
}

// Effet de fond dynamique selon le scroll (Parallax adaptatif)
window.addEventListener('scroll', () => {
    let scrollTop = window.scrollY; // Là où vous êtes
    let docHeight = document.body.scrollHeight - window.innerHeight; // La hauteur totale scrollable de la page

    // Sécurité : si la page est trop courte et qu'il n'y a rien à scroller, on ne fait rien (évite que ça ne bouge trop)
    if (docHeight <= 0) {
        document.body.style.backgroundPosition = "center 0px";
        return;
    }

    // On calcule le pourcentage de défilement (entre 0 et 1)
    let scrollPercent = scrollTop / docHeight;

    // L'image va bouger de 0px (en haut) jusqu'à un maximum de 200px (en bas de page)
    let maxScrollMove = 200; 
    let currentMove = scrollPercent * maxScrollMove;

    // On applique la position de l'image en direct
    document.body.style.backgroundPosition = `center ${currentMove}px`;
});