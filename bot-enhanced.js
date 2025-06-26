import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys"
import P from "pino"
import { getWeather } from "./features/weather.js"
import { calculate } from "./features/calculator.js"
import { getRandomQuote } from "./features/quotes.js"

const logger = P({ timestamp: () => `,"time":"${new Date().toJSON()}"` }, P.destination("./wa-logs.txt"))
logger.level = "trace"

let sock = null

async function startEnhancedBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys")
  const { version, isLatest } = await fetchLatestBaileysVersion()

  console.log(`Menggunakan WA v${version.join(".")}, isLatest: ${isLatest}`)

  sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: state,
    browser: ["WhatsApp Bot Enhanced", "Chrome", "1.0.0"],
  })

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update

    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      console.log("Koneksi terputus karena ", lastDisconnect?.error, ", mencoba reconnect ", shouldReconnect)

      if (shouldReconnect) {
        startEnhancedBot()
      }
    } else if (connection === "open") {
      console.log("✅ Enhanced Bot WhatsApp berhasil terhubung!")
    }

    if (!sock.authState.creds.registered) {
      const phoneNumber = "628123456789" // Ganti dengan nomor Anda
      const code = await sock.requestPairingCode(phoneNumber)
      console.log(`🔑 Pairing Code: ${code}`)
    }
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0]
    if (!msg.key.fromMe && m.type === "notify") {
      await handleEnhancedMessage(sock, msg)
    }
  })

  return sock
}

async function handleEnhancedMessage(sock, msg) {
  const messageText = msg.message?.conversation || msg.message?.extendedTextMessage?.text || ""

  const chatId = msg.key.remoteJid
  const command = messageText.toLowerCase().trim()

  console.log(`📨 Pesan: ${messageText}`)

  try {
    // Command dengan parameter
    if (command.startsWith("/cuaca ")) {
      const city = command.replace("/cuaca ", "")
      const weatherInfo = await getWeather(city)
      await sock.sendMessage(chatId, { text: weatherInfo })
      return
    }

    if (command.startsWith("/hitung ")) {
      const expression = command.replace("/hitung ", "")
      const result = calculate(expression)
      await sock.sendMessage(chatId, { text: result })
      return
    }

    // Command sederhana
    switch (command) {
      case "/start":
        await sock.sendMessage(chatId, {
          text:
            `🤖 *WhatsApp Bot Enhanced*\n\n` +
            `Selamat datang! Bot ini memiliki berbagai fitur menarik.\n\n` +
            `📋 *Command Tersedia:*\n` +
            `• /help - Bantuan lengkap\n` +
            `• /cuaca [kota] - Info cuaca\n` +
            `• /hitung [ekspresi] - Kalkulator\n` +
            `• /quote - Quote motivasi\n` +
            `• /info - Informasi bot\n` +
            `• /ping - Test koneksi`,
        })
        break

      case "/quote":
        const quote = getRandomQuote()
        await sock.sendMessage(chatId, { text: quote })
        break

      case "/help":
        await sock.sendMessage(chatId, {
          text:
            `📚 *Panduan Penggunaan Bot*\n\n` +
            `🌤️ *Cuaca:* /cuaca Jakarta\n` +
            `🧮 *Kalkulator:* /hitung 2+2*3\n` +
            `💭 *Quote:* /quote\n` +
            `ℹ️ *Info:* /info\n` +
            `🏓 *Ping:* /ping\n\n` +
            `💡 *Tips:* Ketik command dengan benar untuk hasil terbaik!`,
        })
        break

      case "/info":
        await sock.sendMessage(chatId, {
          text:
            `🤖 *Bot Information*\n\n` +
            `📱 Platform: WhatsApp\n` +
            `🔧 Library: Baileys v6.6.0\n` +
            `⚡ Status: Online & Enhanced\n` +
            `🎯 Features: Weather, Calculator, Quotes\n` +
            `📅 Last Update: ${new Date().toLocaleDateString("id-ID")}`,
        })
        break

      case "/ping":
        const start = Date.now()
        await sock.sendMessage(chatId, { text: "🏓 Pong!" })
        const latency = Date.now() - start
        await sock.sendMessage(chatId, {
          text: `⚡ Latency: ${latency}ms\n🟢 Status: Online`,
        })
        break

      default:
        if (command.startsWith("/")) {
          await sock.sendMessage(chatId, {
            text: `❌ Command tidak dikenali.\n\nKetik /help untuk melihat daftar command yang tersedia.`,
          })
        } else {
          await sock.sendMessage(chatId, {
            text: `👋 Halo! Saya bot WhatsApp yang siap membantu.\n\nKetik /start untuk memulai atau /help untuk bantuan.`,
          })
        }
    }
  } catch (error) {
    console.error("Error:", error)
    await sock.sendMessage(chatId, {
      text: "❌ Terjadi kesalahan. Silakan coba lagi.",
    })
  }
}

console.log("🚀 Memulai Enhanced WhatsApp Bot...")
startEnhancedBot().catch((err) => console.log("Error:", err))
