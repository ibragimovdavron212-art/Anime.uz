javascript
const API = 'https://api.jikan.moe/v4';
const grid = document.getElementById('animeGrid');
const loader = document.getElementById('loader');
const empty = document.getElementById('empty');
const sectionTitle = document.getElementById('sectionTitle');
const hero = document.getElementById('hero');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');

// Loader boshqaruvi
function showLoader() {
  loader.classList.remove('hidden');
  grid.innerHTML = '';
  empty.classList.add('hidden');
}
function hideLoader() {
  loader.classList.add('hidden');
}

// Kartochka yasash
function createCard(anime) {
  const card = document.createElement('div');
  card.className = 'anime-card';
  card.onclick = () => showDetails(anime.mal_id);
  card.innerHTML = `
    <img src="${anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || ''}" 
         alt="${anime.title}" loading="lazy"
         onerror="this.src='https://via.placeholder.com/200x290/16161f/ff4d6d?text=No+Image'">
    <div class="info">
      <h3>${anime.title_english || anime.title}</h3>
      <div class="meta">
        <span class="score">⭐ ${anime.score || 'N/A'}</span>
        <span>${anime.episodes ? anime.episodes + ' ep' : (anime.status || '')}</span>
      </div>
    </div>
  `;
  return card;
}

// Animelarni chiqarish
function renderAnime(list) {
  grid.innerHTML = '';
  if (!list || list.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  list.forEach(a => grid.appendChild(createCard(a)));
}
// Fetch qilish
async function fetchAPI(url) {
  showLoader();
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Xatolik');
    return await res.json();
  } catch (e) {
    console.error(e);
    empty.classList.remove('hidden');
    return null;
  } finally {
    hideLoader();
  }
}

// Bosh sahifa
async function showHome() {
  hero.classList.remove('hidden');
  sectionTitle.textContent = '🔥 Mashhur animelar';
  const data = await fetchAPI(`${API}/top/anime?limit=24`);
  if (data) renderAnime(data.data);
}

// Top animelar
async function loadTop() {
  hero.classList.add('hidden');
  sectionTitle.textContent = '🏆 Top 24 animelar';
  const data = await fetchAPI(`${API}/top/anime?limit=24`);
  if (data) renderAnime(data.data);
}

// Efirda
async function loadAiring() {
  hero.classList.add('hidden');
  sectionTitle.textContent = '📺 Hozir efirda';
  const data = await fetchAPI(`${API}/seasons/now?limit=24`);
  if (data) renderAnime(data.data);
}

// Qidiruv
async function searchAnime() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return;
  hero.classList.add('hidden');
  sectionTitle.textContent = `🔍 "${query}" bo‘yicha natijalar`;
  const data = await fetchAPI(`${API}/anime?q=${encodeURIComponent(query)}&limit=24`);
  if (data) renderAnime(data.data);
}

// Enter bosilganda qidirish
document.getElementById('searchInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') searchAnime();
});

// Anime detali
async function showDetails(id) {
  modal.classList.remove('hidden');
  modalBody.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
  try {
    const res = await fetch(`${API}/anime/${id}/full`);
    const data = await res.json();
    const a = data.data;
    modalBody.innerHTML = `
      <div class="modal-body-inner">
        <img src="${a.images?.jpg?.large_image_url || a.images?.jpg?.image_url}" alt="${a.title}">
        <div class="modal-text">
          <h2>${a.title_english || a.title}</h2>
          <p><strong>Reyting:</strong> ⭐ ${a.score || 'N/A'} | <strong>Epizodlar:</strong> ${a.episodes || '?'} | <strong>Holat:</strong> ${a.status || '?'}</p>
          <p><strong>Chiqqan sana:</strong> ${a.aired?.string || 'N/A'}</p>
          <p><strong>Studiya:</strong> ${a.studios?.map(s => s.name).join(', ') || 'N/A'}</p>
          <div class="tags">
            ${(a.genres || []).map(g => `<span>${g.name}</span>`).join('')}
          </div>
          <p>${a.synopsis || 'Tavsif mavjud emas.'}</p>
          <button class="watch-btn" onclick="watchAnime('${a.title}', ${a.mal_id})">▶ Ko‘rish</button>
        </div>
      </div>
    `;
  } catch (e) {
    modalBody.innerHTML = '<p>Ma’lumot yuklanmadi.</p>';
  }
}

// Video pleer (YouTube embed yoki o‘z manzilingiz)
function watchAnime(title, id) {
  modalBody.innerHTML = `
    <h2 style="margin-bottom:15px;">▶ ${title}</h2>
    <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:10px;">
      <iframe 
        src="https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(title + ' anime trailer')}"
        style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"
        allowfullscreen>
      </iframe>
    </div>
    <p style="margin-top:15px;color:#9a9aad;font-size:13px;">
      Eslatma: Bu yerda YouTube treyler ko‘rsatilmoqda. O‘z video manzilingizni qo‘shish uchun 
      <code>watchAnime()</code> funksiyasini tahrirlang.
    </p>
  `;
}

function closeModal() {
  modal.classList.add('hidden');
  modalBody.innerHTML = '';
}
modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

// Boshlanish
showHome();
