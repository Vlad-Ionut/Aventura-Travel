const log = document.getElementById('chat-log');
const form = document.getElementById('chat-form');
const input = document.getElementById('chat-input');

function adaugaMesaj(text, tip) {
  const div = document.createElement('div');
  div.className = 'chat-msg ' + tip;
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

async function trimite(mesaj) {
  adaugaMesaj(mesaj, 'user');
  input.value = '';
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mesaj }),
  });
  const data = await res.json();
  adaugaMesaj(data.raspuns || data.error || 'Eroare', 'bot');
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const m = input.value.trim();
  if (m) trimite(m);
});

document.querySelectorAll('.chat-sugestii button').forEach((btn) => {
  btn.addEventListener('click', () => trimite(btn.dataset.q));
});

adaugaMesaj('Salut! Sunt asistentul Aventura Travel. Cu ce te pot ajuta?', 'bot');
