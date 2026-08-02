// CONFIG - UZUPEŁNIJ SWOJE DANE
const FORMSPREE_ID = "xpqvvqaz"; 
const JSONBIN_BIN_ID = "6a6fbc55da38895dfeb10e05"; 
const JSONBIN_API_KEY = "$2a$10$JPU54/5/By8Q1hZ.VYlV/uefOYJvk6fnJDslwJdGXFddP3UfuImDe"; 

let chosenMode = ''; 
let selectedActivities = [];
let dodgeCount = 0;

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
window.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const isAdmin = urlParams.get('admin') === 'tak';

  // Omijamy sprawdzanie bazy tylko jeśli wchodzisz Ty jako Admin (?admin=tak)
  if (!isAdmin) {
    try {
      // Sprawdzamy status w bazie chmurowej JSONBin
      const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
        headers: { 'X-Master-Key': JSONBIN_API_KEY }
      });
      const data = await res.json();
      
      // Jeśli link w bazie jest już wyłączony (active === false):
      if (data.record && data.record.active === false) {
        document.body.innerHTML = `
          <div style="display:flex; justify-content:center; align-items:center; height:100vh; background:#080415; color:#fff; text-align:center; font-family:sans-serif; padding:20px;">
            <div>
              <h1 style="font-size:3.5rem; margin-bottom:10px;">🔒</h1>
              <h2>Zaproszenie nieaktywne</h2>
              <p style="color:#94a3b8; margin-top:10px;">Odpowiedź została już udzielona lub link wygasł.</p>
            </div>
          </div>
        `;
        return;
      }
    } catch (err) {
      console.error('Błąd weryfikacji bazy:', err);
    }
  }

  createFloatingHearts();

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
  showScreen('step1' && 'step' + stepNumber);
}

function goBack(targetStepId) {
  if (targetStepId === 'step1') {
    dodgeCount = 0;
    const btn = document.getElementById('noBtn');
    if (btn) btn.style.transform = 'translate(0, 0)';
  }
  showScreen(targetStepId);
}

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

async function sendResponse(decision) {
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

  // 1. BLOKUJEMY LINK W BAZIE NA CAŁYM ŚWIECIE
  try {
    fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY
      },
      body: JSON.stringify({ active: false })
    });
  } catch (e) {
    console.error('Błąd blokowania bazy:', e);
  }

  // 2. WYSYŁAMY FORMULARZ DO FORMSPREE
  fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(data)
  }).catch(err => console.error('Błąd wysyłania:', err));

  if (decision === 'TAK') {
    confetti({ particleCount: 140, spread: 100, origin: { y: 0.4 } });
    showScreen('step4');
  } else {
    document.getElementById('finalEmoji').innerText = '🤝';
    document.getElementById('finalTitle').innerText = 'Dzięki za odpowiedź!';
    document.getElementById('finalText').innerText = 'Dostałem powiadomienie. Pełen luz, widzimy się jak zawsze!';
    showScreen('step4');
  }
}
