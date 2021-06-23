let goosemodScope = {};

export const setThisScope = (scope) => {
  goosemodScope = scope;

  const { BOT_AVATARS } = goosemodScope.webpackModules.findByProps('BOT_AVATARS', 'DEFAULT_AVATARS');

  BOT_AVATARS.GooseMod =
    "https://media.discordapp.net/attachments/829809799553482764/857200931850289162/iu.png"; // Add avatar image
};


export const send = (content, author = 'HamsterMod') => {
  // Get Webpack Modules
  const { createBotMessage } = goosemodScope.webpackModules.findByProps('createBotMessage');
  const { getChannelId } = goosemodScope.webpackModules.findByProps('getChannelId');
  const { receiveMessage } = goosemodScope.webpackModules.findByProps('receiveMessage', 'sendBotMessage');

  const msg = createBotMessage(getChannelId(), '');

  if (typeof content === 'string') {
    msg.content = content;
  } else {
    msg.embeds.push(content);
  }

  msg.state = 'SENT'; // Set Clyde-like props
  msg.author.id = '1';
  msg.author.bot = true;
  msg.author.discriminator = '0000';

  msg.author.avatar = 'HamsterMod'; // Allow custom avatar URLs in future? (via dynamic BOT_AVATARS adding)
  msg.author.username = author;

  receiveMessage(getChannelId(), msg);
};