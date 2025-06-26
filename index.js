import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys"
import P from "pino"

// Konfigurasi logger
const logger = P({ timestamp: () => `,"time":"${new Date().toJSON()}"` }, P.destination("./wa-logs.txt"))
logger.level = "trace"

// Fungsi utama untuk menjalankan bot
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys")
  const { version, isLatest } = await fetchLatestBaileysVersion()

  console.log(`Menggunakan WA v${version.join(".")}, isLatest: ${isLatest}`)

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false, // Kita akan menggunakan pairing code
    auth: state,
    browser: ["WhatsApp Bot", "Chrome", "1.0.0"],
  })

  // Event ketika koneksi berubah
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      console.log("Koneksi terputus karena ", lastDisconnect?.error, ", mencoba reconnect ", shouldReconnect)

      if (shouldReconnect) {
        startBot()
      }
    } else if (connection === "open") {
      console.log("✅ Bot WhatsApp berhasil terhubung!")
      console.log("📱 Nomor bot:", sock.user?.id)
    }

    // Jika belum login, tampilkan pairing code
    if (!sock.authState.creds.registered) {
      console.log("🔐 Masukkan nomor WhatsApp Anda (dengan kode negara, contoh: 628123456789):")

      // Simulasi input nomor (dalam implementasi nyata, gunakan readline atau prompt)
      const phoneNumber = await getPhoneNumber()

      if (phoneNumber) {
        const code = await sock.requestPairingCode(phoneNumber)
        console.log(`🔑 Pairing Code: ${code}`)
        console.log("Masukkan kode ini di WhatsApp Anda: Linked Devices > Link a Device > Link with Phone Number")
      }
    }
  })

  // Event ketika kredensial diperbarui
  sock.ev.on("creds.update", saveCreds)

  // Event ketika menerima pesan
  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0]
    if (!msg.key.fromMe && m.type === "notify") {
      await handleMessage(sock, msg)
    }
  })

  return sock
}

// Fungsi untuk mendapatkan nomor telepon (implementasi sederhana)
async function getPhoneNumber() {
  // Dalam implementasi nyata, gunakan readline atau library input lainnya
  // Untuk demo, return nomor contoh
  return "6289518141833" // Ganti dengan nomor Anda
}

// Fungsi untuk menangani pesan masuk
async function handleMessage(sock, msg) {
  const messageText = msg.message?.conversation || msg.message?.extendedTextMessage?.text || ""

  const senderNumber = msg.key.remoteJid
  const senderName = msg.pushName || "Unknown"

  console.log(`📨 Pesan dari ${senderName} (${senderNumber}): ${messageText}`)

  // Respons otomatis berdasarkan pesan
  await processCommand(sock, msg, messageText.toLowerCase().trim())
}

// Fungsi untuk memproses command
async function processCommand(sock, msg, command) {
  const chatId = msg.key.remoteJid

  try {
    switch (command) {
      case "/start":
      case "hi":
      case "hello":
        await sock.sendMessage(chatId, {
          text:
            `👋 Halo! Saya adalah bot WhatsApp sederhana.\n\n` +
            `📋 Command yang tersedia:\n` +
            `• /help - Bantuan\n` +
            `• /info - Informasi bot\n` +
            `• /ping - Test koneksi\n` +
            `• /time - Waktu saat ini`,
        })
        break

      case "/help":
        await sock.sendMessage(chatId, {
          text:
            `🤖 *WhatsApp Bot Help*\n\n` +
            `Ini adalah bot WhatsApp sederhana yang dapat:\n` +
            `✅ Merespons pesan otomatis\n` +
            `✅ Menjalankan command dasar\n` +
            `✅ Memberikan informasi\n\n` +
            `Ketik command untuk berinteraksi dengan bot!`,
        })
        break

      case "/info":
        await sock.sendMessage(chatId, {
          text:
            `ℹ️ *Informasi Bot*\n\n` +
            `📱 Platform: WhatsApp\n` +
            `🔧 Library: Baileys\n` +
            `⚡ Status: Online\n` +
            `📅 Dibuat: ${new Date().toLocaleDateString("id-ID")}`,
        })
        break

      case "/ping":
        const startTime = Date.now()
        await sock.sendMessage(chatId, { text: "🏓 Pong!" })
        const endTime = Date.now()
        await sock.sendMessage(chatId, {
          text: `⚡ Response time: ${endTime - startTime}ms`,
        })
        break

      case "/time":
        const currentTime = new Date().toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
        await sock.sendMessage(chatId, {
          text: `🕐 *Waktu Saat Ini*\n${currentTime} WIB`,
        })
        break

      default:
        // Jika bukan command, berikan respons umum
        if (command.startsWith("/")) {
          await sock.sendMessage(chatId, {
            text: `❌ Command tidak dikenali. Ketik /help untuk melihat daftar command.`,
          })
        } else {
          await sock.sendMessage(chatId, {
            text: `🤖 Terima kasih atas pesannya! Ketik /help untuk melihat command yang tersedia.`,
          })
        }
    }
  } catch (error) {
    console.error("Error processing command:", error)
    await sock.sendMessage(chatId, {
      text: "❌ Terjadi kesalahan saat memproses pesan Anda.",
    })
  }
}

// Jalankan bot
console.log("🚀 Memulai WhatsApp Bot...")
startBot().catch((err) => console.log("Error:", err))
