(function () {
  if (!Auth.guard()) return;
  Sidebar.init();
  NavbarTop.init('Pustaka Kesehatan');
  ProfileDrawer.init();
  BottomNav.init();
  Router.init();

  const params = new URLSearchParams(window.location.search);
  const articleId = params.get("article");

  function articleCard(a) {
    return (
      '<a class="article-card" href="library.html?article=' +
      a.id +
      '"><div class="article-card-top"><div class="article-card-icon"><i class="fa-solid fa-book-open"></i></div><span class="badge badge-blue">' +
      a.category +
      "</span></div><strong>" +
      a.title +
      '</strong><p class="text-small text-secondary">' +
      a.summary +
      '</p><span class="text-xsmall text-muted"><i class="fa-regular fa-clock"></i> ' +
      a.readTime +
      " menit baca</span></a>"
    );
  }

  if (articleId) {
    const article = LibraryFeature.getById(articleId);
    document.getElementById("library-list-view").style.display = "none";
    document.getElementById("library-detail-view").style.display = "block";
    if (!article) {
      document.getElementById("library-detail-view").innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fa-solid fa-triangle-exclamation"></i></div><p>Artikel tidak ditemukan.</p></div>';
      return;
    }
    document.getElementById("ad-category").textContent = article.category;
    document.getElementById("ad-title").textContent = article.title;
    document.getElementById("ad-meta").textContent = article.readTime + " menit baca";
    document.getElementById("ad-content").innerHTML = "<p>" + article.content + "</p>";
    document.getElementById("ad-related").innerHTML = LibraryFeature.related(article).map(articleCard).join("");

    const saved = HealthState.getSavedArticles();
    const saveBtn = document.getElementById("ad-save-btn");
    function refreshSaveBtn() {
      const isSaved = HealthState.getSavedArticles().includes(article.id);
      saveBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i> ' + (isSaved ? "Tersimpan" : "Simpan Artikel");
    }
    refreshSaveBtn();
    saveBtn.addEventListener("click", function () {
      HealthState.toggleSavedArticle(article.id);
      refreshSaveBtn();
      Toast.success("Artikel berhasil disimpan.");
    });
    return;
  }

  let activeCategory = "Semua";
  let searchTerm = "";

  function renderGrid() {
    let list = LibraryFeature.getAll();
    list = LibraryFeature.filterByCategory(list, activeCategory);
    list = LibraryFeature.search(list, searchTerm);
    const grid = document.getElementById("library-grid");
    if (list.length === 0) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><div class="empty-state-icon"><i class="fa-solid fa-magnifying-glass"></i></div><p>Artikel tidak ditemukan.</p></div>';
      return;
    }
    grid.innerHTML = list.map(articleCard).join("");
  }
  renderGrid();

  Utils.qsa("[data-category]").forEach((btn) => {
    btn.addEventListener("click", function () {
      activeCategory = this.getAttribute("data-category");
      Utils.qsa("[data-category]").forEach((b) => b.classList.remove("is-selected"));
      this.classList.add("is-selected");
      renderGrid();
    });
  });

function renderComments() {
    var list = CommentsFeature.getComments(articleId);
    var box = document.getElementById("comments-list");
    if (!box) return;
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

  if (articleId) {
    renderComments();
    var commentInput = document.getElementById("comment-input");
    var commentSubmit = document.getElementById("comment-submit-btn");
    if (commentSubmit) {
      commentSubmit.addEventListener("click", function() {
        var content = commentInput.value.trim();
        if (!content) { Toast.error("Tuliskan komentarmu terlebih dahulu."); return; }
        CommentsFeature.addComment(articleId, content);
        commentInput.value = "";
        renderComments();
        Toast.success("Komentar berhasil dikirim.");
      });
    }
    return;
  }

  renderGrid();
})();
