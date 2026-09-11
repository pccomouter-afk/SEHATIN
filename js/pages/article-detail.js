(function() {
  if (!Auth.guard()) return;
  Sidebar.init();
  NavbarTop.init('Artikel');
  ProfileDrawer.init();
  BottomNav.init();
  Router.init();
  
  var params = new URLSearchParams(window.location.search);
  var articleId = params.get('article');
  var article = LibraryFeature.getById(articleId);
  var container = document.getElementById('article-content');
  
  if (!article) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fa-solid fa-triangle-exclamation"></i></div><p>Artikel tidak ditemukan.</p><a href="library.html" class="btn btn-secondary btn-sm">Kembali ke Pustaka</a></div>';
    return;
  }
  
  var saved = HealthState.getSavedArticles().includes(article.id);
  
  container.innerHTML =
    '<div class="article-card">' +
    '<div class="article-card-top"><span class="badge badge-blue">' + article.category + '</span><span class="text-xsmall text-muted"><i class="fa-regular fa-clock"></i> ' + article.readTime + ' menit baca</span></div>' +
    '<h1 class="mt-4">' + article.title + '</h1>' +
    '<p class="text-small text-muted mt-2">Dipublikasikan ' + Utils.formatDate(Date.now()) + '</p>' +
    '<div class="mt-4">' + article.content + '</div>' +
    '</div>' +
    '<div class="mt-6">' +
    '<button class="btn btn-secondary" id="ad-save-btn"><i class="fa-solid fa-bookmark"></i> ' + (saved ? 'Tersimpan' : 'Simpan Artikel') + '</button>' +
    '</div>' +
    '<div class="mt-8">' +
    '<h3>Artikel Terkait</h3>' +
    '<div class="library-grid mt-4" id="ad-related"></div>' +
    '</div>' +
    '<div class="mt-8" id="comments-section">' +
    '<h3>Diskusi</h3>' +
    '<div id="comments-list"></div>' +
    '<div class="mt-4">' +
    '<textarea class="form-control" id="comment-input" placeholder="Tulis komentarmu..." rows="3"></textarea>' +
    '<button class="btn btn-primary mt-2" id="comment-submit-btn">Kirim Komentar</button>' +
    '</div></div>';
  
  renderComments();
  
  var saveBtn = document.getElementById('ad-save-btn');
  saveBtn.addEventListener('click', function() {
    HealthState.toggleSavedArticle(article.id);
    var isSaved = HealthState.getSavedArticles().includes(article.id);
    saveBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i> ' + (isSaved ? 'Tersimpan' : 'Simpan Artikel');
    Toast.success('Artikel berhasil ' + (isSaved ? 'disimpan' : 'dihapus dari simpanan') + '.');
  });
  
  document.getElementById('comment-submit-btn').addEventListener('click', function() {
    var input = document.getElementById('comment-input');
    var content = input.value.trim();
    if (!content) { Toast.error('Tuliskan komentarmu terlebih dahulu.'); return; }
    CommentsFeature.addComment(articleId, content);
    input.value = '';
    renderComments();
    Toast.success('Komentar berhasil dikirim.');
  });
  
  document.getElementById('ad-related').innerHTML = LibraryFeature.related(article).map(function(a) {
    return '<a class="article-card" href="article-detail.html?article=' + a.id + '"><div class="article-card-top"><span class="badge badge-blue">' + a.category + '</span></div><strong>' + a.title + '</strong><p class="text-small text-secondary">' + a.summary + '</p></a>';
  }).join('');
  
  function renderComments() {
    var list = CommentsFeature.getComments(articleId);
    var box = document.getElementById('comments-list');
    if (list.length === 0) {
      box.innerHTML = '<div class="empty-state"><p class="text-small text-muted">Belum ada diskusi.</p></div>';
      return;
    }
    box.innerHTML = list.map(function(c) {
      return '<div class="comment-item" style="display:flex;gap:var(--space-3);padding:var(--space-4) 0;border-bottom:1px solid var(--border);">' +
        '<div class="sidebar-avatar" style="width:36px;height:36px;font-size:13px;flex-shrink:0;background:var(--primary-soft);color:var(--primary-dark);display:flex;align-items:center;justify-content:center;border-radius:50%;">' +
        (c.userAvatar ? '<img src="' + c.userAvatar + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />' : Utils.initials(c.userName)) +
        '</div>' +
        '<div style="flex:1;min-width:0;"><div style="display:flex;align-items:center;gap:var(--space-2);">' +
        '<strong style="font-size:var(--fs-small);">' + Utils.escapeHtml(c.userName) + '</strong>' +
        '<span class="text-xsmall text-muted">' + Utils.timeAgo(c.createdAt) + '</span></div>' +
        '<p style="font-size:var(--fs-body);margin-top:var(--space-1);">' + CommentsFeature.formatContent(c.content) + '</p></div></div>';
    }).join('');
  }
})();