const HealthCheckEngine = {
  questions: MockData.healthCheckQuestions,

  isAnswered(question, answers) {
    const val = answers[question.id];
    if (question.type === "multi") return Array.isArray(val) && val.length > 0;
    return val !== undefined && val !== null && val !== "";
  },

  computeResult(answers) {
    const keluhan = answers.q1 || [];
    const tingkatKeluhan = answers.q2;
    const mood = answers.q4;
    const stres = answers.q5;
    const tidurDurasi = answers.q7;
    const tidurKualitas = answers.q8;
    const aktivitas = answers.q9;

    let kondisiUmum = "Baik";
    if (!keluhan.includes("Tidak ada keluhan")) {
      kondisiUmum = tingkatKeluhan === "Berat" ? "Perlu diperhatikan" : "Cukup baik";
    }

    let tidurStatus = "Baik";
    if (["Kurang dari 5 jam", "5-6 jam"].includes(tidurDurasi) || ["Kurang", "Sangat buruk"].includes(tidurKualitas)) {
      tidurStatus = "Perlu diperhatikan";
    } else if (tidurKualitas === "Biasa") {
      tidurStatus = "Cukup baik";
    }

    let aktivitasStatus = "Baik";
    if (aktivitas === "Kurang aktif") aktivitasStatus = "Perlu diperhatikan";
    else if (aktivitas === "Cukup") aktivitasStatus = "Cukup baik";

    let stresStatus = "Baik";
    if (["Sering", "Hampir setiap hari"].includes(stres)) stresStatus = "Perlu diperhatikan";
    else if (stres === "Kadang-kadang") stresStatus = "Cukup baik";

    const attentionPoints = [];
    if (tidurStatus === "Perlu diperhatikan") attentionPoints.push("Kualitas atau durasi tidurmu belum optimal.");
    if (stresStatus === "Perlu diperhatikan") attentionPoints.push("Tingkat stres akhir-akhir ini cukup tinggi.");
    if (aktivitasStatus === "Perlu diperhatikan") attentionPoints.push("Aktivitas fisik harianmu masih rendah.");
    if (kondisiUmum === "Perlu diperhatikan") attentionPoints.push("Ada keluhan fisik yang cukup mengganggu aktivitasmu.");
    if (mood === "Kurang baik" || mood === "Sangat buruk") attentionPoints.push("Suasana hatimu belakangan kurang stabil.");
    if (attentionPoints.length === 0) attentionPoints.push("Secara umum kondisimu terpantau baik hari ini.");

    const recommendations = [];
    if (tidurStatus !== "Baik") recommendations.push("Coba tidur dan bangun di jam yang lebih teratur.");
    if (stresStatus !== "Baik") recommendations.push("Luangkan waktu untuk beristirahat sejenak dari kesibukan.");
    if (aktivitasStatus !== "Baik") recommendations.push("Lakukan aktivitas ringan seperti berjalan kaki 15-20 menit.");
    recommendations.push("Cukupi kebutuhan air minum sepanjang hari.");
    recommendations.push("Pantau terus kondisimu melalui Jurnal Kesehatan.");

    const seriousFlags = tingkatKeluhan === "Berat" || stres === "Hampir setiap hari" || mood === "Sangat buruk";

    return {
      kondisiUmum,
      tidurStatus,
      aktivitasStatus,
      stresStatus,
      attentionPoints,
      recommendations: recommendations.slice(0, 5),
      seriousFlags,
      answers,
      createdAt: Date.now(),
    };
  },
};

window.HealthCheckEngine = HealthCheckEngine;
