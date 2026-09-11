const SearchFeature = {
  run(term) {
    const results = [];
    MockData.articles.forEach(function(a) {
      if (a.title.toLowerCase().includes(term) || a.category.toLowerCase().includes(term)) {
        results.push({ title: a.title, type: "Artikel · " + a.category, icon: "fa-book-open", href: "library.html?article=" + a.id });
      }
    });
    const activityTerms = ["berjalan", "lari", "bersepeda", "stretching", "aktivitas"];
    activityTerms.forEach(function(t) {
      if (t.includes(term)) {
        results.push({ title: t.charAt(0).toUpperCase() + t.slice(1), type: "Aktivitas", icon: "fa-person-walking", href: "health.html" });
      }
    });
    return results;
  },
};

window.SearchFeature = SearchFeature;
