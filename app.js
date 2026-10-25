'use strict';
const {products} = window.LINIEN;
const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let saved = [];
try {
  const value = JSON.parse(localStorage.getItem('linien-selection') || '[]');
  if (Array.isArray(value)) saved = value.filter(id => products.some(product => product.id === id));
} catch {}
let filter = '全部系列', query = '', shown = 9, toastTimer;
const productDialog = $('#product-dialog'), listDialog = $('#list-dialog');

function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2300);
}
function updateSaved() {
  $('#list-count').textContent = saved.length;
  document.querySelectorAll('[data-save]').forEach(button => {
    const product = products.find(p => p.id === button.dataset.save);
    const selected = saved.includes(product.id);
    button.setAttribute('aria-pressed', selected);
    button.setAttribute('aria-label', (selected ? '取消收藏' : '收藏') + product.name);
    button.textContent = selected ? '已加入选品清单' : '加入我的选品';
  });
}
function persist() {
  try { localStorage.setItem('linien-selection', JSON.stringify(saved)); } catch {}
  updateSaved();
}
function toggleSaved(id) {
  if (!products.some(p => p.id === id)) return;
  if (saved.includes(id)) {
    saved = saved.filter(value => value !== id);
    toast('已从选品清单移除');
  } else {
    saved.push(id);
    toast('已加入选品清单');
  }
  persist();
  if (listDialog.open) renderSelection();
}
function renderProducts() {
  const list = products.filter(p => (filter === '全部系列' || p.category === filter) && (!query || (p.name + p.description + p.category).toLowerCase().includes(query.toLowerCase())));
  $('#product-grid').innerHTML = list.length ? list.slice(0, shown).map(p => `
    <article class="product-card">
      <button class="product-image" data-product="${p.id}" aria-label="查看${escapeHtml(p.name)}系列">
        <img src="${p.image}" alt="${escapeHtml(p.name)}系列陶瓷餐具" loading="lazy" width="900" height="900">
        <span class="product-index" aria-hidden="true">${String(products.indexOf(p) + 1).padStart(2,'0')}</span>
        ${p.isNew ? '<span class="new-badge">NEW · 新品</span>' : ''}
        <span class="view-label">探索系列</span>
      </button>
      <div class="product-caption"><div><small>${escapeHtml(p.category)}</small><button class="product-name" data-product="${p.id}">${escapeHtml(p.name)}</button></div></div>
      <p>${escapeHtml(p.description)}</p>
    </article>`).join('') : '<div class="empty-state">没有找到相关系列，请尝试其他名称或风格。</div>';
  $('#catalog-status').textContent = `${filter} · ${list.length} 个系列${list.length > shown ? ' / 当前展示 ' + shown + ' 个' : ''}`;
  $('#load-more').hidden = shown >= list.length;
  updateSaved();
}
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  shown = 9;
  document.querySelectorAll('[data-filter]').forEach(item => {
    item.classList.toggle('active', item === button);
    item.setAttribute('aria-pressed', item === button);
  });
  renderProducts();
}));
$('#product-search').addEventListener('input', event => { query = event.target.value.trim(); shown = 9; renderProducts(); });
$('#load-more').addEventListener('click', () => { shown += 9; renderProducts(); });
$('#total-collections').textContent = products.length;

function openProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  $('#product-detail').innerHTML = `
    <div class="detail-main"><div class="detail-gallery">
      <img class="main-image" src="${product.image}" alt="${escapeHtml(product.name)}系列主图" width="900" height="900" tabindex="0" role="button" aria-label="放大产品图片">
      <div class="gallery-caption"><span>产品实拍与细节</span><span>${product.gallery.length} 张图片 · 点击主图放大</span></div>
      <div class="thumbnails" aria-label="产品图片列表">${product.gallery.map((image, index) => `<button data-gallery="${index}" class="${index === 0 ? 'selected' : ''}" aria-label="查看第${index + 1}张图片" aria-pressed="${index === 0}"><img src="${image}" alt="${escapeHtml(product.name)}产品图${index + 1}" loading="lazy"></button>`).join('')}</div>
    </div><div class="detail-copy">
      <p class="eyebrow">${escapeHtml(product.category)} / LINIEN${product.isNew ? ' · NEW' : ''}</p>
      <h2 id="detail-title">${escapeHtml(product.name)}</h2><p class="detail-description">${escapeHtml(product.description)}</p>
      <dl class="detail-facts"><div><dt>材质</dt><dd>陶瓷</dd></div><div><dt>工艺</dt><dd>${escapeHtml(product.craft)}</dd></div><div><dt>烧制</dt><dd>${escapeHtml(product.temperature)}</dd></div></dl>
      ${product.origin ? `<p class="detail-origin">产地 · ${escapeHtml(product.origin)}</p>` : ''}
      <p class="detail-tip">让喜欢的器物，走进每一天。可浏览产品实拍与细节图片，具体使用方式请以各产品说明为准。</p>
      <button class="button dark" data-save="${product.id}" aria-pressed="false">加入我的选品</button>
    </div></div>`;
  $('#product-detail').dataset.current = id;
  updateSaved();
  productDialog.showModal();
}
document.addEventListener('click', event => {
  const productButton = event.target.closest('[data-product]');
  if (productButton) openProduct(productButton.dataset.product);
  const saveButton = event.target.closest('[data-save]');
  if (saveButton) toggleSaved(saveButton.dataset.save);
  const galleryButton = event.target.closest('[data-gallery]');
  if (galleryButton) {
    const product = products.find(p => p.id === $('#product-detail').dataset.current);
    const image = $('.main-image');
    image.src = product.gallery[+galleryButton.dataset.gallery];
    image.alt = product.name + '产品详情第' + (+galleryButton.dataset.gallery + 1) + '张';
    image.classList.remove('zoomed');
    document.querySelectorAll('[data-gallery]').forEach(button => {
      button.classList.toggle('selected', button === galleryButton);
      button.setAttribute('aria-pressed', button === galleryButton);
    });
  }
  if (event.target.closest('[data-open-list]')) { renderSelection(); listDialog.showModal(); }
  const removeButton = event.target.closest('[data-remove]');
  if (removeButton) toggleSaved(removeButton.dataset.remove);
});
$('#product-detail').addEventListener('click', event => { if (event.target.classList.contains('main-image')) event.target.classList.toggle('zoomed'); });
$('#product-detail').addEventListener('keydown', event => {
  if (event.target.classList.contains('main-image') && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); event.target.classList.toggle('zoomed'); }
});
$('[data-close-product]').addEventListener('click', () => productDialog.close());
$('[data-close-list]').addEventListener('click', () => listDialog.close());
for (const dialog of [productDialog, listDialog]) dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  }
});
function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], {type}));
  const link = document.createElement('a');
  link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function renderSelection() {
  $('#selection-items').innerHTML = saved.length ? saved.map(id => {
    const p = products.find(product => product.id === id);
    return `<div class="selected-item"><img src="${p.image}" alt="${escapeHtml(p.name)}"><div><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.category)} / 陶瓷 / ${escapeHtml(p.craft)}</p></div><button class="remove-item" data-remove="${p.id}" aria-label="移除${escapeHtml(p.name)}">移除</button></div>`;
  }).join('') : '<div class="empty-state">还没有收藏的系列。<br>打开喜欢的系列，点击「加入我的选品」，收集你的餐桌灵感。</div>';
  $('#download-list').disabled = !saved.length;
  $('#clear-list').disabled = !saved.length;
}
try { $('#selection-note').value = localStorage.getItem('linien-note') || ''; } catch {}
$('#selection-note').addEventListener('input', event => { try { localStorage.setItem('linien-note', event.target.value); } catch {} });
$('#clear-list').addEventListener('click', () => { saved = []; persist(); renderSelection(); toast('选品清单已清空'); });
$('#download-list').addEventListener('click', () => {
  const lines = ['利尼恩 LINIEN · 产品选品清单', '生成日期：' + new Date().toLocaleDateString('zh-CN'), ''];
  for (const [index, id] of saved.entries()) {
    const p = products.find(product => product.id === id);
    lines.push(`${index + 1}. ${p.name} / ${p.category}`, p.description, `材质：陶瓷；工艺：${p.craft}；烧制：${p.temperature}`, '');
  }
  lines.push('补充需求：', $('#selection-note').value.trim() || '未填写', '', '潮州市潮安区利尼恩科技有限公司');
  download('利尼恩选品清单.txt', '\uFEFF' + lines.join('\r\n'), 'text/plain;charset=utf-8');
  toast('选品清单已下载');
});
$('.menu-toggle').addEventListener('click', () => {
  const open = $('#nav').classList.toggle('open');
  $('.menu-toggle').setAttribute('aria-expanded', open);
  $('.menu-toggle').setAttribute('aria-label', open ? '关闭导航' : '打开导航');
});
$('#nav').addEventListener('click', event => {
  if (event.target.closest('a')) { $('#nav').classList.remove('open'); $('.menu-toggle').setAttribute('aria-expanded', 'false'); $('.menu-toggle').setAttribute('aria-label', '打开导航'); }
});
renderProducts();
updateSaved();
