# WhatsApp Bot dengan Baileys

Bot WhatsApp sederhana menggunakan library Baileys dengan autentikasi pairing code.

## 🚀 Setup dan Instalasi

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Konfigurasi
- Edit nomor telepon di file `index.js` atau `bot-enhanced.js`
- Ganti `628123456789` dengan nomor WhatsApp Anda (dengan kode negara)

### 3. Menjalankan Bot
\`\`\`bash
# Bot dasar
npm start

# Atau untuk development
npm run dev
\`\`\`

### 4. Pairing Code
1. Jalankan bot
2. Salin pairing code yang muncul di terminal
3. Buka WhatsApp > Linked Devices > Link a Device > Link with Phone Number
4. Masukkan pairing code

## 📋 Fitur Bot Dasar

- `/start` - Memulai bot
- `/help` - Bantuan
- `/info` - Informasi bot
- `/ping` - Test koneksi
- `/time` - Waktu saat ini

## 🔧 Menambahkan Fitur Baru

### Contoh 1: Menambah Command Sederhana
\`\`\`javascript
case '/mycommand':
    await sock.sendMessage(chatId, { 
        text: 'Respons untuk command baru!' 
    })
    break
\`\`\`

### Contoh 2: Command dengan Parameter
\`\`\`javascript
if (command.startsWith('/search ')) {
    const query = command.replace('/search ', '')
    // Proses query di sini
    await sock.sendMessage(chatId, { 
        text: `Hasil pencarian untuk: ${query}` 
    })
    return
}
\`\`\`

### Contoh 3: Menambah Fitur dari File Terpisah
1. Buat file di folder `features/`
2. Export fungsi yang dibutuhkan
3. Import di file utama
4. Gunakan dalam handler pesan

## 📁 Struktur Project

\`\`\`
whatsapp-bot/
├── index.js              # Bot dasar
├── bot-enhanced.js       # Bot dengan fitur tambahan
├── package.json          # Dependencies
├── features/             # Folder fitur tambahan
│   ├── weather.js        # Fitur cuaca
│   ├── calculator.js     # Fitur kalkulator
│   └── quotes.js         # Fitur quotes
├── auth_info_baileys/    # Folder autentikasi (auto-generated)
└── wa-logs.txt          # Log file (auto-generated)
\`\`\`

## 🛠️ Pengembangan Lanjutan

### Menambah Database
\`\`\`javascript
// Contoh menggunakan JSON sebagai database sederhana
import fs from 'fs'

const saveData = (data) => {
    fs.writeFileSync('database.json', JSON.stringify(data, null, 2))
}

const loadData = () => {
    try {
        return JSON.parse(fs.readFileSync('database.json', 'utf8'))
    } catch {
        return {}
    }
}
\`\`\`

### Menambah Middleware
\`\`\`javascript
// Contoh middleware untuk logging
const logMiddleware = (msg, next) => {
    console.log(`[${new Date().toISOString()}] Message from: ${msg.key.remoteJid}`)
    next()
}
\`\`\`

### Menambah Validasi Admin
\`\`\`javascript
const adminNumbers = ['628123456789@s.whatsapp.net']

const isAdmin = (jid) => {
    return adminNumbers.includes(jid)
}
\`\`\`

## 🔒 Keamanan

- Jangan share pairing code dengan orang lain
- Simpan file autentikasi dengan aman
- Validasi input pengguna untuk mencegah injection
- Gunakan environment variables untuk data sensitif

## 📝 Tips Pengembangan

1. **Modular Code**: Pisahkan fitur ke file terpisah
2. **Error Handling**: Selalu gunakan try-catch
3. **Logging**: Catat aktivitas penting
4. **Rate Limiting**: Batasi request per user
5. **Testing**: Test fitur sebelum deploy

## 🐛 Troubleshooting

### Bot tidak terhubung
- Pastikan nomor telepon benar
- Cek koneksi internet
- Restart bot dan generate pairing code baru

### Pesan tidak terkirim
- Cek format pesan
- Pastikan chatId valid
- Lihat log error di terminal

### Pairing code expired
- Generate pairing code baru
- Pastikan memasukkan code dalam waktu yang ditentukan
