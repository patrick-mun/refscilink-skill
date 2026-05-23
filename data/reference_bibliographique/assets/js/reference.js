const JSON_PATH = 'json/references.json';
const storageKey = id => `refscilink.validation.${id}`;

async function loadReferences() {
  const response = await fetch(JSON_PATH);
  if (!response.ok) throw new Error(`Impossible de charger ${JSON_PATH}`);
  return response.json();
}

function getLocalValidation(ref) {
  const local = localStorage.getItem(storageKey(ref.id));
  return local || ref.validation_status || 'a_valider';
}

function summaryHTML(ref) {
  const points = (ref.points_cles || []).map(p => `<li>${escapeHTML(p)}</li>`).join('');
  return `
    <h3>Résumé détaillé</h3>
    <p>${escapeHTML(ref.resume_detaille || 'Résumé détaillé à compléter.')}</p>
    <h3>Points clés</h3>
    <ul>${points || '<li>Points clés à compléter.</li>'}</ul>
    <h3>Intérêt pour le projet</h3>
    <p>${escapeHTML(ref.interet_pour_le_projet || 'À préciser.')}</p>
    <h3>Limites</h3>
    <p>${escapeHTML(ref.limites || 'À préciser.')}</p>`;
}

function escapeHTML(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

function renderReferences(references) {
  const list = document.querySelector('#referencesList');
  const template = document.querySelector('#referenceCardTemplate');
  const query = document.querySelector('#refSearch')?.value.toLowerCase() || '';
  const theme = document.querySelector('#themeFilter')?.value || 'all';
  const validation = document.querySelector('#validationFilter')?.value || 'all';
  list.innerHTML = '';

  references
    .filter(ref => theme === 'all' || (ref.theme || 'Non classé') === theme)
    .filter(ref => validation === 'all' || getLocalValidation(ref) === validation)
    .filter(ref => JSON.stringify(ref).toLowerCase().includes(query))
    .forEach(ref => {
      const node = template.content.cloneNode(true);
      const status = getLocalValidation(ref);
      node.querySelector('.ref-number').textContent = `#${ref.numero}`;
      node.querySelector('.ref-theme').textContent = ref.theme || 'Non classé';
      node.querySelector('.ref-access').textContent = ref.access_type || 'unknown';
      node.querySelector('.ref-validation').textContent = status === 'valide' ? 'Validé' : status === 'a_corriger' ? 'À corriger' : 'Non validé';
      node.querySelector('.ref-title').textContent = ref.titre || ref.raw_reference || 'Référence sans titre';
      node.querySelector('.ref-meta').textContent = `${(ref.auteurs || []).join(', ')} ${ref.annee ? `(${ref.annee})` : ''} ${ref.journal || ''}`.trim();
      node.querySelector('.ref-short').textContent = ref.resume_court || ref.raw_reference || '';
      const source = node.querySelector('.view-source');
      source.href = ref.url || ref.pdf_url || `https://doi.org/${ref.doi || ''}`;
      source.toggleAttribute('hidden', !(ref.url || ref.pdf_url || ref.doi));
      node.querySelector('.read-summary').addEventListener('click', event => {
        const box = event.currentTarget.closest('.ref-card').querySelector('.ref-summary');
        box.hidden = !box.hidden;
      });
      node.querySelector('.copy-reference').addEventListener('click', async () => {
        await navigator.clipboard.writeText(ref.raw_reference || ref.titre || '');
      });
      node.querySelector('.validate-reference').addEventListener('click', event => {
        localStorage.setItem(storageKey(ref.id), 'valide');
        event.currentTarget.closest('.ref-card').querySelector('.ref-validation').textContent = 'Validé';
      });
      node.querySelector('.ref-summary').innerHTML = summaryHTML(ref);
      list.appendChild(node);
    });
}

function populateThemes(references) {
  const select = document.querySelector('#themeFilter');
  if (!select) return;
  [...new Set(references.map(r => r.theme || 'Non classé'))].sort().forEach(theme => {
    const option = document.createElement('option');
    option.value = theme;
    option.textContent = theme;
    select.appendChild(option);
  });
}

async function init() {
  try {
    const references = await loadReferences();
    populateThemes(references);
    renderReferences(references);
    ['#refSearch', '#themeFilter', '#validationFilter'].forEach(sel => {
      document.querySelector(sel)?.addEventListener('input', () => renderReferences(references));
      document.querySelector(sel)?.addEventListener('change', () => renderReferences(references));
    });
  } catch (error) {
    const list = document.querySelector('#referencesList');
    if (list) list.textContent = error.message;
  }
}

document.addEventListener('DOMContentLoaded', init);
