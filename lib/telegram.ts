/** All chats that should receive alerts (deduplicated). */
export function getTelegramAlertChatIds(): string[] {
  const ids = [
    process.env.TELEGRAM_CHAT_ID,
    process.env.TELEGRAM_ADMIN_CHAT_ID,
    process.env.TELEGRAM_KITCHEN_CHAT_ID,
  ].filter((id): id is string => Boolean(id?.trim()))

  return [...new Set(ids)]
}

async function sendTelegramToChat(
  botToken: string,
  chatId: string,
  message: string
) {
  const res = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    }
  )

  if (!res.ok) {
    const body = await res.text()
    console.error(`Telegram API error (chat ${chatId}):`, res.status, body)
  }
}

/** Send the same message to admin, kitchen, and/or default staff chats. */
export async function sendTelegram(message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatIds = getTelegramAlertChatIds()

  if (!botToken || chatIds.length === 0) {
    console.warn(
      'Telegram not configured (need TELEGRAM_BOT_TOKEN and at least one chat id)'
    )
    return
  }

  try {
    await Promise.all(
      chatIds.map((chatId) => sendTelegramToChat(botToken, chatId, message))
    )
  } catch (error) {
    console.error('Telegram send failed:', error)
  }
}
