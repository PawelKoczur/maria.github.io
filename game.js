// CONFIG - PODMIEN SWÓJ TELEFON I ID FORMSPREE
const FORMSPREE_ID = "https://formspree.io/f/xpqvvqaz"; 
const PHONE_NUMBER = "48796770554"; // Twój numer w formacie np. 48123456789

let chosenMode = ''; // 'RANDKA', 'KOLEDZY', 'NIE'
let selectedActivities = [];
let dodgeCount = 0;

// Tworzenie serc w tle
function createFloatingHearts() {
  const container = document.getElementById('heartsContainer');
  if (!container) return;
  const icons = ['✨', '💜', '🌸', '💖'];
  for (let i = 0; i < 15; i++) {
    const particle = document.createElement('div');
    particle.className = 'heart-particle';
    particle.innerText = icons[Math.floor(Math.random() * icons.length)];
    particle.style.left = Math.random() * 100 + 'vw';
    particle.style.animationDuration = (Math.random() * 5 + 6) + 's';
    particle.style.animationDelay = (Math.random() * 5) + 's';
    container.appendChild(particle);
  }
}

// Inicjalizacja po załadowaniu DOM
window.addEventListener('DOMContentLoaded', () => {
  createFloatingHearts();

  // Ustawienie domyślnej daty na jutro
  const datePicker = document.getElementById('datePicker');
  if (datePicker) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    datePicker.value = tomorrow.toISOString().split('T')[0];
    datePicker.min = new Date().toISOString().split('T')[0];
  }

  showScreen('step1');
});

function showScreen(id) {
  document.querySelectorAll('.card > div').forEach(el => el.classList.add('hidden'));
  const target = document.getElementById(id);
  if (target) target.classList.remove('hidden');
}

function goToStep(stepNumber) {
  showScreen('step' + stepNumber);
}

function goBack(targetStepId) {
  if (targetStepId === 'step1') {
    dodgeCount = 0;
    const btn = document.getElementById('noBtn');
    if (btn) btn.style.transform = 'translate(0, 0)';
  }
  showScreen(targetStepId);
}

// Uciekanie 3 razy dla opcji odmowy
function dodgeNoButton() {
  if (dodgeCount < 3) {
    const btn = document.getElementById('noBtn');
    const x = (Math.random() - 0.5) * 180;
    const y = (Math.random() - 0.5) * 90;
    btn.style.transform = `translate(${x}px, ${y}px)`;
    dodgeCount++;
  }
}

function handleNoClick(e) {
  if (dodgeCount < 3) {
    if (e) e.preventDefault();
    dodgeNoButton();
  } else {
    chosenMode = 'NIE';
    showScreen('rejected');
  }
}

function selectMode(mode) {
  chosenMode = mode;
  if (mode === 'RANDKA') {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  }
  showScreen('step2');
}

function toggleActivity(btn, name) {
  btn.classList.toggle('selected');
  if (selectedActivities.includes(name)) {
    selectedActivities = selectedActivities.filter(item => item !== name);
  } else {
    selectedActivities.push(name);
  }
}

function sendResponse(decision) {
  const customInput = document.getElementById('customInput');
  const datePicker = document.getElementById('datePicker');
  const customIdea = customInput ? customInput.value : '';
  const chosenDate = datePicker ? datePicker.value : '';
  const actsText = selectedActivities.join(', ') || 'Brak zaznaczonych';
  
  let modeLabel = '';
  if (decision === 'NIE' || chosenMode === 'NIE') {
    modeLabel = 'Zostańmy przy znajomości bez wyjścia 🤝';
  } else if (chosenMode === 'RANDKA') {
    modeLabel = 'Wyjście na RANDKĘ! 🌹';
  } else {
    modeLabel = 'Wyjście PO KOLEŻEŃSKU 🍕';
  }

  const data = {
    Adresat: 'Maria',
    Wybór_Relacji: modeLabel,
    Wybrane_aktywnosci: decision === 'NIE' ? 'Brak' : actsText,
    Wlasny_pomysl: customIdea || 'Brak',
    Wybrana_data: decision === 'NIE' ? 'Brak' : (chosenDate || 'Nie podano')
  };

  if (FORMSPREE_ID !== "TUTAJ_WKLEJ_SWOJ_ID") {
    fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  if (decision === 'TAK') {
    if (PHONE_NUMBER !== "48123456789") {
      const msg = encodeURIComponent(`Cześć! Wybrałam: ${modeLabel}. Atrakcje: ${actsText}. Data: ${chosenDate}.${customIdea ? ' Pomysł: ' + customIdea : ''}`);
      const waBtn = document.getElementById('waBtn');
      if (waBtn) {
        waBtn.href = `https://wa.me/${PHONE_NUMBER}?text=${msg}`;
        waBtn.classList.remove('hidden');
      }
    }
    
    confetti({ particleCount: 140, spread: 100, origin: { y: 0.4 } });
    showScreen('step4');
  } else {
    // Finał przy wybraniu opcji "Bez wyjścia"
    document.getElementById('finalEmoji').innerText = '🤝';
    document.getElementById('finalTitle').innerText = 'Dzięki za odpowiedź!';
    document.getElementById('finalText').innerText = 'Dostałem powiadomienie. Pełen luz, widzimy się jak zawsze!';
    document.getElementById('waBtn').classList.add('hidden');
    showScreen('step4');
  }
}
