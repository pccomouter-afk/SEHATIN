(function () {
  AppShell.init("library", "Pustaka Kesehatan");

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

  document.getElementById("library-search-input").addEventListener(
    "input",
    Utils.debounce(function () {
      searchTerm = this.value.trim();
      renderGrid();
    }, 200)
  );
})();
