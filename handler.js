const handler = async context => {
  if (context.event.isText) {
    const { text } = context.event.message;
    if (/^h(ello|i)/i.test(text)) {
      await context.sendText('Hi there!');
    } else {
      await context.sendText('Yo!');
    }
  }
};

module.exports = handler;