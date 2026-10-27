(() => {
  const input = document.querySelector('#file-input');
  const zone = document.querySelector('#drop-zone');
  const list = document.querySelector('#file-list');
  const empty = document.querySelector('#empty-state');
  const count = document.querySelector('#file-count');
  const status = document.querySelector('#status-line span:last-child');
  const toast = document.querySelector('#toast');
  const files = [];
  let toastTimer;
  const fmtSize = n => n < 1024 ? `${n} B` : n < 1048576 ? `${(n/1024).toFixed(1)} KB` : n < 1073741824 ? `${(n/1048576).toFixed(1)} MB` : `${(n/1073741824).toFixed(2)} GB`;
  const say = msg => { status.textContent = msg; toast.textContent = msg; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2800); };
  const safe = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function render() {
    list.innerHTML = '';
    empty.hidden = files.length > 0;
    list.hidden = files.length === 0;
    count.textContent = files.length ? `${files.length} archivo(s) seleccionados · procesamiento en este navegador` : 'Todavía no has añadido archivos.';
    files.forEach((f, i) => {
      const row = document.createElement('div'); row.className = 'file-row';
      row.innerHTML = `<div class="file-name"><span class="file-symbol">▤</span><div><strong>${safe(f.name)}</strong><small>${safe(f.type || 'Tipo no identificado')}</small></div></div><div class="file-meta">${fmtSize(f.size)}</div><div class="file-meta">${safe(f.lastModified ? new Date(f.lastModified).toLocaleDateString() : '')}</div><button class="row-action" data-action="convert" data-index="${i}">A PNG</button>`;
      list.appendChild(row);
    });
  }
  function add(incoming) {
    let added = 0;
    for (const f of incoming) {
      if (!files.some(x => x.name === f.name && x.size === f.size && x.lastModified === f.lastModified)) { files.push(f); added++; }
    }
    render(); say(added ? `Se añadieron ${added} archivo(s).` : 'Los archivos ya estaban en la lista.');
  }
  document.querySelector('#select-files').addEventListener('click', e => { e.stopPropagation(); input.click(); });
  zone.addEventListener('click', e => { if (!e.target.closest('button')) input.click(); });
  zone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
  input.addEventListener('change', () => { add(input.files); input.value = ''; });
  ['dragenter','dragover'].forEach(type => zone.addEventListener(type, e => { e.preventDefault(); zone.classList.add('dragover'); }));
  ['dragleave','drop'].forEach(type => zone.addEventListener(type, e => { e.preventDefault(); zone.classList.remove('dragover'); }));
  zone.addEventListener('drop', e => add(e.dataTransfer.files));
  document.querySelector('#clear-files').addEventListener('click', () => { files.splice(0); render(); say('Lista limpiada.'); });
  document.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-view]').forEach(x => x.classList.remove('active'));
    if (btn.classList.contains('nav-item')) btn.classList.add('active');
    const view = btn.dataset.view;
    const names = {inicio:['Herramientas para tus archivos.','Convierte y revisa archivos desde una interfaz simple, rápida y privada.'],convertir:['Convertir imágenes.','Selecciona una imagen compatible y expórtala como PNG.'],archivos:['Información de archivos.','Revisa nombre, tipo y tamaño de los archivos que seleccionaste.'],hash:['Verificación SHA-256.','Calcula una huella criptográfica de un archivo en tu navegador.']};
    document.querySelector('#page-title').textContent = names[view][0];
    document.querySelector('#page-subtitle').textContent = names[view][1];
    if(view==='convertir') say('Usa el botón «A PNG» en una imagen compatible.');
    if(view==='hash') say('Usa el botón «Calcular SHA-256» en la lista de archivos.');
  }));
  document.querySelector('#export-list').addEventListener('click', () => {
    if (!files.length) return say('Añade archivos antes de exportar el listado.');
    const csv = ['nombre,tipo,tamaño_bytes,fecha_modificacion', ...files.map(f => [f.name,f.type,f.size,new Date(f.lastModified).toISOString()].map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\r\n');
    download(new Blob(['\ufeff',csv],{type:'text/csv;charset=utf-8'}),'squirrel-doc-archivos.csv'); say('Listado CSV descargado.');
  });
  list.addEventListener('click', async e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const f = files[Number(btn.dataset.index)];
    try {
      if (btn.dataset.action === 'convert') {
        if (!/^image\/(png|jpeg|webp|bmp|gif|avif)$/i.test(f.type) && !/\.(png|jpe?g|webp|bmp|gif|avif)$/i.test(f.name)) return say('Este archivo no parece ser una imagen compatible.');
        const bitmap = await createImageBitmap(f);
        const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height;
        canvas.getContext('2d').drawImage(bitmap,0,0); bitmap.close();
        canvas.toBlob(blob => { if (blob) { download(blob, f.name.replace(/\.[^.]+$/,'')+'.png'); say('Imagen convertida a PNG y descargada.'); } else say('El navegador no pudo convertir esta imagen.'); },'image/png');
      } else if (btn.dataset.action === 'hash') {
        const digest = await crypto.subtle.digest('SHA-256', await f.arrayBuffer());
        const hex = [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
        await navigator.clipboard?.writeText(hex).catch(()=>{});
        say(`${f.name} · SHA-256: ${hex}`);
      }
    } catch (err) { say(`No se pudo procesar el archivo: ${err.message}`); }
  });
  function download(blob, name) { const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000); }
  // Add a hash action on demand, without exposing file paths beyond the browser.
  const hashCard = document.querySelector('[data-view="hash"]');
  hashCard?.addEventListener('click', () => {
    list.querySelectorAll('.file-row').forEach((row,i) => {
      let btn=row.querySelector('[data-action="hash"]');
      if(!btn){btn=document.createElement('button');btn.className='row-action';btn.dataset.action='hash';btn.dataset.index=i;btn.textContent='SHA-256';row.appendChild(btn);}
    });
  });
  document.querySelector('#file-count').title = 'Los navegadores no permiten acceder a rutas completas de archivos locales por diseño.';
})();
