module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const d = req.body || {};
  if (d.website) return res.status(200).send('ok'); // honeypot: ловушка для ботов
  if (!d.name || !d.phone) return res.status(400).send('bad request');

  const esc = s => String(s ?? '').slice(0, 500)
    .replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

  const text =
`🌲 <b>Новая заявка с сайта</b>
👤 ${esc(d.name)}
📞 ${esc(d.phone)}
📅 ${esc(d.checkin)} → ${esc(d.checkout)}
👥 Гостей: ${esc(d.guests)}
🔖 ${esc(d.options) || 'без доп. опций'}
💰 Ориентир: ${esc(d.estimate)}
💬 ${esc(d.comment) || '—'}`;

  try {
    const r = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: process.env.CHAT_ID, text, parse_mode: 'HTML' })
    });
    return res.status(r.ok ? 200 : 502).send(r.ok ? 'ok' : 'error');
  } catch (e) {
    return res.status(502).send('error');
  }
};