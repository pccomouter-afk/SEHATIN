(function() {
  if (!Auth.guard()) return;
  Sidebar.init();
  NavbarTop.init('Bantuan');
  ProfileDrawer.init();
  BottomNav.init();
  Router.init();
  
  var faqData = [
    { q: 'Apa itu SEHATIN?', a: 'SEHATIN adalah teman digital kesehatan yang membantu kamu memahami kondisi harian, membangun kebiasaan sehat, mencatat kondisi, dan menemukan fasilitas kesehatan terdekat.' },
    { q: 'Apakah SEHATIN mendiagnosis penyakit?', a: 'Tidak. SEHATIN bukan alat diagnosis. Hasil pemeriksaan di SEHATIN hanya berupa gambaran awal dan rekomendasi langkah, bukan diagnosis medis.' },
    { q: 'Bagaimana data saya disimpan?', a: 'Seluruh data pada versi ini disimpan secara lokal di perangkatmu menggunakan localStorage, tanpa dikirim ke server manapun.' },
    { q: 'Bagaimana cara menghapus data?', a: 'Buka Pengaturan > Privasi & Data, lalu tekan tombol Hapus Semua Data Lokal. Seluruh riwayat akan dihapus secara permanen.' },
    { q: 'Bagaimana cara mencari fasilitas?', a: 'Ketik kota, kecamatan, atau alamat di kolom pencarian fasilitas. SEHATIN akan mencari fasilitas kesehatan terdekat menggunakan data lokasi.' },
    { q: 'Apakah ada biaya untuk menggunakan SEHATIN?', a: 'Tidak. SEHATIN sepenuhnya gratis. Tidak ada biaya berlangganan atau pembayaran apapun.' }
  ];
  
  var faqBox = document.getElementById('faq-list');
  faqBox.innerHTML = faqData.map(function(f, i) {
    return '<div class="faq-item" data-faq="' + i + '">' +
      '<div class="faq-question">' + f.q + '<i class="fa-solid fa-chevron-down"></i></div>' +
      '<p class="faq-answer">' + f.a + '</p>' +
      '</div>';
  }).join('');
  
  Utils.qsa('[data-faq]', faqBox).forEach(function(item) {
    item.querySelector('.faq-question').addEventListener('click', function() {
      var answer = item.querySelector('.faq-answer');
      var isOpen = item.classList.contains('is-open');
      Utils.qsa('.faq-item').forEach(function(i) { i.classList.remove('is-open'); });
      if (!isOpen) item.classList.add('is-open');
    });
  });
})();