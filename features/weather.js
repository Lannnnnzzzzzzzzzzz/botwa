// Contoh fitur cuaca sederhana
export async function getWeather(city) {
  try {
    // Simulasi data cuaca (dalam implementasi nyata, gunakan API cuaca)
    const weatherData = {
      city: city,
      temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
      condition: ["Cerah", "Berawan", "Hujan", "Mendung"][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
    }

    return (
      `🌤️ *Cuaca ${weatherData.city}*\n\n` +
      `🌡️ Suhu: ${weatherData.temperature}°C\n` +
      `☁️ Kondisi: ${weatherData.condition}\n` +
      `💧 Kelembaban: ${weatherData.humidity}%`
    )
  } catch (error) {
    return "❌ Gagal mendapatkan data cuaca"
  }
}
