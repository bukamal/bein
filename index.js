// api/index.js
const express = require('express');
const cors = require('cors');
const { Firestore } = require('@google-cloud/firestore');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-telegram-init-data']
}));
app.use(express.json());

// Initialize Firestore
const db = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  // يمكنك إضافة مصادقة عبر متغير بيئة يحتوي على JSON key
  // أو استخدام Application Default Credentials إذا كان متاحاً في بيئة Vercel
});
const usersCollection = db.collection('users');
const votesCollection = db.collection('votes');
const guildsCollection = db.collection('guilds');
const purchasesCollection = db.collection('purchases');
const notificationsCollection = db.collection('notifications');
const metadataCollection = db.collection('metadata');

// -------------------- الدوال المساعدة --------------------
async function verifyTelegram(data, token) {
  if (!data) return false;
  try {
    const params = new URLSearchParams(data);
    const hash = params.get("hash");
    params.delete("hash");

    const checkString = Array.from(params.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    const encoder = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode("WebAppData"),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const secret = await crypto.subtle.sign("HMAC", secretKey, encoder.encode(token));
    const finalKey = await crypto.subtle.importKey(
      "raw",
      secret,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", finalKey, encoder.encode(checkString));
    const hex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return hex === hash;
  } catch (e) {
    console.error("Verify error:", e);
    return false;
  }
}

async function rebuildLeaderboard() {
  const allUsersDoc = await metadataCollection.doc('all_users').get();
  const allUsers = allUsersDoc.exists ? allUsersDoc.data().ids : [];
  const users = await Promise.all(allUsers.map(id => usersCollection.doc(id).get().then(doc => doc.exists ? doc.data() : null)));
  let top = users.filter(u => u).map(u => ({
    username: u.username || "Dragon",
    score: (u.gameBalance || 0) + (u.tokenBalance || 0) + (u.pendingRewards || 0)
  }));
  top.sort((a, b) => b.score - a.score);
  const top10 = top.slice(0, 10);
  await metadataCollection.doc('top_leaderboard').set({ data: top10 });
}

async function checkLevelUp(u) {
  if (!u.dragon) return u;
  let xpNeeded = u.dragon.level * 100;
  while (u.dragon.xp >= xpNeeded) {
    u.dragon.level++;
    u.dragon.xp -= xpNeeded;
    if (u.dragon.level % 5 === 0) {
      u.dragon.maxEnergy = (u.dragon.maxEnergy || 10) + 1;
    }
    xpNeeded = u.dragon.level * 100;
  }
  return u;
}

async function sendTelegramMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}

async function addNotification(userId, notification) {
  const notifRef = notificationsCollection.doc(userId);
  const notifDoc = await notifRef.get();
  let notifs = notifDoc.exists ? notifDoc.data().list : [];
  notifs.push({ ...notification, timestamp: Date.now() });
  if (notifs.length > 20) notifs = notifs.slice(-20);
  await notifRef.set({ list: notifs });
}

function isAdmin(userId) {
  const adminIds = (process.env.ADMIN_IDS || "").split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
  return adminIds.includes(parseInt(userId));
}

// -------------------- نقاط النهاية --------------------
app.get('/', (req, res) => {
  res.json({ message: "Dragon API v18.0 - Vercel" });
});

app.get('/price', async (req, res) => {
  try {
    const pairAddress = "0x84606890ad8d13e5a092c25abe59e2ec8ade7805";
    const r = await fetch(`https://api.dexscreener.com/latest/dex/pair/bsc/${pairAddress}`);
    const data = await r.json();
    if (data.pair) {
      res.json({ success: true, price: data.pair.priceUsd });
    } else {
      res.json({ success: false, price: "0" });
    }
  } catch (e) {
    res.json({ success: false, price: "0" });
  }
});

app.get('/get-matches', async (req, res) => {
  const cacheKey = "matches_cache";
  const cacheDoc = await metadataCollection.doc(cacheKey).get();
  if (cacheDoc.exists && (Date.now() - cacheDoc.data().time < 300000)) {
    return res.json({ success: true, matches: cacheDoc.data().data });
  }
  try {
    const r = await fetch("https://api.football-data.org/v4/matches", {
      headers: { "X-Auth-Token": process.env.FOOTBALL_API_KEY }
    });
    const data = await r.json();
    const matches = (data.matches || []).slice(0, 20).map(m => ({
      id: m.id.toString(),
      teamA: m.homeTeam.shortName || m.homeTeam.name,
      teamB: m.awayTeam.shortName || m.awayTeam.name,
      logoA: m.homeTeam.crest,
      logoB: m.awayTeam.crest,
      league: m.competition.name,
      time: new Date(m.utcDate).getTime(),
      isOpen: (Date.now() >= new Date(m.utcDate).getTime() - 3600000 && Date.now() < new Date(m.utcDate).getTime())
    }));
    await metadataCollection.doc(cacheKey).set({ time: Date.now(), data: matches });
    res.json({ success: true, matches });
  } catch (e) {
    res.json({ success: false, message: "API Error" });
  }
});

app.get('/leaderboard', async (req, res) => {
  const topDoc = await metadataCollection.doc('top_leaderboard').get();
  const players = topDoc.exists ? topDoc.data().data : [];
  res.json(players);
});

// -------------------- التحقق للمسارات الأخرى --------------------
app.use(async (req, res, next) => {
  if (req.path === '/price' || req.path === '/get-matches' || req.path === '/leaderboard' || req.path === '/') {
    return next();
  }

  const initData = req.headers['x-telegram-init-data'] || req.query.initData;
  const isValid = await verifyTelegram(initData, process.env.TELEGRAM_BOT_TOKEN);
  if (!isValid || !initData) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const user = JSON.parse(new URLSearchParams(initData).get("user"));
    req.tgUser = user;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: "Invalid user data" });
  }
});

// -------------------- هنا يمكنك إضافة جميع المسارات الأخرى (كما في الكود السابق) --------------------
// مثال: /sync, /notifications, /check-balance, /vote, إلخ.
// سنختصر هنا ولكن يجب نسخها من الكود السابق

// ...

// أخيراً، تصدير الدالة الرئيسية
module.exports = app;