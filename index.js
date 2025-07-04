const TelegramApi = require('node-telegram-bot-api')

require('dotenv').config();

const token = process.env.TELEGRAM_TOKEN;


const bot = new TelegramApi(token, {polling: true})

const chats = {}

// Правильные кнопки от 0 до 9
const gameOptions = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '0', callback_data: '0' }, { text: '1', callback_data: '1' }, { text: '2', callback_data: '2' }],
      [{ text: '3', callback_data: '3' }, { text: '4', callback_data: '4' }, { text: '5', callback_data: '5' }],
      [{ text: '6', callback_data: '6' }, { text: '7', callback_data: '7' }, { text: '8', callback_data: '8' }],
      [{ text: '9', callback_data: '9' }]
    ]
  }
};

// Кнопка "играть снова"
const againOptions = {
  reply_markup: {
    inline_keyboard: [
      [{ text: 'Играть снова', callback_data: '/again' }]
    ]
  }
};

const startGame = async (chatId) => {
  await bot.sendMessage(chatId, 'Я сейчас загадаю цифру от 0 до 9, а ты должен её угадать!');
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, 'Отгадывай!', gameOptions);
};

const start = () => {
  bot.setMyCommands([
    { command: '/start', description: 'Начальное приветствие' },
    { command: '/info', description: 'Получить информацию о пользователе' },
    { command: '/game', description: 'Игра угадай цифру' }
  ]);

  bot.on('message', async msg => {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text === '/start') {
      await bot.sendSticker(chatId, 'https://cdn.tlgrm.ru/stickers/463/343/46334338-7539-4dae-bfb6-29e0bb04dc2d/192/9.webp');
      return bot.sendMessage(chatId, 'Добро пожаловать в телеграмм-канал U');
    }

    if (text === '/info') {
      return bot.sendMessage(chatId, `Tебя зовут ${msg.from.first_name} (@${msg.from.username || 'нет username'})`);
    }

    if (text === '/game') {
      return startGame(chatId);
    }

    return bot.sendMessage(chatId, 'Я тебя не понимаю. Попробуй ещё раз!');
  });

  // Обработка нажатия кнопок
  bot.on('callback_query', async msg => {
    const data = msg.data;
    const chatId = msg.message.chat.id;

    // если пользователь нажал "Играть снова"
    if (data === '/again') {
      return startGame(chatId);
    }

    // сравниваем ответ пользователя с загаданным числом
    if (parseInt(data) === chats[chatId]) {
      await bot.sendMessage(chatId, `🎉 Поздравляю! Ты угадал цифру ${chats[chatId]}!`, againOptions);
    } else {
      await bot.sendMessage(chatId, `❌ Увы, не угадал. Бот загадал ${chats[chatId]}.`, againOptions);
    }
  });
};

start();