function logger(source, message) {
  const now = new Date();

  // Tarih formatı: YYYY-MM-DD HH:mm:ss.SSS (Milisaniye dahil)
  const timestamp = now.toISOString().replace('T', ' ').replace('Z', '');

  // Log formatı: [Zaman] [KAYNAK] Mesaj
  const logEntry = `[${timestamp}] [${source.toUpperCase()}] ${message}`;

  // Konsola bas
  console.log(logEntry);

  // İsteğe bağlı: Burada logları bir diziye veya dosyaya da push edebilirsin
  // global.logs = global.logs || [];
  // global.logs.push(logEntry);
}

module.exports = { logger };