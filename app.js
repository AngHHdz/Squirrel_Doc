(() => {
  const input = document.querySelector('#file-input');
  const zone = document.querySelector('#drop-zone');
  const list = document.querySelector('#file-list');
  const empty = document.querySelector('#empty-state');
  const count = document.querySelector('#file-count');
  const status = document.querySelector('#status-line span:last-child');
  const toast = document.querySelector('#toast');
  const actionTitle = document.querySelector('#action-title');
  const actionHint = document.querySelector('#action-hint');
  const actionButtons = document.querySelector('#action-buttons');
  const files = [];
  let currentView = 'inicio';
  let toastTimer;
  const fmtSize = n => n < 1024 ? `${n} B` : n < 1048576 ? `${(n/1024).toFixed(1)} KB` : n < 1073741824 ? `${(n/1048576).toFixed(1)} MB` : `${(n/1073741824).toFixed(2)} GB`;
  const say = msg => { status.textContent = msg; toast.textContent = msg; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 3600); };
  const safe = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const download = (blob, name) => {
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };
  const selected = () => [...list.querySelectorAll('.pick-file:checked')].map(x => files[Number(x.dataset.index)]).filter(Boolean);
  const ext = f => f.name.split('.').pop().toLowerCase();
  const isPdf = f => ext(f) === 'pdf' || f.type === 'application/pdf';
  const isImage = f => /^image\/(png|jpeg|webp|bmp|gif|avif|tiff?)$/i.test(f.type) || /\.(png|jpe?g|webp|bmp|gif|avif|tiff?)$/i.test(f.name);

  function render() {
    list.innerHTML = '';
    empty.hidden = files.length > 0;
    list.hidden = files.length === 0;
    count.textContent = files.length ? `${files.length} archivo(s) seleccionados · procesamiento en este navegador` : 'Todavía no has añadido archivos.';
    files.forEach((f, i) => {
      const row = document.createElement('div'); row.className = 'file-row';
      row.innerHTML = `<div class="file-name"><input class="pick-file" type="checkbox" data-index="${i}" aria-label="Seleccionar ${safe(f.name)}" checked><span class="file-symbol">▤</span><div><strong>${safe(f.name)}</strong><small>${safe(f.type || 'Tipo no identificado')}</small></div></div><div class="file-meta">${fmtSize(f.size)}</div><div class="file-meta">${safe(f.lastModified ? new Date(f.lastModified).toLocaleDateString() : '')}</div><button class="row-action" data-action="remove" data-index="${i}">Quitar</button>`;
      list.appendChild(row);
    });
    renderActions();
  }
  function add(incoming) {
    let added = 0;
    for (const f of incoming) {
      if (!files.some(x => x.name === f.name && x.size === f.size && x.lastModified === f.lastModified)) { files.push(f); added++; }
    }
    render(); say(added ? `Se añadieron ${added} archivo(s).` : 'Los archivos ya estaban en la lista.');
  }
  function button(label, action, disabled = false) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.dataset.tool = action; b.disabled = disabled;
    actionButtons.appendChild(b);
  }
  function renderActions() {
    actionButtons.innerHTML = '';
    const has = files.length > 0;
    actionTitle.textContent = ({inicio:'Acciones rápidas',convertir:'Conversión de imágenes',pdf:'Herramientas PDF',zip:'Archivos ZIP',archivos:'Información de archivos',hash:'Verificación SHA-256'})[currentView] || 'Acciones';
    actionHint.textContent = has ? 'Marca los archivos que quieras procesar.' : 'Añade archivos primero.';
    if (currentView === 'convertir') button('Convertir imágenes seleccionadas a PNG', 'images', !has || !files.some(isImage));
    else if (currentView === 'pdf') {
      button('Unir PDF seleccionados', 'pdf-merge', !has);
      button('Extraer páginas de un PDF', 'pdf-extract', !has);
      button('Girar páginas de un PDF', 'pdf-rotate', !has);
    } else if (currentView === 'zip') {
      button('Crear ZIP con seleccionados', 'zip-create', !has);
      button('Extraer ZIP seleccionado', 'zip-extract', !has);
    } else if (currentView === 'hash') button('Calcular SHA-256', 'hash', !has);
    else if (currentView === 'archivos') button('Mostrar detalles seleccionados', 'details', !has);
    else {
      button('Convertir imágenes a PNG', 'images', !has || !files.some(isImage));
      button('Unir PDF', 'pdf-merge', !has);
      button('Crear ZIP', 'zip-create', !has);
      button('Calcular SHA-256', 'hash', !has);
    }
  }
  function setView(view) {
    currentView = view;
    document.querySelectorAll('.nav-item').forEach(x => x.classList.toggle('active', x.dataset.view === view));
    const names = {
      inicio:['Herramientas para tus archivos.','Convierte, organiza y verifica archivos desde tu navegador.'],
      convertir:['Convertir imágenes.','Selecciona imágenes compatibles y expórtalas como PNG.'],
      pdf:['Herramientas PDF.','Une documentos PDF, extrae páginas o gira el contenido de una página.'],
      zip:['Comprimir y extraer ZIP.','Crea paquetes ZIP o extrae su contenido en tu equipo.'],
      archivos:['Información de archivos.','Revisa nombre, tipo, tamaño y fecha de modificación.'],
      hash:['Verificación SHA-256.','Calcula la huella criptográfica de archivos en tu navegador.']
    };
    document.querySelector('#page-title').textContent = names[view][0];
    document.querySelector('#page-subtitle').textContent = names[view][1];
    renderActions();
  }

  document.querySelector('#select-files').addEventListener('click', e => { e.stopPropagation(); input.click(); });
  zone.addEventListener('click', e => { if (!e.target.closest('button')) input.click(); });
  zone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
  input.addEventListener('change', () => { add(input.files); input.value = ''; });
  ['dragenter','dragover'].forEach(type => zone.addEventListener(type, e => { e.preventDefault(); zone.classList.add('dragover'); }));
  ['dragleave','drop'].forEach(type => zone.addEventListener(type, e => { e.preventDefault(); zone.classList.remove('dragover'); }));
  zone.addEventListener('drop', e => { e.preventDefault(); add(e.dataTransfer.files); });
  document.querySelector('#clear-files').addEventListener('click', () => { files.splice(0); render(); say('Lista limpiada.'); });
  document.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));
  document.querySelector('#export-list').addEventListener('click', () => {
    if (!files.length) return say('Añade archivos antes de exportar el listado.');
    const csv = ['nombre,tipo,tamaño_bytes,fecha_modificacion', ...files.map(f => [f.name,f.type,f.size,new Date(f.lastModified).toISOString()].map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\r\n');
    download(new Blob(['\ufeff',csv],{type:'text/csv;charset=utf-8'}),'squirrel-doc-archivos.csv'); say('Listado CSV descargado.');
  });
  list.addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (btn?.dataset.action === 'remove') { files.splice(Number(btn.dataset.index),1); render(); say('Archivo quitado de la lista.'); }
  });

  async function convertImages() {
    const items = selected().filter(isImage);
    if (!items.length) return say('Selecciona al menos una imagen compatible.');
    let done = 0;
    for (const f of items) {
      try {
        const bitmap = await createImageBitmap(f);
        const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d', {alpha:true}); ctx.drawImage(bitmap,0,0); bitmap.close();
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        if (!blob) throw new Error('No se pudo generar el PNG');
        download(blob, f.name.replace(/\.[^.]+$/,'')+'.png'); done++;
      } catch (err) { say(`No se pudo convertir ${f.name}: ${err.message}`); }
    }
    if (done) say(`Se convirtieron ${done} imagen(es) a PNG.`);
  }
  async function getPdfLib() {
    if (window.PDFLib) return window.PDFLib;
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js');
    if (!window.PDFLib) throw new Error('No se pudo cargar la biblioteca PDF. Comprueba tu conexión y vuelve a intentarlo.');
    return window.PDFLib;
  }
  async function getJSZip() {
    if (window.JSZip) return window.JSZip;
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
    if (!window.JSZip) throw new Error('No se pudo cargar la biblioteca ZIP. Comprueba tu conexión y vuelve a intentarlo.');
    return window.JSZip;
  }
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = [...document.scripts].find(s => s.src === src);
      if (existing) { if (existing.dataset.loaded === 'true') return resolve(); existing.addEventListener('load',resolve,{once:true}); existing.addEventListener('error',reject,{once:true}); return; }
      const s = document.createElement('script'); s.src = src; s.async = true; s.onload = () => {s.dataset.loaded='true';resolve();}; s.onerror = () => reject(new Error('Fallo al descargar una dependencia externa.'));
      document.head.appendChild(s);
    });
  }
  const getPdfFiles = () => selected().filter(isPdf);
  async function mergePdf() {
    const pdfs = getPdfFiles(); if (pdfs.length < 2) return say('Selecciona al menos dos archivos PDF.');
    const {PDFDocument} = await getPdfLib(); const merged = await PDFDocument.create();
    for (const f of pdfs) { const doc = await PDFDocument.load(await f.arrayBuffer()); const pages = await merged.copyPages(doc, doc.getPageIndices()); pages.forEach(p => merged.addPage(p)); }
    download(new Blob([await merged.save()],{type:'application/pdf'}),'squirrel-doc-unido.pdf'); say(`Se unieron ${pdfs.length} PDF.`);
  }
  async function extractPdf() {
    const f = getPdfFiles()[0]; if (!f) return say('Selecciona un PDF.');
    const raw = prompt('Escribe las páginas que quieres conservar, separadas por coma (ejemplo: 1,3,5-7):','1');
    if (!raw) return;
    const {PDFDocument} = await getPdfLib(); const src = await PDFDocument.load(await f.arrayBuffer());
    const indices = parsePages(raw, src.getPageCount());
    if (!indices.length) return say('No se encontraron páginas válidas.');
    const out = await PDFDocument.create(); const pages = await out.copyPages(src, indices); pages.forEach(p => out.addPage(p));
    download(new Blob([await out.save()],{type:'application/pdf'}),f.name.replace(/\.pdf$/i,'')+'-paginas.pdf'); say(`PDF creado con ${indices.length} página(s).`);
  }
  function parsePages(raw, count) {
    const output = new Set();
    for (const part of raw.split(',')) {
      const m = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/); if (!m) continue;
      let a = Number(m[1]), b = Number(m[2] || m[1]); if (a > b) [a,b] = [b,a];
      for (let n = Math.max(1,a); n <= Math.min(count,b); n++) output.add(n-1);
    }
    return [...output].sort((a,b)=>a-b);
  }
  async function rotatePdf() {
    const f = getPdfFiles()[0]; if (!f) return say('Selecciona un PDF.');
    const pageInput = prompt('Número de página que quieres girar (1 = primera página):','1'); if (!pageInput) return;
    const degInput = prompt('Grados de giro: 90, 180 o 270','90'); if (!degInput) return;
    const pageNum = Number(pageInput), degrees = Number(degInput);
    if (!Number.isInteger(pageNum) || ![90,180,270].includes(degrees)) return say('Indica una página válida y un giro de 90, 180 o 270 grados.');
    const {PDFDocument, degrees: pdfDegrees} = await getPdfLib(); const pdf = await PDFDocument.load(await f.arrayBuffer());
    if (pageNum < 1 || pageNum > pdf.getPageCount()) return say('El número de página está fuera del rango del PDF.');
    const page = pdf.getPage(pageNum-1); page.setRotation(pdfDegrees((page.getRotation().angle + degrees) % 360));
    download(new Blob([await pdf.save()],{type:'application/pdf'}),f.name.replace(/\.pdf$/i,'')+'-girado.pdf'); say(`Se giró la página ${pageNum}.`);
  }
  async function createZip() {
    const items = selected(); if (!items.length) return say('Selecciona archivos para crear un ZIP.');
    const JSZip = await getJSZip(); const zip = new JSZip();
    items.forEach(f => zip.file(f.name,f));
    const blob = await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}});
    download(blob,'squirrel-doc-'+new Date().toISOString().slice(0,10)+'.zip'); say(`ZIP creado con ${items.length} archivo(s).`);
  }
  async function extractZip() {
    const f = selected().find(x => ext(x)==='zip'); if (!f) return say('Selecciona un archivo ZIP.');
    const JSZip = await getJSZip(); const zip = await JSZip.loadAsync(f);
    const entries = Object.values(zip.files).filter(x => !x.dir);
    if (!entries.length) return say('El ZIP no contiene archivos.');
    // Download each entry independently. No extraction to arbitrary filesystem paths.
    for (const entry of entries) {
      const blob = await entry.async('blob');
      const safeName = entry.name.split('/').filter(Boolean).pop() || 'archivo.bin';
      download(blob,safeName);
    }
    say(`Se prepararon ${entries.length} descarga(s) desde el ZIP.`);
  }
  async function hashFiles() {
    const items = selected(); if (!items.length) return say('Selecciona archivos para calcular SHA-256.');
    if (!crypto.subtle) return say('SHA-256 requiere HTTPS o localhost en este navegador.');
    const rows=[];
    for (const f of items) { const digest=await crypto.subtle.digest('SHA-256',await f.arrayBuffer()); rows.push(`${[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join(' ')}  ${f.name}`.replace(/ /g,'')); }
    const text = rows.join('\r\n'); download(new Blob([text],{type:'text/plain;charset=utf-8'}),'squirrel-doc-sha256.txt'); say(`SHA-256 calculado para ${items.length} archivo(s).`);
  }
  function showDetails() {
    const items=selected(); if(!items.length) return say('Selecciona al menos un archivo.');
    const lines=items.map(f=>[`Nombre: ${f.name}`,`Tipo: ${f.type||'No identificado'}`,`Tamaño: ${fmtSize(f.size)}`,`Última modificación: ${new Date(f.lastModified).toLocaleString()}`,''].join('\n'));
    download(new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'}),'squirrel-doc-detalles.txt'); say('Detalles exportados a TXT.');
  }
  actionButtons.addEventListener('click', async e => {
    const b = e.target.closest('button[data-tool]'); if (!b || b.disabled) return;
    const action=b.dataset.tool; b.disabled=true; const old=b.textContent; b.textContent='Procesando…';
    try {
      if(action==='images') await convertImages();
      else if(action==='pdf-merge') await mergePdf();
      else if(action==='pdf-extract') await extractPdf();
      else if(action==='pdf-rotate') await rotatePdf();
      else if(action==='zip-create') await createZip();
      else if(action==='zip-extract') await extractZip();
      else if(action==='hash') await hashFiles();
      else if(action==='details') showDetails();
    } catch(err) { say(`No se completó la operación: ${err.message}`); }
    finally { b.disabled=false; b.textContent=old; }
  });
  document.querySelector('#file-count').title = 'Los navegadores no permiten el acceso general a rutas locales; solo se procesan archivos seleccionados explícitamente.';
  setView('inicio');
})();