// Contoh fitur quotes motivasi
const quotes = [
  "Kesuksesan adalah hasil dari persiapan, kerja keras, dan belajar dari kegagalan. - Colin Powell",
  "Jangan takut gagal. Takutlah tidak mencoba. - Unknown",
  "Hidup adalah 10% apa yang terjadi padamu dan 90% bagaimana kamu meresponnya. - Charles R. Swindoll",
  "Masa depan milik mereka yang percaya pada keindahan mimpi mereka. - Eleanor Roosevelt",
  "Satu-satunya cara untuk melakukan pekerjaan hebat adalah dengan mencintai apa yang kamu lakukan. - Steve Jobs",
]

export function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length)
  return `💭 *Quote Hari Ini*\n\n"${quotes[randomIndex]}"`
}
