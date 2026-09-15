// Définition de nos 7 thèmes
const totalThemes = 7;

// Association des logos avec chaque thème (0 à 6)
// (Tu peux réorganiser l'ordre dans ce tableau si tu veux associer un autre logo à un thème précis)
const themeLogos = [
    'logo-jazz.png',
    'logo-retro.png', 
    'logo-reve.png', 
    'logo-epic.png', 
    'logo-enfant.png',
    'logo-classic.png',
    'logo-sport.png',   
];

// Fonction exécutée au chargement de chaque page
document.addEventListener('DOMContentLoaded', () => {
    let savedTheme = parseInt(localStorage.getItem('currentTheme'), 10);
    if (isNaN(savedTheme)) savedTheme = 0;
    
    applyTheme(savedTheme, false);
});

// ÉCOUTEUR GLOBAL : Premier clic / toucher pour lancer la musique
function toutPremierClic() {
    let currentTheme = parseInt(localStorage.getItem('currentTheme'), 10);
    if (isNaN(currentTheme)) currentTheme = 0;

    let currentAudio = document.getElementById(`audio-theme-${currentTheme}`);
    let muteBtn = document.getElementById('mute-btn');

    if (currentAudio && currentAudio.paused) {
        currentAudio.play().then(() => {
            if (muteBtn) muteBtn.textContent = '🔊';
        }).catch(error => {
            console.warn("Autoplay bloqué par le navigateur :", error);
        });
    }

    window.removeEventListener('click', toutPremierClic);
    window.removeEventListener('touchstart', toutPremierClic);
}

window.addEventListener('click', toutPremierClic);
window.addEventListener('touchstart', toutPremierClic);


function changeTheme(direction) {
    let currentTheme = parseInt(localStorage.getItem('currentTheme'), 10);
    if (isNaN(currentTheme)) currentTheme = 0;
    
    let newTheme = currentTheme + direction;

    if (newTheme >= totalThemes) newTheme = 0;
    if (newTheme < 0) newTheme = totalThemes - 1;

    localStorage.setItem('currentTheme', newTheme);
    applyTheme(newTheme, true);
}

function applyTheme(themeIndex, playMusic) {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    const headerLogo = document.getElementById('header-logo'); // Récupération du logo principal
    const muteBtn = document.getElementById('mute-btn');

    // 1. Changer la classe CSS du body
    for (let i = 0; i < totalThemes; i++) {
        body.classList.remove(`theme-${i}`);
    }
    body.classList.add(`theme-${themeIndex}`);

    // 2. Changer l'icône du sélecteur
    if (themeIcon) {
        themeIcon.src = `PNG_page_acceuil/icon${themeIndex}.png`;
    }

    // 3. Changer le logo "Alexis BOUCHAUD" principal
    if (headerLogo && themeLogos[themeIndex]) {
        headerLogo.src = `PNG_page_acceuil/${themeLogos[themeIndex]}`;
    }

    // 4. Gérer la musique : couper toutes les pistes
    for (let i = 0; i < totalThemes; i++) {
        let audio = document.getElementById(`audio-theme-${i}`);
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }

    // On lance la musique du thème choisi
    if (playMusic) {
        let currentAudio = document.getElementById(`audio-theme-${themeIndex}`);
        if (currentAudio) {
            currentAudio.play().then(() => {
                if (muteBtn) muteBtn.textContent = '🔊';
            }).catch(error => {
                console.warn("Lecture bloquée :", error);
            });
        }
    }
}

// Bouton Mute / Unmute
function toggleAudio() {
    let currentTheme = parseInt(localStorage.getItem('currentTheme'), 10);
    if (isNaN(currentTheme)) currentTheme = 0;
    
    let currentAudio = document.getElementById(`audio-theme-${currentTheme}`);
    let muteBtn = document.getElementById('mute-btn');
    
    if (currentAudio) {
        if (currentAudio.paused) {
            currentAudio.play().catch(error => console.warn("Lecture bloquée :", error));
            if (muteBtn) muteBtn.textContent = '🔊';
        } else {
            currentAudio.pause();
            if (muteBtn) muteBtn.textContent = '🔇';
        }
    }
}

// Parallax au scroll
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            let scrollTop = window.scrollY;
            let docHeight = document.body.scrollHeight - window.innerHeight;

            if (docHeight > 0) {
                let scrollPercent = scrollTop / docHeight;
                let maxScrollMove = 200; 
                let currentMove = scrollPercent * maxScrollMove;
                document.body.style.backgroundPosition = `center ${currentMove}px`;
            } else {
                document.body.style.backgroundPosition = "center 0px";
            }
            
            ticking = false;
        });
        ticking = true;
    }
});