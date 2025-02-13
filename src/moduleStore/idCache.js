import sleep from '../util/sleep';

const currentDate = new Date() - 0;

let goosemodScope = {};

let getUser;

let queueProcessInterval;

export const setThisScope = (scope) => {
  goosemodScope = scope;

  getUser = goosemodScope.webpackModules.findByProps('getUser', 'fetchCurrentUser').getUser;
};

const queue = [], queueReturns = [];

const processQueue = async () => {
  if (queue.length === 0) {
    clearInterval(queueProcessInterval);
    queueProcessInterval = undefined;

    return;
  }

  const id = queue.pop();

  queueReturns.push(await getUser(id));
};

export const getCache = () => JSON.parse(localStorage.getItem('goosemodIDCache') || '{}');
export const purgeCache = () => localStorage.removeItem('goosemodIDCache');

export const updateCache = (id, data) => {
  let cache = getCache();

  cache[id] = {
    data,
    time: currentDate
  };

  localStorage.setItem('goosemodIDCache', JSON.stringify(cache));
};

export const getDataForID = async (id) => {
  const cache = getCache();

  if (cache[id] && cache[id].time > currentDate - (1000 * 60 * 60 * 24)) {
    return cache[id].data;
  } else {
    queue.push(id);

    if (!queueProcessInterval) {
      queueProcessInterval = setInterval(processQueue, 100);
    }

    let data;

    while (true) {
      data = queueReturns.find((x) => x.id === id);

      if (data) {
        queueReturns.splice(queueReturns.indexOf(data), 1);
        break;
      }

      await sleep(100);
    }

    updateCache(id, data);

    return data;
  }
};