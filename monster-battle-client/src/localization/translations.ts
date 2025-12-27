// Localization system with Russian translations

export type Language = 'ru' | 'en';

export interface Translations {
  // Common
  common: {
    back: string;
    claim: string;
    claimed: string;
    close: string;
    continue: string;
    cancel: string;
    confirm: string;
    loading: string;
    error: string;
    success: string;
    level: string;
    day: string;
    days: string;
    week: string;
    today: string;
    rewards: string;
    progress: string;
    completed: string;
    locked: string;
    settings: string;
  };

  // Main Menu
  mainMenu: {
    title: string;
    campaign: string;
    quickBattle: string;
    monsters: string;
    runes: string;
    summon: string;
    arena: string;
    guild: string;
    dungeons: string;
    dailyRewards: string;
    achievements: string;
    quests: string;
    settings: string;
    version: string;
  };

  // Resources
  resources: {
    crystals: string;
    gold: string;
    energy: string;
    arenaWings: string;
    summonScrolls: string;
    exp: string;
  };

  // Daily Rewards
  dailyRewards: {
    title: string;
    streak: string;
    dayStreak: string;
    weeklyRewards: string;
    todayReward: string;
    claimReward: string;
    monthlyMilestones: string;
    totalDays: string;
    currentStreak: string;
    weeksActive: string;
  };

  // Achievements
  achievements: {
    title: string;
    categories: {
      combat: string;
      collection: string;
      progression: string;
      social: string;
      special: string;
    };
    all: string;
    showCompleted: string;
    noAchievements: string;
    reward: string;
    toClaim: string;
    complete: string;
    hidden: string;
    hiddenDescription: string;
    tiers: {
      bronze: string;
      silver: string;
      gold: string;
      platinum: string;
    };
    // Achievement names
    names: {
      first_blood: string;
      warrior_bronze: string;
      warrior_silver: string;
      warrior_gold: string;
      warrior_platinum: string;
      critical_striker: string;
      damage_dealer: string;
      flawless_victory: string;
      arena_champion: string;
      collector_bronze: string;
      collector_silver: string;
      collector_gold: string;
      first_ssr: string;
      ssr_collector: string;
      element_master_fire: string;
      element_master_water: string;
      element_master_wind: string;
      rune_collector: string;
      level_10: string;
      level_25: string;
      level_50: string;
      max_monster: string;
      awaken_monster: string;
      campaign_progress: string;
      perfect_rune: string;
      guild_member: string;
      guild_contributor: string;
      speed_demon: string;
      comeback_king: string;
      daily_dedication: string;
      summoner_luck: string;
    };
    // Achievement descriptions
    descriptions: {
      first_blood: string;
      warrior_bronze: string;
      warrior_silver: string;
      warrior_gold: string;
      warrior_platinum: string;
      critical_striker: string;
      damage_dealer: string;
      flawless_victory: string;
      arena_champion: string;
      collector_bronze: string;
      collector_silver: string;
      collector_gold: string;
      first_ssr: string;
      ssr_collector: string;
      element_master_fire: string;
      element_master_water: string;
      element_master_wind: string;
      rune_collector: string;
      level_10: string;
      level_25: string;
      level_50: string;
      max_monster: string;
      awaken_monster: string;
      campaign_progress: string;
      perfect_rune: string;
      guild_member: string;
      guild_contributor: string;
      speed_demon: string;
      comeback_king: string;
      daily_dedication: string;
      summoner_luck: string;
    };
  };

  // Quests
  quests: {
    title: string;
    daily: string;
    weekly: string;
    story: string;
    event: string;
    dailyQuests: string;
    weeklyQuests: string;
    storyQuests: string;
    resetsAtMidnight: string;
    resetsMonday: string;
    completeToUnlock: string;
    chapter: string;
    noQuests: string;
    // Quest names
    questNames: {
      battle_ready: string;
      warrior_spirit: string;
      arena_fighter: string;
      campaign_adventurer: string;
      critical_master: string;
      lucky_draw: string;
      summoner: string;
      power_up: string;
      monster_trainer: string;
      daily_login: string;
      energy_spender: string;
      guild_supporter: string;
      weekly_battles: string;
      weekly_arena: string;
      weekly_campaign: string;
      weekly_summon: string;
      weekly_upgrade: string;
      weekly_login: string;
      story_1_1: string;
      story_1_2: string;
      story_1_3: string;
      story_2_1: string;
      story_2_2: string;
      story_2_3: string;
      story_3_1: string;
      story_3_2: string;
      story_3_3: string;
    };
    questDescriptions: {
      battle_ready: string;
      warrior_spirit: string;
      arena_fighter: string;
      campaign_adventurer: string;
      critical_master: string;
      lucky_draw: string;
      summoner: string;
      power_up: string;
      monster_trainer: string;
      daily_login: string;
      energy_spender: string;
      guild_supporter: string;
      weekly_battles: string;
      weekly_arena: string;
      weekly_campaign: string;
      weekly_summon: string;
      weekly_upgrade: string;
      weekly_login: string;
      story_1_1: string;
      story_1_2: string;
      story_1_3: string;
      story_2_1: string;
      story_2_2: string;
      story_2_3: string;
      story_3_1: string;
      story_3_2: string;
      story_3_3: string;
    };
  };

  // Battle
  battle: {
    title: string;
    victory: string;
    defeat: string;
    youWon: string;
    betterLuckNextTime: string;
    turn: string;
    auto: string;
    speed: string;
    selectAction: string;
    selectTarget: string;
    targets: string;
    viewStatistics: string;
    battleSummary: string;
    totalDamage: string;
    totalHealing: string;
    damageTaken: string;
    turns: string;
    monster: string;
    damage: string;
    healing: string;
    crits: string;
    effects: string;
    yourTeam: string;
    enemyTeam: string;
    phases: {
      initialization: string;
      tick: string;
      turn_start: string;
      action_selection: string;
      action_execution: string;
      effect_resolution: string;
      turn_end: string;
      victory_check: string;
      battle_end: string;
    };
  };

  // Tutorial
  tutorial: {
    welcome: string;
    welcomeMessage: string;
    skip: string;
    next: string;
    previous: string;
    finish: string;
    step: string;
    of: string;
    steps: {
      mainMenu: {
        title: string;
        description: string;
      };
      campaign: {
        title: string;
        description: string;
      };
      battle: {
        title: string;
        description: string;
      };
      skills: {
        title: string;
        description: string;
      };
      targeting: {
        title: string;
        description: string;
      };
      monsters: {
        title: string;
        description: string;
      };
      runes: {
        title: string;
        description: string;
      };
      summon: {
        title: string;
        description: string;
      };
      dailyRewards: {
        title: string;
        description: string;
      };
      quests: {
        title: string;
        description: string;
      };
    };
  };

  // Elements
  elements: {
    fire: string;
    water: string;
    wind: string;
    light: string;
    dark: string;
  };

  // Rarity
  rarity: {
    common: string;
    rare: string;
    sr: string;
    ssr: string;
  };

  // Other screens
  campaign: {
    title: string;
    stage: string;
    stars: string;
    energy: string;
    boss: string;
  };

  arena: {
    title: string;
    rank: string;
    points: string;
    wings: string;
    opponents: string;
    attack: string;
    refresh: string;
  };

  guild: {
    title: string;
    members: string;
    donate: string;
    leave: string;
    join: string;
    search: string;
    createGuild: string;
  };

  summon: {
    title: string;
    singleSummon: string;
    multiSummon: string;
    pity: string;
    guaranteed: string;
    rates: string;
  };

  monsters: {
    title: string;
    level: string;
    awakened: string;
    skills: string;
    stats: string;
    equippedRunes: string;
  };

  runesScreen: {
    title: string;
    set: string;
    slot: string;
    mainStat: string;
    subStats: string;
    upgrade: string;
    equip: string;
    unequip: string;
  };

  settingsScreen: {
    title: string;
    sound: string;
    music: string;
    notifications: string;
    language: string;
    account: string;
    logout: string;
    about: string;
  };
}

export const russianTranslations: Translations = {
  common: {
    back: 'Назад',
    claim: 'Получить',
    claimed: 'Получено',
    close: 'Закрыть',
    continue: 'Продолжить',
    cancel: 'Отмена',
    confirm: 'Подтвердить',
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успех',
    level: 'Уровень',
    day: 'День',
    days: 'Дней',
    week: 'Неделя',
    today: 'Сегодня',
    rewards: 'Награды',
    progress: 'Прогресс',
    completed: 'Завершено',
    locked: 'Заблокировано',
    settings: 'Настройки',
  },

  mainMenu: {
    title: 'Битва Монстров',
    campaign: 'Кампания',
    quickBattle: 'Быстрый Бой',
    monsters: 'Монстры',
    runes: 'Руны',
    summon: 'Призыв',
    arena: 'Арена',
    guild: 'Гильдия',
    dungeons: 'Подземелья',
    dailyRewards: 'Ежедневные награды',
    achievements: 'Достижения',
    quests: 'Задания',
    settings: 'Настройки',
    version: 'Версия',
  },

  resources: {
    crystals: 'Кристаллы',
    gold: 'Золото',
    energy: 'Энергия',
    arenaWings: 'Крылья арены',
    summonScrolls: 'Свитки призыва',
    exp: 'Опыт',
  },

  dailyRewards: {
    title: 'Ежедневные награды',
    streak: 'Серия',
    dayStreak: 'Дней подряд',
    weeklyRewards: '7-дневные награды',
    todayReward: 'Награда сегодня',
    claimReward: 'Получить награду',
    monthlyMilestones: 'Ежемесячные вехи',
    totalDays: 'Всего дней',
    currentStreak: 'Текущая серия',
    weeksActive: 'Недель активности',
  },

  achievements: {
    title: 'Достижения',
    categories: {
      combat: 'Бой',
      collection: 'Коллекция',
      progression: 'Прогресс',
      social: 'Социальное',
      special: 'Особые',
    },
    all: 'Все',
    showCompleted: 'Показать завершённые',
    noAchievements: 'Нет достижений для отображения',
    reward: 'Награда',
    toClaim: 'к получению',
    complete: 'Выполнено',
    hidden: '???',
    hiddenDescription: 'Выполните скрытые условия для разблокировки',
    tiers: {
      bronze: 'Бронза',
      silver: 'Серебро',
      gold: 'Золото',
      platinum: 'Платина',
    },
    names: {
      first_blood: 'Первая кровь',
      warrior_bronze: 'Начинающий воин',
      warrior_silver: 'Опытный воин',
      warrior_gold: 'Мастер боя',
      warrior_platinum: 'Легендарный воин',
      critical_striker: 'Критический удар',
      damage_dealer: 'Разрушитель',
      flawless_victory: 'Безупречная победа',
      arena_champion: 'Чемпион арены',
      collector_bronze: 'Коллекционер',
      collector_silver: 'Энтузиаст монстров',
      collector_gold: 'Мастер монстров',
      first_ssr: 'Удачная находка',
      ssr_collector: 'Собиратель SSR',
      element_master_fire: 'Мастер огня',
      element_master_water: 'Мастер воды',
      element_master_wind: 'Мастер ветра',
      rune_collector: 'Собиратель рун',
      level_10: 'Восходящая звезда',
      level_25: 'Опытный игрок',
      level_50: 'Ветеран',
      max_monster: 'Тренер монстров',
      awaken_monster: 'Пробуждающий',
      campaign_progress: 'Герой кампании',
      perfect_rune: 'Перфекционист рун',
      guild_member: 'Командный игрок',
      guild_contributor: 'Участник гильдии',
      speed_demon: 'Скоростной демон',
      comeback_king: 'Король камбэка',
      daily_dedication: 'Ежедневная преданность',
      summoner_luck: 'Удача призывателя',
    },
    descriptions: {
      first_blood: 'Выиграйте первый бой',
      warrior_bronze: 'Выиграйте 10 боёв',
      warrior_silver: 'Выиграйте 50 боёв',
      warrior_gold: 'Выиграйте 200 боёв',
      warrior_platinum: 'Выиграйте 1000 боёв',
      critical_striker: 'Нанесите 100 критических ударов',
      damage_dealer: 'Нанесите 100,000 урона',
      flawless_victory: 'Выиграйте бой без потери монстров',
      arena_champion: 'Выиграйте 50 боёв на арене',
      collector_bronze: 'Соберите 10 разных монстров',
      collector_silver: 'Соберите 25 разных монстров',
      collector_gold: 'Соберите 50 разных монстров',
      first_ssr: 'Получите первого SSR монстра',
      ssr_collector: 'Соберите 5 SSR монстров',
      element_master_fire: 'Соберите 10 монстров огня',
      element_master_water: 'Соберите 10 монстров воды',
      element_master_wind: 'Соберите 10 монстров ветра',
      rune_collector: 'Соберите 50 рун',
      level_10: 'Достигните 10 уровня',
      level_25: 'Достигните 25 уровня',
      level_50: 'Достигните 50 уровня',
      max_monster: 'Прокачайте монстра до максимального уровня',
      awaken_monster: 'Пробудите монстра',
      campaign_progress: 'Пройдите 50 этапов кампании',
      perfect_rune: 'Улучшите руну до +15',
      guild_member: 'Вступите в гильдию',
      guild_contributor: 'Пожертвуйте 10,000 золота в гильдию',
      speed_demon: 'Выиграйте бой менее чем за 30 секунд',
      comeback_king: 'Выиграйте бой с 1 монстром при HP менее 10%',
      daily_dedication: 'Входите 30 дней подряд',
      summoner_luck: 'Получите 2 SSR в одном призыве x10',
    },
  },

  quests: {
    title: 'Задания',
    daily: 'Ежедневные',
    weekly: 'Еженедельные',
    story: 'Сюжет',
    event: 'События',
    dailyQuests: 'Ежедневные задания',
    weeklyQuests: 'Еженедельные задания',
    storyQuests: 'Сюжетные задания',
    resetsAtMidnight: 'Сброс в полночь',
    resetsMonday: 'Сброс каждый понедельник',
    completeToUnlock: 'Выполните для разблокировки',
    chapter: 'Глава',
    noQuests: 'Нет доступных заданий',
    questNames: {
      battle_ready: 'Готов к бою',
      warrior_spirit: 'Дух воина',
      arena_fighter: 'Боец арены',
      campaign_adventurer: 'Искатель приключений',
      critical_master: 'Мастер критов',
      lucky_draw: 'Счастливый розыгрыш',
      summoner: 'Призыватель',
      power_up: 'Усиление',
      monster_trainer: 'Тренер монстров',
      daily_login: 'Ежедневный вход',
      energy_spender: 'Расходник энергии',
      guild_supporter: 'Помощник гильдии',
      weekly_battles: 'Еженедельный воин',
      weekly_arena: 'Чемпион арены',
      weekly_campaign: 'Герой кампании',
      weekly_summon: 'Марафон призыва',
      weekly_upgrade: 'Усилитель',
      weekly_login: 'Преданный игрок',
      story_1_1: 'Начало пути',
      story_1_2: 'Собираем команду',
      story_1_3: 'Экипировка для боя',
      story_2_1: 'Растущая сила',
      story_2_2: 'Покоритель кампании',
      story_2_3: 'Претендент арены',
      story_3_1: 'Коллекционер',
      story_3_2: 'Мастер рун',
      story_3_3: 'Член гильдии',
    },
    questDescriptions: {
      battle_ready: 'Выиграйте 3 боя',
      warrior_spirit: 'Выиграйте 5 боёв',
      arena_fighter: 'Проведите 3 боя на арене',
      campaign_adventurer: 'Пройдите 5 этапов кампании',
      critical_master: 'Нанесите 10 критических ударов',
      lucky_draw: 'Выполните 1 призыв',
      summoner: 'Выполните 3 призыва',
      power_up: 'Улучшите руну',
      monster_trainer: 'Повысьте уровень монстра',
      daily_login: 'Получите ежедневную награду',
      energy_spender: 'Потратьте 50 энергии',
      guild_supporter: 'Сделайте пожертвование в гильдию',
      weekly_battles: 'Выиграйте 30 боёв за неделю',
      weekly_arena: 'Проведите 20 боёв на арене',
      weekly_campaign: 'Пройдите 50 этапов кампании',
      weekly_summon: 'Выполните 20 призывов',
      weekly_upgrade: 'Улучшите руны 30 раз',
      weekly_login: 'Входите 7 дней',
      story_1_1: 'Завершите первый бой',
      story_1_2: 'Соберите 5 монстров',
      story_1_3: 'Наденьте руну на монстра',
      story_2_1: 'Прокачайте монстра до 20 уровня',
      story_2_2: 'Пройдите 10 этапов кампании',
      story_2_3: 'Выиграйте 5 боёв на арене',
      story_3_1: 'Соберите 15 разных монстров',
      story_3_2: 'Улучшите руну до +12',
      story_3_3: 'Вступите в гильдию',
    },
  },

  battle: {
    title: 'Бой',
    victory: 'ПОБЕДА!',
    defeat: 'ПОРАЖЕНИЕ',
    youWon: 'Вы выиграли бой!',
    betterLuckNextTime: 'Повезёт в следующий раз...',
    turn: 'Ход',
    auto: 'Авто',
    speed: 'Скорость',
    selectAction: 'Выберите действие',
    selectTarget: 'Выберите цель',
    targets: 'целей',
    viewStatistics: 'Статистика боя',
    battleSummary: 'Итоги боя',
    totalDamage: 'Всего урона',
    totalHealing: 'Всего лечения',
    damageTaken: 'Получено урона',
    turns: 'Ходов',
    monster: 'Монстр',
    damage: 'Урон',
    healing: 'Лечение',
    crits: 'Криты',
    effects: 'Эффекты',
    yourTeam: 'Ваша команда',
    enemyTeam: 'Команда противника',
    phases: {
      initialization: 'Запуск...',
      tick: 'Обработка',
      turn_start: 'Начало хода',
      action_selection: 'Выбор действия',
      action_execution: 'Атака',
      effect_resolution: 'Эффекты',
      turn_end: 'Конец хода',
      victory_check: 'Проверка',
      battle_end: 'Бой окончен',
    },
  },

  tutorial: {
    welcome: 'Добро пожаловать!',
    welcomeMessage: 'Добро пожаловать в Битву Монстров! Давайте изучим основы игры.',
    skip: 'Пропустить',
    next: 'Далее',
    previous: 'Назад',
    finish: 'Завершить',
    step: 'Шаг',
    of: 'из',
    steps: {
      mainMenu: {
        title: 'Главное меню',
        description: 'Это главное меню. Отсюда вы можете получить доступ ко всем функциям игры.',
      },
      campaign: {
        title: 'Кампания',
        description: 'Проходите этапы кампании, чтобы получать опыт, золото и руны. Это основной способ прогресса!',
      },
      battle: {
        title: 'Боевая система',
        description: 'Бои проходят в пошаговом режиме. Полоска ATB определяет порядок ходов монстров.',
      },
      skills: {
        title: 'Навыки',
        description: 'У каждого монстра есть уникальные навыки. Выбирайте их с умом! У некоторых есть перезарядка.',
      },
      targeting: {
        title: 'Выбор цели',
        description: 'После выбора навыка выберите цель. Красные — враги, зелёные — союзники.',
      },
      monsters: {
        title: 'Коллекция монстров',
        description: 'Просматривайте и улучшайте своих монстров. Экипируйте руны для усиления характеристик!',
      },
      runes: {
        title: 'Система рун',
        description: 'Руны дают бонусы к характеристикам. Собирайте комплекты для дополнительных эффектов!',
      },
      summon: {
        title: 'Призыв',
        description: 'Тратьте кристаллы для призыва новых монстров. Редкие монстры сильнее!',
      },
      dailyRewards: {
        title: 'Ежедневные награды',
        description: 'Заходите каждый день за наградами. Чем дольше серия — тем лучше призы!',
      },
      quests: {
        title: 'Задания',
        description: 'Выполняйте ежедневные и еженедельные задания для получения дополнительных наград.',
      },
    },
  },

  elements: {
    fire: 'Огонь',
    water: 'Вода',
    wind: 'Ветер',
    light: 'Свет',
    dark: 'Тьма',
  },

  rarity: {
    common: 'Обычный',
    rare: 'Редкий',
    sr: 'SR',
    ssr: 'SSR',
  },

  campaign: {
    title: 'Кампания',
    stage: 'Этап',
    stars: 'Звёзды',
    energy: 'Энергия',
    boss: 'Босс',
  },

  arena: {
    title: 'Арена',
    rank: 'Ранг',
    points: 'Очки',
    wings: 'Крылья',
    opponents: 'Противники',
    attack: 'Атаковать',
    refresh: 'Обновить',
  },

  guild: {
    title: 'Гильдия',
    members: 'Участники',
    donate: 'Пожертвовать',
    leave: 'Покинуть',
    join: 'Вступить',
    search: 'Поиск',
    createGuild: 'Создать гильдию',
  },

  summon: {
    title: 'Призыв',
    singleSummon: 'Призыв x1',
    multiSummon: 'Призыв x10',
    pity: 'Гарант',
    guaranteed: 'Гарантированный',
    rates: 'Шансы',
  },

  monsters: {
    title: 'Монстры',
    level: 'Уровень',
    awakened: 'Пробуждённый',
    skills: 'Навыки',
    stats: 'Характеристики',
    equippedRunes: 'Экипированные руны',
  },

  runesScreen: {
    title: 'Руны',
    set: 'Комплект',
    slot: 'Слот',
    mainStat: 'Основной стат',
    subStats: 'Доп. статы',
    upgrade: 'Улучшить',
    equip: 'Надеть',
    unequip: 'Снять',
  },

  settingsScreen: {
    title: 'Настройки',
    sound: 'Звук',
    music: 'Музыка',
    notifications: 'Уведомления',
    language: 'Язык',
    account: 'Аккаунт',
    logout: 'Выйти',
    about: 'О игре',
  },
};

// English translations (for reference/fallback)
export const englishTranslations: Translations = {
  common: {
    back: 'Back',
    claim: 'Claim',
    claimed: 'Claimed',
    close: 'Close',
    continue: 'Continue',
    cancel: 'Cancel',
    confirm: 'Confirm',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    level: 'Level',
    day: 'Day',
    days: 'Days',
    week: 'Week',
    today: 'Today',
    rewards: 'Rewards',
    progress: 'Progress',
    completed: 'Completed',
    locked: 'Locked',
    settings: 'Settings',
  },

  mainMenu: {
    title: 'Monster Battle',
    campaign: 'Campaign',
    quickBattle: 'Quick Battle',
    monsters: 'Monsters',
    runes: 'Runes',
    summon: 'Summon',
    arena: 'Arena',
    guild: 'Guild',
    dungeons: 'Dungeons',
    dailyRewards: 'Daily Rewards',
    achievements: 'Achievements',
    quests: 'Quests',
    settings: 'Settings',
    version: 'Version',
  },

  resources: {
    crystals: 'Crystals',
    gold: 'Gold',
    energy: 'Energy',
    arenaWings: 'Arena Wings',
    summonScrolls: 'Summon Scrolls',
    exp: 'EXP',
  },

  dailyRewards: {
    title: 'Daily Rewards',
    streak: 'Streak',
    dayStreak: 'Day Streak',
    weeklyRewards: '7-Day Login Rewards',
    todayReward: "Today's Reward",
    claimReward: 'Claim Reward',
    monthlyMilestones: 'Monthly Milestones',
    totalDays: 'Total Days',
    currentStreak: 'Current Streak',
    weeksActive: 'Weeks Active',
  },

  achievements: {
    title: 'Achievements',
    categories: {
      combat: 'Combat',
      collection: 'Collection',
      progression: 'Progression',
      social: 'Social',
      special: 'Special',
    },
    all: 'All',
    showCompleted: 'Show completed',
    noAchievements: 'No achievements to show',
    reward: 'Reward',
    toClaim: 'to claim',
    complete: 'Complete',
    hidden: '???',
    hiddenDescription: 'Complete hidden conditions to unlock',
    tiers: {
      bronze: 'Bronze',
      silver: 'Silver',
      gold: 'Gold',
      platinum: 'Platinum',
    },
    names: {
      first_blood: 'First Blood',
      warrior_bronze: 'Novice Warrior',
      warrior_silver: 'Skilled Warrior',
      warrior_gold: 'Master Warrior',
      warrior_platinum: 'Legendary Warrior',
      critical_striker: 'Critical Striker',
      damage_dealer: 'Damage Dealer',
      flawless_victory: 'Flawless Victory',
      arena_champion: 'Arena Champion',
      collector_bronze: 'Monster Collector',
      collector_silver: 'Monster Enthusiast',
      collector_gold: 'Monster Master',
      first_ssr: 'Lucky Find',
      ssr_collector: 'SSR Collector',
      element_master_fire: 'Fire Master',
      element_master_water: 'Water Master',
      element_master_wind: 'Wind Master',
      rune_collector: 'Rune Collector',
      level_10: 'Rising Star',
      level_25: 'Experienced',
      level_50: 'Veteran',
      max_monster: 'Monster Trainer',
      awaken_monster: 'Awakener',
      campaign_progress: 'Campaign Hero',
      perfect_rune: 'Rune Perfectionist',
      guild_member: 'Team Player',
      guild_contributor: 'Guild Contributor',
      speed_demon: 'Speed Demon',
      comeback_king: 'Comeback King',
      daily_dedication: 'Daily Dedication',
      summoner_luck: "Summoner's Luck",
    },
    descriptions: {
      first_blood: 'Win your first battle',
      warrior_bronze: 'Win 10 battles',
      warrior_silver: 'Win 50 battles',
      warrior_gold: 'Win 200 battles',
      warrior_platinum: 'Win 1000 battles',
      critical_striker: 'Land 100 critical hits',
      damage_dealer: 'Deal 100,000 total damage',
      flawless_victory: 'Win a battle without losing any monsters',
      arena_champion: 'Win 50 arena battles',
      collector_bronze: 'Own 10 different monsters',
      collector_silver: 'Own 25 different monsters',
      collector_gold: 'Own 50 different monsters',
      first_ssr: 'Obtain your first SSR monster',
      ssr_collector: 'Own 5 SSR monsters',
      element_master_fire: 'Own 10 fire element monsters',
      element_master_water: 'Own 10 water element monsters',
      element_master_wind: 'Own 10 wind element monsters',
      rune_collector: 'Own 50 runes',
      level_10: 'Reach player level 10',
      level_25: 'Reach player level 25',
      level_50: 'Reach player level 50',
      max_monster: 'Level a monster to max level',
      awaken_monster: 'Awaken a monster',
      campaign_progress: 'Complete 50 campaign stages',
      perfect_rune: 'Upgrade a rune to +15',
      guild_member: 'Join a guild',
      guild_contributor: 'Donate 10,000 gold to guild',
      speed_demon: 'Win a battle in under 30 seconds',
      comeback_king: 'Win a battle with only 1 monster remaining at under 10% HP',
      daily_dedication: 'Log in for 30 consecutive days',
      summoner_luck: 'Get 2 SSR monsters in a single 10-pull',
    },
  },

  quests: {
    title: 'Quests',
    daily: 'Daily',
    weekly: 'Weekly',
    story: 'Story',
    event: 'Event',
    dailyQuests: 'Daily Quests',
    weeklyQuests: 'Weekly Quests',
    storyQuests: 'Story Quests',
    resetsAtMidnight: 'Resets at midnight',
    resetsMonday: 'Resets every Monday',
    completeToUnlock: 'Complete to unlock more',
    chapter: 'Chapter',
    noQuests: 'No quests available',
    questNames: {
      battle_ready: 'Battle Ready',
      warrior_spirit: 'Warrior Spirit',
      arena_fighter: 'Arena Fighter',
      campaign_adventurer: 'Campaign Adventurer',
      critical_master: 'Critical Master',
      lucky_draw: 'Lucky Draw',
      summoner: 'Summoner',
      power_up: 'Power Up',
      monster_trainer: 'Monster Trainer',
      daily_login: 'Daily Login',
      energy_spender: 'Energy Spender',
      guild_supporter: 'Guild Supporter',
      weekly_battles: 'Weekly Warrior',
      weekly_arena: 'Arena Champion',
      weekly_campaign: 'Campaign Hero',
      weekly_summon: 'Summoning Spree',
      weekly_upgrade: 'Power Grinder',
      weekly_login: 'Dedicated Player',
      story_1_1: 'The Journey Begins',
      story_1_2: 'Building Your Team',
      story_1_3: 'Equip for Battle',
      story_2_1: 'Rising Power',
      story_2_2: 'Campaign Conqueror',
      story_2_3: 'Arena Challenger',
      story_3_1: 'Collector',
      story_3_2: 'Rune Master',
      story_3_3: 'Guild Member',
    },
    questDescriptions: {
      battle_ready: 'Win 3 battles',
      warrior_spirit: 'Win 5 battles',
      arena_fighter: 'Complete 3 arena battles',
      campaign_adventurer: 'Complete 5 campaign stages',
      critical_master: 'Land 10 critical hits',
      lucky_draw: 'Perform 1 summon',
      summoner: 'Perform 3 summons',
      power_up: 'Upgrade a rune',
      monster_trainer: 'Level up a monster',
      daily_login: 'Claim daily reward',
      energy_spender: 'Use 50 energy',
      guild_supporter: 'Donate to guild',
      weekly_battles: 'Win 30 battles this week',
      weekly_arena: 'Complete 20 arena battles',
      weekly_campaign: 'Complete 50 campaign stages',
      weekly_summon: 'Perform 20 summons',
      weekly_upgrade: 'Upgrade runes 30 times',
      weekly_login: 'Log in 7 days',
      story_1_1: 'Complete your first battle',
      story_1_2: 'Own 5 monsters',
      story_1_3: 'Equip a rune on a monster',
      story_2_1: 'Level a monster to 20',
      story_2_2: 'Complete 10 campaign stages',
      story_2_3: 'Win 5 arena battles',
      story_3_1: 'Own 15 different monsters',
      story_3_2: 'Upgrade a rune to +12',
      story_3_3: 'Join a guild',
    },
  },

  battle: {
    title: 'Battle',
    victory: 'VICTORY!',
    defeat: 'DEFEAT',
    youWon: 'You won the battle!',
    betterLuckNextTime: 'Better luck next time...',
    turn: 'Turn',
    auto: 'Auto',
    speed: 'Speed',
    selectAction: 'Select Action',
    selectTarget: 'Select Target',
    targets: 'targets',
    viewStatistics: 'View Battle Statistics',
    battleSummary: 'Battle Summary',
    totalDamage: 'Total Damage',
    totalHealing: 'Total Healing',
    damageTaken: 'Damage Taken',
    turns: 'Turns',
    monster: 'Monster',
    damage: 'Damage',
    healing: 'Healing',
    crits: 'Crits',
    effects: 'Effects',
    yourTeam: 'Your Team',
    enemyTeam: 'Enemy Team',
    phases: {
      initialization: 'Starting...',
      tick: 'Processing',
      turn_start: 'Turn Start',
      action_selection: 'Select Action',
      action_execution: 'Attacking',
      effect_resolution: 'Effects',
      turn_end: 'Turn End',
      victory_check: 'Checking',
      battle_end: 'Battle Over',
    },
  },

  tutorial: {
    welcome: 'Welcome!',
    welcomeMessage: 'Welcome to Monster Battle! Let us learn the basics of the game.',
    skip: 'Skip',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    step: 'Step',
    of: 'of',
    steps: {
      mainMenu: {
        title: 'Main Menu',
        description: 'This is the main menu. From here you can access all game features.',
      },
      campaign: {
        title: 'Campaign',
        description: 'Complete campaign stages to earn experience, gold, and runes. This is the main way to progress!',
      },
      battle: {
        title: 'Battle System',
        description: 'Battles are turn-based. The ATB bar determines the turn order of monsters.',
      },
      skills: {
        title: 'Skills',
        description: 'Each monster has unique skills. Choose them wisely! Some have cooldowns.',
      },
      targeting: {
        title: 'Targeting',
        description: 'After selecting a skill, choose a target. Red = enemies, green = allies.',
      },
      monsters: {
        title: 'Monster Collection',
        description: 'View and upgrade your monsters. Equip runes to boost their stats!',
      },
      runes: {
        title: 'Rune System',
        description: 'Runes provide stat bonuses. Collect sets for additional effects!',
      },
      summon: {
        title: 'Summon',
        description: 'Spend crystals to summon new monsters. Rare monsters are stronger!',
      },
      dailyRewards: {
        title: 'Daily Rewards',
        description: 'Log in every day for rewards. The longer your streak, the better the prizes!',
      },
      quests: {
        title: 'Quests',
        description: 'Complete daily and weekly quests for extra rewards.',
      },
    },
  },

  elements: {
    fire: 'Fire',
    water: 'Water',
    wind: 'Wind',
    light: 'Light',
    dark: 'Dark',
  },

  rarity: {
    common: 'Common',
    rare: 'Rare',
    sr: 'SR',
    ssr: 'SSR',
  },

  campaign: {
    title: 'Campaign',
    stage: 'Stage',
    stars: 'Stars',
    energy: 'Energy',
    boss: 'Boss',
  },

  arena: {
    title: 'Arena',
    rank: 'Rank',
    points: 'Points',
    wings: 'Wings',
    opponents: 'Opponents',
    attack: 'Attack',
    refresh: 'Refresh',
  },

  guild: {
    title: 'Guild',
    members: 'Members',
    donate: 'Donate',
    leave: 'Leave',
    join: 'Join',
    search: 'Search',
    createGuild: 'Create Guild',
  },

  summon: {
    title: 'Summon',
    singleSummon: 'Summon x1',
    multiSummon: 'Summon x10',
    pity: 'Pity',
    guaranteed: 'Guaranteed',
    rates: 'Rates',
  },

  monsters: {
    title: 'Monsters',
    level: 'Level',
    awakened: 'Awakened',
    skills: 'Skills',
    stats: 'Stats',
    equippedRunes: 'Equipped Runes',
  },

  runesScreen: {
    title: 'Runes',
    set: 'Set',
    slot: 'Slot',
    mainStat: 'Main Stat',
    subStats: 'Sub Stats',
    upgrade: 'Upgrade',
    equip: 'Equip',
    unequip: 'Unequip',
  },

  settingsScreen: {
    title: 'Settings',
    sound: 'Sound',
    music: 'Music',
    notifications: 'Notifications',
    language: 'Language',
    account: 'Account',
    logout: 'Logout',
    about: 'About',
  },
};
