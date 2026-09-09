const WellnessEngine = {
  questions: MockData.wellnessQuestions,
  computeGuidance(answers) {
    const heavyOptions = ["Sangat buruk", "Hampir setiap hari", "Sangat rendah", "Sangat sulit", "Tidak pernah cukup"];
    let heavyCount = 0;
    Object.keys(answers).forEach((key) => {
      if (heavyOptions.includes(answers[key])) heavyCount += 1;
    });
    let level = "ringan";
    if (heavyCount >= 3) level = "berat";
    else if (heavyCount >= 1) level = "sedang";

    const guidance = {
      ringan: {
        title: "Kondisi emosimu terpantau cukup stabil",
        points: ["Pertahankan rutinitas istirahat yang sudah baik.", "Tetap luangkan waktu untuk hal yang kamu nikmati."],
      },
      sedang: {
        title: "Ada beberapa hal yang perlu diperhatikan",
        points: ["Coba kurangi beban aktivitas yang menumpuk.", "Luangkan waktu istirahat singkat di sela aktivitas.", "Catat perasaanmu di Jurnal untuk membantu memantau pola."],
      },
      berat: {
        title: "Kondisi emosimu memerlukan perhatian lebih",
        points: ["Beri dirimu waktu untuk beristirahat dengan cukup.", "Pertimbangkan untuk berbicara dengan orang yang kamu percaya atau tenaga profesional.", "Coba latihan pernapasan di Ruang Tenang untuk membantu meredakan tekanan."],
      },
    };
    return Object.assign({ level }, guidance[level]);
  },
};

window.WellnessEngine = WellnessEngine;
