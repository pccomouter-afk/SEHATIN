const Router = {
  currentRoute: null,
  
  init() {
    var self = this;
    window.addEventListener('hashchange', function() { self.handleRoute(); });
    window.addEventListener('load', function() { self.handleRoute(); });
  },
  
  handleRoute() {
    var hash = window.location.hash || '#dashboard';
    var route = hash.replace('#', '');
    this.currentRoute = route;
    this.updateActiveNav(route);
  },
  
  navigate(route) {
    window.location.hash = route;
  },
  
  updateActiveNav(route) {
    Utils.qsa('.sidebar-nav-item').forEach(function(item) {
      item.classList.remove('is-active');
      var href = item.getAttribute('href');
      if (href && href.indexOf(route) !== -1) {
        item.classList.add('is-active');
      }
    });
    Utils.qsa('.bottom-nav-item').forEach(function(item) {
      item.classList.remove('is-active');
      var href = item.getAttribute('href');
      if (href && href.indexOf(route) !== -1) {
        item.classList.add('is-active');
      }
    });
  }
};

window.Router = Router;