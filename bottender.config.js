module.exports = {
  session: {
    driver: 'memory',
    expiresIn: 10, // 10 mins
    stores: {
      memory: {
        maxSize: 1000,
      },
      file: {
        dirname: '.session',
      },
      redis: {
        port: 6379,
        host: '127.0.0.1',
        password: 'auth',
        db: 0,
      },
      mongo: {
        url: 'mongodb://localhost:27017',
        collectionName: 'sessions',
      },
    },
  },

  initialState: {
    word: '',
  },

  channels: {
    messenger: {
      enabled: false,
      path: '/messenger',
      pageId: process.env.MESSENGER_PAGE_ID,
      accessToken: process.env.MESSENGER_ACCESS_TOKEN,
      appId: process.env.MESSENGER_APP_ID,
      appSecret: process.env.MESSENGER_APP_SECRET,
      verifyToken: process.env.MESSENGER_VERIFY_TOKEN,
    },
    line: {
      enabled: true,
      path: '/line',
      accessToken: process.env.accessToken,
      channelSecret: process.env.channelSecret,
    },
    telegram: {
      enabled: true,
      path: '/telegram',
      accessToken: process.env.telegramAccessToken,
    },
  },
};
