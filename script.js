// Minimal, clean JS: navigation, keyboard, search/filter, zoom toggle
(() => {
  const lbYt = document.getElementById('lb-yt');

  const gallery = document.getElementById('gallery');
  const search = document.getElementById('search');
  const filter = document.getElementById('filter');
  const cards = Array.from(gallery.querySelectorAll('.card'));

  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbTitle = document.getElementById('lb-title');
  const lbDesc = document.getElementById('lb-desc');
  const closeBtn = document.querySelector('.close');
  const prevBtn = document.querySelector('.nav.prev');
  const nextBtn = document.querySelector('.nav.next');

  let index = -1;

  // Open lightbox for index
  function openLB(i){
    const card = cards[i];
    if(!card) return;

    const type = card.dataset.type || 'image';
    const img = card.querySelector('img');
    const full = img.dataset.full || img.src;

    lbTitle.textContent = card.querySelector('h3')?.textContent || '';
    lbDesc.textContent = card.dataset.desc || '';
    index = i;

    // Réinitialisation
    lbImg.style.display = 'none';
    lbImg.style.transform = 'scale(1)';
    lbYt.style.display = 'none';
    lbYt.src = '';

    if (type === 'youtube') {
      const videoId = full.match(/(?:youtu\.be\/|v=|shorts\/)([a-zA-Z0-9_-]+)/)?.[1];
      if (videoId) {
        lbYt.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
        lbYt.style.display = 'block';
      }
    } else {
      lbImg.src = full;
      lbImg.alt = img.alt || '';
      lbImg.style.display = 'block';
    }

    lightbox.classList.add('show');
    lightbox.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }

  function closeLB(){
    lightbox.classList.remove('show');
    lightbox.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';

    lbImg.src = '';
    lbImg.style.transform = 'scale(1)';

    // Stop video playback
    lbYt.src = '';
    lbYt.style.display = 'none';

    index = -1;
  }

  function showNext(){ openLB((index+1)%cards.length) }
  function showPrev(){ openLB((index-1+cards.length)%cards.length) }

  // Attach click handlers on cards
  cards.forEach((c, i) => {
    c.addEventListener('click', () => openLB(i));
    c.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLB(i); }
    });
  });

  // Lightbox controls
  closeBtn.addEventListener('click', closeLB);
  nextBtn.addEventListener('click', showNext);
  prevBtn.addEventListener('click', showPrev);

  // Keyboard controls
  window.addEventListener('keydown', (e) => {
    if(lightbox.classList.contains('show')){
      if(e.key === 'Escape') closeLB();
      if(e.key === 'ArrowRight') showNext();
      if(e.key === 'ArrowLeft') showPrev();
      if(e.key === '+') {
        if(lbImg.style.display === 'block'){
          lbImg.style.transform = (lbImg.style.transform === 'scale(1.25)') ? 'scale(1)' : 'scale(1.25)';
        }
      }
    }
  });

  // Clicking overlay closes (but not when click on image or controls)
  lightbox.addEventListener('click', (e) => {
    if(e.target === lightbox) closeLB();
  });

  // Search & filter
  function applyFilter(){
    const q = search.value.trim().toLowerCase();
    const f = filter.value;
    cards.forEach(c => {
      const tags = (c.dataset.tags || '').toLowerCase();
      const desc = (c.dataset.desc || '').toLowerCase();
      const title = (c.querySelector('h3')?.textContent || '').toLowerCase();

      const matchesQuery = q === '' || tags.includes(q) || desc.includes(q) || title.includes(q);
      const matchesFilter = f === 'all' || tags.split(' ').includes(f);
      c.style.display = (matchesQuery && matchesFilter) ? '' : 'none';
    });
  }
  search.addEventListener('input', applyFilter);
  filter.addEventListener('change', applyFilter);

  // Accessibility: basic focus trap in lightbox
  document.addEventListener('focus', (e) => {
    if(lightbox.classList.contains('show') && !lightbox.contains(e.target)){
      e.stopPropagation();
      closeBtn.focus();
    }
  }, true);

})();
