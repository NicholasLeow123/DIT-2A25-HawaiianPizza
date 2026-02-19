//Code for the js filter functionality, assisted by AI

// Filter and results with pill buttons

async function loadCategories(type) {
  const res = await fetch(`/api/categories?type=${encodeURIComponent(type)}`);
  if (!res.ok) throw new Error('Failed to load categories');
  return res.json();
}

function createFilterButtons(categories) {
  const container = document.getElementById('filters-bar');

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-pill';
    btn.textContent = cat.name;
    btn.dataset.value = String(cat.id);
    container.appendChild(btn);
  });
}

function clearActive() {
  const buttons = document.querySelectorAll('.filter-pill');
  buttons.forEach(b => b.classList.remove('active'));
}

function renderResults(items) {
  const ul = document.getElementById('results');
  ul.innerHTML = '';
  items.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${p.title}</strong><br>${p.description || ''}<br><small>Category: ${p.category?.name || ''}</small>`;
    ul.appendChild(li);
  });
}

async function fetchProducts(filterCategoryId = '') {
  const params = new URLSearchParams();
  if (filterCategoryId) params.set('categories', filterCategoryId);
  const res = await fetch(`/api/products/search?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

async function setup() {
  const categories = await loadCategories('product');
  createFilterButtons(categories);

  const container = document.getElementById('filters-bar');
  container.addEventListener('click', async (e) => {
    if (e.target.tagName !== 'BUTTON') return;
    clearActive();
    e.target.classList.add('active');
    const catId = e.target.dataset.value;
    const json = await fetchProducts(catId);
    renderResults(json.data || []);
  });

  // Load all products initially
  const json = await fetchProducts();
  renderResults(json.data || []);
}

setup();