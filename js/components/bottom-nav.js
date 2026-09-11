const BottomNav = {
  init() {
    this.render();
    this.bindEvents();
  },

  render() {
    if (document.getElementById('app-bottom-nav')) return;

    var items = [
      { key: 'dashboard', label: 'Beranda', icon: 'fa-house', href: 'dashboard.html' },
      { key: 'health-check', label: 'Periksa', icon: 'fa-clipboard-check', href: 'health-check.html' },
      { key: 'health', label: 'Kesehatan', icon: 'fa-heart-pulse', href: 'health.html' },
      { key: 'journal', label: 'Jurnal', icon: 'fa-book-medical', href: 'journal.html' },
      { key: 'facilities', label: 'Fasilitas', icon: 'fa-hospital', href: 'facilities.html' }
    ];

    var nav = document.createElement('nav');
    nav.className = 'bottom-nav hide-desktop';
    nav.id = 'app-bottom-nav';
    nav.innerHTML = items.map(function(item) {
      return '<a class="bottom-nav-item" href="' + item.href + '"><i class="fa-solid ' + item.icon + '"></i><span>' + item.label + '</span></a>';
    }).join('') +
    '<button class="bottom-nav-item" id="bottom-nav-profile"><i class="fa-solid fa-user"></i><span>Profil</span></button>';

    document.body.appendChild(nav);
  },

  bindEvents() {
    var self = this;
    document.getElementById('bottom-nav-profile').addEventListener('click', function() {
      ProfileDrawer.open();
    });
  }
};

window.BottomNav = BottomNav;
