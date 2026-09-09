const JournalFeature = {
  buildInsight() {
    const history = HealthState.getJournalHistory().slice(0, 7);
    if (history.length < 2) {
      return "Isi jurnal beberapa hari lagi agar SEHATIN dapat menunjukkan pola kesehatanmu.";
    }
    const sleepValues = history.map((h) => Number(h.tidur) || 0).filter((v) => v > 0);
    const avgSleep = sleepValues.length ? sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length : 0;
    const hours = Math.floor(avgSleep);
    const minutes = Math.round((avgSleep - hours) * 60);
    return "Dalam " + history.length + " catatan terakhir, waktu tidurmu rata-rata sekitar " + hours + " jam " + minutes + " menit.";
  },
};

window.JournalFeature = JournalFeature;
