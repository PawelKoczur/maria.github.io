// CONFIG - UZUPEŁNIJ SWOJE DANE
const FORMSPREE_ID = "xpqvvqaz"; 
const JSONBIN_BIN_ID = "6a6fbc55da38895dfeb10e05"; 
const JSONBIN_API_KEY = "TUTAJ_WKLEJ_SWOJ_MASTER_KEY"; 

// Ustaw czas odliczania w minutach (np. 15 minut):
const COUNTDOWN_MINUTES = 5; 

let chosenMode = ''; 
let selectedActivities = [];
let dodgeCount = 0;
let timerInterval = null;

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

// Blokowanie bazy w JSONBin
async function disableBin() {
  try {
    await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
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
}

// Funkcja obsługująca wygaśnięcie timera
async function handleTimerExpired() {
  if (timerInterval) clearInterval(timerInterval);

  // Blokujemy bazę w chmurze
  await disableBin();

  // Wyświetlamy ekran wygaśnięcia czasu
  document.body.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; height:100vh; background:#080415; color:#fff; text-align:center; font-family:sans-serif; padding:20px;">
      <div>
        <h1 style="font-size:3.5rem; margin-bottom:10px;">⏳</h1>
        <h2>Czas minął!</h2>
        <p style="color:#94a3b8; margin-top:10px;">Zaproszenie wygasło, ponieważ odpowiedź nie została udzielona na czas.</p>
      </div>
    </div>
  `;
}

// Inicjalizacja i uruchomienie Timera
function startCountdownTimer(isAdmin) {
  // Jeśli już istnieje pasek timera, nie twórz kolejnego
  if (document.getElementById('timerBar')) return;

  const timerBar = document.createElement('div');
  timerBar.id = 'timerBar';
  timerBar.style.cssText = `
    position: fixed;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #f8fafc;
    padding: 8px 18px;
    border-radius: 30px;
    font-family: sans-serif;
    font-weight: 600;
    font-size: 0.95rem;
    z-index: 9999;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    letter-spacing: 0.5px;
  `;
  document.body.appendChild(timerBar);

  // Sprawdzamy czy czas otwarcia jest zapisany w pamięci sesji
  let endTime = sessionStorage.getItem('invite_end_time');
  if (!endTime) {
    endTime = Date.now() + COUNTDOWN_MINUTES * 60 * 1000;
    sessionStorage.setItem('invite_end_time', endTime);
  } else {
    endTime = parseInt(endTime, 10);
  }

  function updateTimer() {
    const remaining = endTime - Date.now();

    if (remaining <= 0) {
      clearInterval(timerInterval);
      if (!isAdmin) {
        handleTimerExpired();
      } else {
        timerBar.innerText = "⏱️ Czas minął (Tryb Admina)";
      }
      return;
    }

    const mins = Math.floor(remaining / (1000 * 60));
    const secs = Math.floor((remaining % (1000 * 60)) / 1000);
    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');

    timerBar.innerText = `⏱️ Czas na odpowiedź: ${formattedMins}:${formattedSecs}`;
  }

  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}

// Inicjalizacja po załadowaniu DOM
window.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const isAdmin = urlParams.get('admin') === 'tak';

  if (!isAdmin) {
    try {
      const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
        headers: { 'X-Master-Key': JSONBIN_API_KEY }
      });
      const data = await res.json();
      
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
  startCountdownTimer(isAdmin);

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
  if (timerInterval) clearInterval(timerInterval);
  const timerBar = document.getElementById('timerBar');
  if (timerBar) timerBar.remove();

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

  // 1. ZAMYKAMY BAZĘ W CHMURZE
  await disableBin();

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
