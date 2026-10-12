/* Local-only demonstration: native controls, explicit commit, focus restoration. */
for (const root of document.querySelectorAll('[data-picker-demo]')) {
  const find = selector => root.querySelector(selector);
  const count = {Matthew:28, Mark:16, Luke:24, John:21};
  let current = {book:'Mark', chapter:3};
  let draft = {...current};
  let layout = 'grid';
  const status = find('[data-status]');
  const title = find('[data-title]');
  function books(focus = true) {
    find('[data-books]').hidden = false;
    find('[data-chapters]').hidden = true;
    title.textContent = 'Choose a book';
    for (const button of root.querySelectorAll('[data-book]')) {
      button.setAttribute('aria-pressed', String(button.dataset.book === draft.book));
    }
    find('[data-book-search]').value = '';
    filterBooks();
    if (focus) find('[data-book="'+draft.book+'"]').focus();
  }
  function filterBooks() {
    const query = find('[data-book-search]').value.trim().toLowerCase();
    let visible = 0;
    for (const button of root.querySelectorAll('[data-book]')) {
      button.hidden = !button.dataset.book.toLowerCase().includes(query);
      if (!button.hidden) visible++;
    }
    find('[data-empty]').hidden = visible > 0;
  }
  find('[data-book-search]').addEventListener('input', filterBooks);
  function chapters() {
    find('[data-books]').hidden = true;
    find('[data-chapters]').hidden = false;
    title.textContent = draft.book + ' · Choose a chapter';
    const list = find('[data-chapter-list]');
    list.classList.toggle('as-list', layout === 'list');
    list.replaceChildren();
    for (let chapter = 1; chapter <= count[draft.book]; chapter++) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = layout === 'list' ? 'Chapter ' + chapter : String(chapter);
      button.dataset.chapter = String(chapter);
      button.setAttribute('aria-label', draft.book + ' chapter ' + chapter);
      button.setAttribute('aria-pressed', String(chapter === draft.chapter));
      list.append(button);
    }
    selection();
    title.focus();
  }
  function selection() {
    find('[data-selection]').textContent = 'Selected: ' + draft.book + ' ' + draft.chapter;
    find('[data-open]').textContent = 'Open ' + draft.book + ' ' + draft.chapter;
    for (const button of root.querySelectorAll('[data-chapter]')) {
      button.setAttribute('aria-pressed', String(Number(button.dataset.chapter) === draft.chapter));
    }
  }
  function close(message) {
    find('[data-picker]').hidden = true;
    find('[data-reader]').hidden = false;
    find('[data-current]').textContent = current.book + ' ' + current.chapter;
    find('[data-start]').focus();
    status.textContent = message;
  }
  root.addEventListener('click', event => {
    const target = event.target.closest('button');
    if (!target) return;
    if (target.matches('[data-start]')) {
      draft = {...current};
      status.textContent = '';
      find('[data-reader]').hidden = true;
      find('[data-picker]').hidden = false;
      books(false);
      title.focus();
    } else if (target.matches('[data-layout]')) {
      layout = target.dataset.layout;
      for (const button of root.querySelectorAll('[data-layout]')) button.setAttribute('aria-pressed', String(button.dataset.layout === layout));
      chapters();
      target.focus();
    } else if (target.matches('[data-book]')) {
      const book = target.dataset.book;
      draft = {book, chapter:book === draft.book ? draft.chapter : 1};
      chapters();
    } else if (target.matches('[data-chapter]')) {
      draft.chapter = Number(target.dataset.chapter);
      selection();
    } else if (target.matches('[data-back]')) books();
    else if (target.matches('[data-cancel]')) close('Cancelled. Your reading location has not changed.');
    else if (target.matches('[data-open]')) {
      current = {...draft};
      close('Opened ' + current.book + ' ' + current.chapter + ' in this example.');
    }
  });
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !find('[data-picker]').hidden) {
      event.preventDefault();
      close('Cancelled. Your reading location has not changed.');
    }
  });
}
