// Contoh fitur kalkulator sederhana
export function calculate(expression) {
  try {
    // Validasi input untuk keamanan
    const validExpression = /^[0-9+\-*/().\s]+$/.test(expression)
    if (!validExpression) {
      return "❌ Ekspresi tidak valid. Gunakan hanya angka dan operator (+, -, *, /)"
    }

    const result = eval(expression)
    return `🧮 *Kalkulator*\n\n` + `📝 ${expression} = ${result}`
  } catch (error) {
    return "❌ Error dalam perhitungan. Periksa format ekspresi Anda."
  }
}
