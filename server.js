cat > server.js <<'EOF'
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const TELEGRAM_BOT_TOKEN = process.env.8310889783:AAEcNaZdEAeKjEJ9Z54dv6nSt-mkLsJEPxg;
const TELEGRAM_CHAT_IDS = (process.env.TELEGRAM_CHAT_IDS || "").split(',').filter(Boolean);
const AMO_BASE_URL = process.env.AMO_BASE_URL || 'https://vantechnology.amocrm.ru';

app.post('/amocrm-hook', async (req, res) => {
  try {
    const data = req.body;
    const deal = data.leads?.[0] || data.added?.[0] || data.updated?.[0] || data.lead;
    if (!deal) {
      console.log('Нет данных о сделке:', JSON.stringify(data).slice(0,200));
      return res.status(400).send('No deal data');
    }
    const dealId = deal.id;
    const dealName = deal.name || 'Без названия';
    const link = `${AMO_BASE_URL}/leads/detail/${dealId}`;
    const message = `🔥 Сделка: <b>${dealName}</b>\n👉 <a href="${link}">Открыть в amoCRM</a>`;

    // Отправляем всем chat_id
    await Promise.all(TELEGRAM_CHAT_IDS.map(id =>
      axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: id,
        text: message,
        parse_mode: 'HTML'
      })
    ));

    console.log('Sent notification for', dealId);
    res.send('ok');
  } catch (err) {
    console.error(err.response?.data || err.message || err);
    res.status(500).send('Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Started on ${PORT}`));
EOF
