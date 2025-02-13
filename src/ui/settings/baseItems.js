import sleep from '../../util/sleep';
import * as GoosemodChangelog from '../goosemodChangelog';

export default (goosemodScope, gmSettings) => {
  const { React } = goosemodScope.webpackModules.common;

  let oldItems = goosemodScope.settings.items;
  goosemodScope.settings.items = [];

  goosemodScope.settings.createHeading('HamsterMod');

  const changeSetting = async (key, value) => {
    switch (key) {
      case 'changelog': {
        if (value) {
          const items = [
            ['item', goosemodScope.i18n.discordStrings.CHANGE_LOG, [''], async () => {
              GoosemodChangelog.show();
            }, false]
          ];

          if (gmSettings.get().separators) items.unshift(['separator']);

          goosemodScope.settings.items.splice(goosemodScope.settings.items.indexOf(goosemodScope.settings.items.find(x => x[1] === 'Themes')) + 1, 0,
            ...items
          );
        } else {
          goosemodScope.settings.items.splice(goosemodScope.settings.items.indexOf(goosemodScope.settings.items.find(x => x[1] === 'Change Log')), gmSettings.get().separators ? 2 : 1);
        }

        await goosemodScope.settings.reopenSettings();
        goosemodScope.settings.openSettingItem('Settings');

        break;
      }

      case 'devchannel': {
        if (value) {
          localStorage.setItem('goosemodUntetheredBranch', 'dev');
        } else {
          localStorage.removeItem('goosemodUntetheredBranch');
        }

        break;
      }

      case 'separators': {
        if (value) {
          if (!gmSettings.get().home) goosemod.settings.items.splice(2, 0, ['separator']);
          if (gmSettings.get().changelog) goosemod.settings.items.splice(4, 0, ['separator']);
        } else {
          let main = true;

          goosemodScope.settings.items = goosemodScope.settings.items.filter((x, i) => {
            if (goosemodScope.settings.items[i + 1] && goosemodScope.settings.items[i + 1][1] && goosemodScope.settings.items[i + 1][1] === 'HamsterMod Modules') main = false;

            return !(x[0] === 'separator' && main);
          });
        }

        await goosemodScope.settings.reopenSettings();
        goosemodScope.settings.openSettingItem('Settings');

        break;
      }

      case 'gmBadges': {
        goosemodScope.gmBadges[value ? 'addBadges' : 'removeBadges']();

        break;
      }
    }

    gmSettings.set(key, value);
  };

  goosemodScope.settings.createItem(goosemodScope.i18n.discordStrings.SETTINGS, ['',
    {
      type: 'header',
      text: 'Settings'
    },

    {
      type: 'toggle',

      text: 'HamsterMod Change Log',
      subtext: 'Show HamsterMod "Change Log" setting',

      onToggle: (c) => changeSetting('changelog', c),
      isToggled: () => gmSettings.get().changelog
    },

    {
      type: 'toggle',

      text: 'Main Separators',
      subtext: 'Show separators between main HamsterMod settings',

      onToggle: (c) => changeSetting('separators', c),
      isToggled: () => gmSettings.get().separators
    },

    {
      type: 'toggle',

      experimental: true,
      text: 'Force Theme Settings',
      subtext: 'Experimental: Force auto-generated settings for all themes, **requires refresh**',

      onToggle: (c) => changeSetting('allThemeSettings', c),
      isToggled: () => gmSettings.get().allThemeSettings
    },

    {
      type: 'toggle',

      text: 'Store In Home',
      subtext: 'Put HamsterMod Store options in home instead of in settings, **requires refresh**',

      onToggle: (c) => changeSetting('home', c),
      isToggled: () => gmSettings.get().home
    },

    {
      type: 'header',
      text: 'Module Store'
    },

    {
      type: 'toggle',

      text: 'Auto Update',
      subtext: 'Automatically update repos and modules every hour',

      onToggle: (c) => changeSetting('autoupdate', c),
      isToggled: () => gmSettings.get().autoupdate
    },

    {
      type: 'header',
      text: 'Internals'
    },

    {
      type: 'toggle',

      experimental: true,
      text: 'Development Channel',
      subtext: 'Use experimental development HamsterMod builds, **requires refresh**',

      onToggle: (c) => changeSetting('devchannel', c),
      isToggled: () => localStorage.getItem('goosemodUntetheredBranch') === 'dev'
    },

    {
      type: 'toggle',

      experimental: true,
      text: 'Data Attributes',
      subtext: 'Add data attributes to some elements for some themes to use, **requires refresh**',

      onToggle: (c) => changeSetting('attrs', c),
      isToggled: () => gmSettings.get().attrs
    },

    {
      type: 'header',
      text: 'Appearance'
    },

    {
      type: 'toggle',

      text: 'HamsterMod/GooseMod Badges',
      subtext: 'Shows GooseMod\'s and HamsterMod badges',

      onToggle: (c) => changeSetting('gmBadges', c),
      isToggled: () => gmSettings.get().gmBadges
    },

    {
      type: 'header',
      text: 'Utilities'
    },

    {
      type: 'text-and-danger-button',
      
      text: 'Reset HamsterMod',
      subtext: 'Resets HamsterMod completely: removes all preferences and modules; like a first-time install',
      buttonText: 'Reset',

      onclick: async () => {
        if (await goosemodScope.confirmDialog('Reset', 'Reset HamsterMod', 'Confirming will completely reset HamsterMod, removing all preferences and modules; as if you had installed HamsterMod for the first time. This is irreversible.')) {
          goosemodScope.remove();
          window.location.reload();
        }
      }
    },

    {
      type: 'text-and-danger-button',

      text: 'Purge Caches',
      subtext: 'Purges (completely removes) most caches HamsterMod uses',
      buttonText: 'Purge',

      onclick: async () => {
        // Like remove's dynamic local storage removal, but only remove GooseMod keys with "Cache" in 

        Object.keys(localStorage).filter((x) => x.toLowerCase().startsWith('goosemod') && x.includes('Cache')).forEach((x) => localStorage.removeItem(x));
      }
    },

    { type: 'gm-footer' }
  ]);

  if (gmSettings.get().separators && !gmSettings.get().home) goosemodScope.settings.createSeparator();

  let sortedVal = 'Stars';
  let importedVal = 'All';
  let authorVal = 'All';
  let searchQuery = '';

  const updateModuleStoreUI = () => {
    const containerEl = document.querySelector('#gm-settings-inject > :first-child');
    const cards = [...containerEl.children].filter((x) => x.querySelector(':scope > .description-3_Ncsb'));

    const fuzzyReg = new RegExp(`.*${searchQuery}.*`, 'i');

    for (let c of cards) {
      const titles = c.getElementsByClassName('title-31JmR4');
      if (!titles[0]) continue; // Not card

      const title = titles[1];

      const authors = [...titles[0].getElementsByClassName('author')].map((x) => x.textContent.split('#')[0]);
      const name = title.childNodes[0].wholeText;

      const description = c.getElementsByClassName('description-3_Ncsb')[0].innerText;

      const matches = (fuzzyReg.test(name) || fuzzyReg.test(description));

      const importedSelector = !c.getElementsByClassName('container-3auIfb')[0].classList.contains('hide-toggle') ? goosemodScope.i18n.goosemodStrings.moduleStore.selectors.imported : goosemodScope.i18n.goosemodStrings.moduleStore.selectors.notImported;

      const tags = [...c.classList].map((t) => t.replace(/\|/g, ' ').toLowerCase());

      switch (sortedVal) {
        case 'A-Z': { // Already pre-sorted to A-Z
          c.style.order = '0';

          break;
        }

        case 'Last Updated': {
          const module = goosemodScope.moduleStoreAPI.modules.find((x) => x.name === name.trim());

          c.style.order = '-' + module.lastUpdated;

          break;
        }

        case 'Stars': {
          c.style.order = '-' + c.children[4].children[0].children[0].textContent;

          break;
        }
      }

      c.style.display = matches
        && (importedVal === 'All' || importedVal === importedSelector)
        && (authorVal === 'All' || authors.includes(authorVal.split(' (').slice(0, -1).join(' (')))
        ? 'block' : 'none';
    }

    const noInput = searchQuery === '' && importedVal === 'All' && authorVal === 'All';

    [...containerEl.getElementsByClassName('gm-store-category')].forEach((x) => x.style.display = noInput ? 'block' : 'none');

    // Keep all header but make height 0 so it breaks flex row
    const allHeader = containerEl.querySelector(':scope > .headerContainer-1Wluzl');

    allHeader.style.height = !noInput ? '0px' : '';
    allHeader.style.opacity = !noInput ? '0' : '';
    allHeader.style.margin = !noInput ? '0' : '';
  };

  const genCurrentDate = new Date();

  const upcomingVal = (x) => {
    const daysSinceUpdate = (genCurrentDate - (x.lastUpdated * 1000)) / 1000 / 60 / 60 / 24;

    return (x.github.stars / daysSinceUpdate) - (x.github.stars / 2) + (1 - daysSinceUpdate);
  };

  [goosemodScope.i18n.goosemodStrings.settings.itemNames.plugins, goosemodScope.i18n.goosemodStrings.settings.itemNames.themes].forEach((x) => goosemodScope.settings.createItem(x, ['',
    {
      type: 'search',
      placeholder: `${goosemodScope.i18n.discordStrings.SEARCH} ${x}`,
      onchange: (query) => {
        searchQuery = query;

        updateModuleStoreUI();
      },
      storeSpecific: true
    },

    {
      type: 'dropdown-individual',

      label: 'Sort by',

      options: [
        'Stars',
        'A-Z',
        'Last Updated'
      ],

      onchange: (val) => {
        sortedVal = val;

        updateModuleStoreUI();
      }
    },

    {
      type: 'dropdown-individual',

      label: 'Author',

      options: () => {
        const idCache = goosemodScope.moduleStoreAPI.idCache.getCache();

        const authors = [...goosemodScope.moduleStoreAPI.modules.reduce((acc, x) => {
          let authors = x.authors;

          if (!Array.isArray(authors)) authors = [ authors ];

          for (let a of authors) {
            let key = a;

            if (a.match(/^[0-9]{17,18}$/)) {
              key = idCache[a].data.username;
            } else {
              const idMatch = a.match(/(.*) \(([0-9]{17,18})\)/); // "<name> (<id>)"

              if (idMatch !== null) {
                key = idMatch[1];
              }
            }

            acc.set(key, (acc.get(key) || 0) + 1);
          }

          return acc;
        }, new Map()).entries()].sort((a, b) => b[1] - a[1]).map((x) => `${x[0]} (${x[1]})`);

        authors.unshift('All');
        
        return authors;
      },

      onchange: (val) => {
        authorVal = val;

        updateModuleStoreUI();
      }
    },

    {
      type: 'dropdown-individual',

      label: goosemodScope.i18n.goosemodStrings.moduleStore.selectors.imported,

      options: [
        'All',
        goosemodScope.i18n.goosemodStrings.moduleStore.selectors.imported,
        goosemodScope.i18n.goosemodStrings.moduleStore.selectors.notImported
      ],

      onchange: (val) => {
        importedVal = val;

        updateModuleStoreUI();
      }
    },

    {
      type: 'store-category',
      text: 'Top Starred',
      sort: (a, b) => b.github.stars - a.github.stars
    },

    {
      type: 'store-category',
      text: 'Recently Updated',
      sort: (a, b) => b.lastUpdated - a.lastUpdated
    },

    {
      type: 'store-category',
      text: 'Upcoming',
      sort: (a, b) => upcomingVal(b) - upcomingVal(a)
    },

    {
      type: 'store-header',
      text: `All ${x}`
    },

    { type: 'gm-footer' }
  ]));

  if (gmSettings.get().changelog) {
    if (gmSettings.get().separators) goosemodScope.settings.createSeparator();

    goosemodScope.settings.createItem(goosemodScope.i18n.discordStrings.CHANGE_LOG, [""], async () => {
      GoosemodChangelog.show();
    });
  }

  goosemodScope.settings.createSeparator();

  goosemodScope.settings.createHeading(goosemodScope.i18n.goosemodStrings.settings.itemNames.goosemodModules);

  goosemodScope.settings.items = goosemodScope.settings.items.concat(oldItems);
};