const SearchFeature = {
  run(term) {
    const results = [];
    MockData.facilities.forEach((f) => {
      if (f.name.toLowerCase().includes(term) || f.type.toLowerCase().includes(term)) {
        results.push({ title: f.name, type: "Fasilitas · " + f.type, icon: "fa-hospital", href: "facility-detail.html?id=" + f.id });
      }
    });
    MockData.articles.forEach((a) => {
      if (a.title.toLowerCase().includes(term) || a.category.toLowerCase().includes(term)) {
        results.push({ title: a.title, type: "Artikel · " + a.category, icon: "fa-book-open", href: "library.html?article=" + a.id });
      }
    });
    const activityTerms = ["berjalan", "lari", "bersepeda", "stretching", "aktivitas"];
    activityTerms.forEach((t) => {
      if (t.includes(term)) {
        results.push({ title: t.charAt(0).toUpperCase() + t.slice(1), type: "Aktivitas", icon: "fa-person-walking", href: "health.html" });
      }
    });
    return results;
  },
};

window.SearchFeature = SearchFeature;
