# Monster Battle - Комплексный План Баланса

## Концепция: Программа Лояльности Ресторана

Игра является частью программы лояльности ресторана. Гости получают награды за:
- Посещение ресторана
- Покупки (чеки)
- Приглашение друзей
- Отзывы и активность в соцсетях

---

## 1. Система Лояльности (Restaurant Integration)

### 1.1 Loyalty Points (LP) - Основная Валюта Лояльности

**Получение LP:**
| Действие | LP | Лимит |
|----------|-----|-------|
| Посещение ресторана | 50 LP | 1 раз/день |
| Чек до 500₽ | 100 LP | без лимита |
| Чек 500-1500₽ | 250 LP | без лимита |
| Чек 1500₽+ | 500 LP | без лимита |
| Приглашение друга | 200 LP | 5 друзей/месяц |
| Отзыв в Google/Яндекс | 300 LP | 1 раз |
| Пост в Instagram | 150 LP | 1 раз/неделя |
| День рождения | 1000 LP | 1 раз/год |

**Трата LP:**
| Награда | Стоимость LP |
|---------|-------------|
| 30 Energy | 100 LP |
| 50 Crystals | 200 LP |
| Summon Scroll | 300 LP |
| Mystical Scroll | 1000 LP |
| Devilmon | 3000 LP |
| Эксклюзивный монстр (SR) | 5000 LP |
| 50,000 Gold | 150 LP |

### 1.2 Visit Streak (Серия Посещений)

Непрерывные посещения в течение недели дают бонусы:

| Посещений подряд | Бонус |
|------------------|-------|
| 2 дня | +10% к LP |
| 3 дня | +20% к LP + 20 Energy |
| 5 дней | +30% к LP + Summon Scroll |
| 7 дней | +50% к LP + Mystical Scroll |

Пропуск дня = сброс серии

### 1.3 VIP Уровни (на основе трат в ресторане)

| VIP Level | Траты (всего) | Бонусы |
|-----------|---------------|--------|
| Bronze | 0₽ | Базовые награды |
| Silver | 5,000₽ | +10% LP, +10 Max Energy |
| Gold | 15,000₽ | +25% LP, +25 Max Energy, -10% цены в магазине |
| Platinum | 50,000₽ | +50% LP, +50 Max Energy, Эксклюзивный монстр |
| Diamond | 150,000₽ | +100% LP, +100 Max Energy, VIP чат, Эксклюзивные руны |

---

## 2. Переработанная Экономика Ресурсов

### 2.1 Energy System (Энергия)

**Текущая проблема:** 5 мин/энергия слишком медленно для casual игроков

**Новый баланс:**
```
Base Max Energy: 60 (было 80)
Energy per 3 minutes: 1 (было 5 мин)
Full recharge: 3 часа (было 6.6+ часов)

Бонусы от VIP:
- Silver: +10 → Max 70
- Gold: +25 → Max 85
- Platinum: +50 → Max 110
- Diamond: +100 → Max 160
```

**Источники энергии:**
| Источник | Количество | Частота |
|----------|-----------|---------|
| Регенерация | 20/час | постоянно |
| Дневной бонус | 30 | 1 раз/день |
| Посещение ресторана | 50 | 1 раз/день |
| Просмотр рекламы | 10 | 5 раз/день |
| Квесты | 20-50 | по выполнению |
| Покупка за LP | 30 за 100 LP | без лимита |

**Расход энергии:**
| Контент | Стоимость |
|---------|-----------|
| Кампания (easy) | 3-4 |
| Кампания (hard) | 5-6 |
| Giants B1-B5 | 4 |
| Giants B6-B10 | 5-6 |
| Dragons/Necro | 5-7 |
| ToA | БЕСПЛАТНО |
| Rift | 8-10 |
| Arena | Тикеты (не энергия) |

### 2.2 Gold Economy (Золото)

**Проблема:** Избыток золота в mid-game, нехватка в late-game

**Новый баланс источников:**
| Источник | Gold/день (среднее) |
|----------|---------------------|
| Кампания (20 runs) | 15,000 |
| Подземелья (10 runs) | 20,000 |
| Дневные квесты | 25,000 |
| Продажа рун | 10,000 |
| Arena rewards | 5,000 |
| **Итого F2P** | **~75,000/день** |
| + Ресторан LP | +20,000 |
| **Итого с LP** | **~95,000/день** |

**Новый баланс расходов:**
| Расход | Стоимость |
|--------|-----------|
| Эволюция 2→3★ | 3,000 (было 5,000) |
| Эволюция 3→4★ | 8,000 (было 10,000) |
| Эволюция 4→5★ | 15,000 (было 20,000) |
| Эволюция 5→6★ | 30,000 (было 50,000) |
| Пробуждение | 5,000-30,000 |
| Апгрейд руны +1-+9 | 1,000-8,000 |
| Апгрейд руны +10-+15 | 10,000-40,000 |

**Ожидаемый баланс:**
- Новый игрок: дефицит золота (учится экономить)
- Mid-game (1-2 месяца): баланс
- Late-game (3+ месяца): избыток → новые синки нужны

### 2.3 Crystal Economy (Кристаллы)

**Проблема:** Слишком мало кристаллов для F2P

**Новый баланс источников:**
| Источник | Crystals/неделя |
|----------|-----------------|
| Дневные квесты | 150 |
| Недельные квесты | 380 |
| Arena rewards | 100 |
| ToA прогресс | 50 |
| Посещение ресторана (LP) | 150-350 |
| **Итого F2P** | **680/неделя** |
| **С рестораном** | **830-1030/неделя** |

**Гача расчёт:**
- 30 кристаллов = 1 pull
- 830 кристаллов/неделя = ~27 pulls/неделя
- Soft pity на 60, hard pity на 70
- **Гарантированный SSR: каждые 2.5-3 недели для активного игрока**

---

## 3. Система Прогрессии Монстров

### 3.1 Кривая Уровней

**Формула опыта:**
```javascript
function expForLevel(level, stars) {
  const baseExp = 100;
  const starMultiplier = 1 + (stars - 1) * 0.15;
  return Math.floor(baseExp * level * starMultiplier);
}

// Примеры:
// 3★ Lv.20→21: 100 * 21 * 1.30 = 2,730 EXP
// 5★ Lv.30→31: 100 * 31 * 1.60 = 4,960 EXP
// 6★ Lv.39→40: 100 * 40 * 1.75 = 7,000 EXP
```

**Время прокачки одного монстра до 6★ Lv.40:**
| Метод | Время |
|-------|-------|
| Только кампания | 2-3 недели |
| Кампания + подземелья | 1-2 недели |
| С бустерами XP (из ресторана) | 4-7 дней |

### 3.2 Система Звёзд и Эволюции

**Новые требования:**
| Переход | Fodder | Gold | Max Level |
|---------|--------|------|-----------|
| 2★→3★ | 2×2★ | 3,000 | 20 |
| 3★→4★ | 3×3★ | 8,000 | 25 |
| 4★→5★ | 4×4★ | 15,000 | 30 |
| 5★→6★ | 5×5★ | 30,000 | 35 |

**НОВОЕ: Rainbowmon (кормовые монстры)**
Добавляем специальных монстров-корм для эволюции:
- 2★ Rainbowmon: выпадает из кампании (5%)
- 3★ Rainbowmon: награда за дневные квесты
- 4★ Rainbowmon: награда за недельные квесты
- 5★ Rainbowmon: награда за месячные цели / ToA 100

### 3.3 Система Пробуждения

**Требования эссенций:**
| Nat Stars | Low | Mid | High | Gold |
|-----------|-----|-----|------|------|
| 2★ | 5 | 3 | 0 | 3,000 |
| 3★ | 10 | 5 | 2 | 5,000 |
| 4★ | 10 | 10 | 5 | 15,000 |
| 5★ | 10 | 15 | 10 | 30,000 |

**Фарм эссенций:**
- Hall of Magic: 1-3 low/mid эссенции за run
- Hall of Elements: 1-2 high эссенции за run (B7+)
- **Время на пробуждение 5★:** ~1 неделя активной игры

### 3.4 Skill Ups (Devilmon)

**Проблема:** Слишком редкие Devilmon

**Новые источники:**
| Источник | Количество | Частота |
|----------|-----------|---------|
| День 7 Daily Login | 1 | еженедельно |
| Недельный квест (все) | 1 | еженедельно |
| ToA Normal 100 | 1 | ежемесячно |
| ToA Hard 100 | 1 | ежемесячно |
| LP Shop | 1 за 3000 LP | ~2/месяц |
| Guild Shop | 1 за 1000 GP | 1/неделя |
| **Итого** | **~8-10/месяц** |

**Максимизация скиллов:**
- 1 монстр = 7 Devilmon (если все 3 скилла по 2-3 ups)
- Время на полный skillup: ~1 месяц
- Приоритет: SSR → SR support → SR DD

---

## 4. Система Рун

### 4.1 Получение Рун

**Drop rates по этажам:**
| Dungeon | Floor | Drop Rate | Stars |
|---------|-------|-----------|-------|
| Giants | B1-B3 | 40% | 3-4★ |
| Giants | B4-B6 | 55% | 4-5★ |
| Giants | B7-B9 | 70% | 5★ |
| Giants | B10 | 85% | 5-6★ |
| Dragons | B10 | 85% | 5-6★ |
| Necro | B10 | 85% | 5-6★ |

**Время на сбор полного сета (6 рун):**
- B10 с 85% drop rate: ~7-8 runs в среднем
- С учётом качества (нужные main stats): ~50-100 runs
- **Реалистичное время: 3-5 дней активного фарма**

### 4.2 Апгрейд Рун

**НОВАЯ система успеха:**
| Level | Cost | Success Rate | Avg Attempts | Avg Cost |
|-------|------|--------------|--------------|----------|
| +1 | 1,000 | 100% | 1 | 1,000 |
| +2 | 1,200 | 100% | 1 | 1,200 |
| +3 | 1,500 | 100% | 1 | 1,500 |
| +4 | 2,000 | 95% | 1.05 | 2,100 |
| +5 | 2,500 | 90% | 1.11 | 2,775 |
| +6 | 3,000 | 85% | 1.18 | 3,540 |
| +7 | 4,000 | 80% | 1.25 | 5,000 |
| +8 | 5,000 | 75% | 1.33 | 6,650 |
| +9 | 6,000 | 70% | 1.43 | 8,580 |
| +10 | 8,000 | 60% | 1.67 | 13,360 |
| +11 | 10,000 | 50% | 2.00 | 20,000 |
| +12 | 15,000 | 40% | 2.50 | 37,500 |
| +13 | 20,000 | 35% | 2.86 | 57,200 |
| +14 | 25,000 | 30% | 3.33 | 83,250 |
| +15 | 30,000 | 25% | 4.00 | 120,000 |

**Средняя стоимость +15 руны: ~363,000 gold**
**Полный сет 6 рун до +15: ~2.2M gold**
**Время фарма: ~3-4 недели**

### 4.3 Качество Рун

**Rarity distribution:**
| Rarity | Drop Rate | Sub-stats |
|--------|-----------|-----------|
| Common | 50% | 0 |
| Magic | 30% | 1 |
| Rare | 15% | 2 |
| Hero | 4% | 3 |
| Legend | 1% | 4 |

**НОВОЕ: Rune Crafting**
Позволяет переделать плохие руны:
- 5 Common → 1 Magic (5,000 gold)
- 3 Magic → 1 Rare (10,000 gold)
- 3 Rare → 1 Hero (30,000 gold)
- 5 Hero → 1 Legend (100,000 gold)

---

## 5. Контент и Награды

### 5.1 Кампания

**Структура:**
- 5 регионов × 7 стейджей = 35 стейджей
- 3 сложности: Normal, Hard, Hell

**Награды за первое прохождение:**
| Сложность | Crystals | Gold | EXP |
|-----------|----------|------|-----|
| Normal | 3-5 | 500-1000 | 200-500 |
| Hard | 5-10 | 1000-2000 | 500-1000 |
| Hell | 10-20 | 2000-5000 | 1000-2500 |

**Repeat награды:**
- Масштабируются с прогрессом
- Boss стейджи дают +50% rewards

### 5.2 Подземелья (Dungeons)

**Giants Keep (Руны: Energy, Fatal, Blade, Swift)**
| Floor | Energy | Gold | EXP | Rune Drop |
|-------|--------|------|-----|-----------|
| B1 | 4 | 1,200 | 600 | 40% (3-4★) |
| B5 | 5 | 2,500 | 1,200 | 55% (4-5★) |
| B10 | 6 | 4,500 | 2,000 | 85% (5-6★) |

**Dragons Lair (Руны: Violent, Revenge, Focus, Guard)**
- Unlock: Clear Giants B10
- Аналогичная структура, +10% к наградам

**Necropolis (Руны: Will, Vampire, Nemesis, Destroy)**
- Unlock: Clear Dragons B10
- Аналогичная структура, +20% к наградам

### 5.3 Trial of Ascension (ToA)

**Особенности:**
- 100 этажей Normal + 100 Hard
- **Бесплатно** (0 энергии)
- Сбрасывается 1 числа каждого месяца

**Награды за вехи:**
| Floor | Normal | Hard |
|-------|--------|------|
| 10 | 50 Crystals | 100 Crystals |
| 20 | Summon Scroll ×3 | Summon Scroll ×5 |
| 30 | Mystical Scroll | L&D Scroll |
| 40 | 100 Crystals | 200 Crystals |
| 50 | Devilmon | Devilmon |
| 60 | Mystical Scroll ×2 | Legendary Scroll |
| 70 | 150 Crystals | 300 Crystals |
| 80 | Mystical Scroll ×3 | L&D Scroll ×2 |
| 90 | 200 Crystals | 500 Crystals |
| 100 | Legendary Scroll + Devilmon | L&D Scroll + Devilmon ×2 |

### 5.4 Arena

**Ранги и награды:**
| Rank | Weekly Crystals | Glory Points |
|------|-----------------|--------------|
| Bronze | 50 | 100 |
| Silver | 100 | 200 |
| Gold | 200 | 350 |
| Platinum | 350 | 500 |
| Champion | 500 | 750 |
| Legend | 800 | 1000 |

**Glory Shop:**
- Devilmon: 1000 GP (1/неделя)
- Mysterious Plant (energy gen): 300 GP
- Scrolls: 150-500 GP

---

## 6. Временные Рамки Прогрессии

### 6.1 Новый Игрок (Неделя 1-2)

**Цели:**
- Пройти Normal Campaign до региона 3
- Собрать стартовую команду 4-5 монстров
- Начать Giants B1-B3
- Понять системы игры

**Ожидаемый прогресс:**
- Уровень игрока: 15-25
- Монстры: 3-4★, уровни 20-30
- Руны: 3-4★, +6-9
- Кристаллы накоплены: 500-800

### 6.2 Ранний Mid-Game (Неделя 3-6)

**Цели:**
- Clear Giants B7-B10
- Первый 6★ монстр
- ToA Normal до 50 этажа
- Arena Silver/Gold

**Ожидаемый прогресс:**
- Уровень игрока: 30-45
- Монстры: 1-2 на 6★, остальные 5★
- Руны: 4-5★, +12
- Первый SSR (из pity)

### 6.3 Mid-Game (Месяц 2-3)

**Цели:**
- Clear Dragons B10
- ToA Normal 100
- ToA Hard до 50
- 3-4 монстра на 6★
- Arena Gold/Platinum

**Ожидаемый прогресс:**
- Уровень игрока: 50-65
- Руны: 5-6★ sets, +12-15
- 2-3 SSR монстра
- Начало awakening nat 5★

### 6.4 Late Mid-Game (Месяц 4-6)

**Цели:**
- Necropolis B10
- ToA Hard 100
- Rift farming
- 6-8 монстров на 6★
- Arena Champion

### 6.5 End-Game (6+ месяцев)

**Цели:**
- Оптимизация рун (+15 Legend)
- Коллекционирование SSR
- Guild content
- Arena Legend
- Speed teams для фарма

---

## 7. Монетизация через Лояльность

### 7.1 Почему игроки посещают ресторан

| Причина | Reward | Ценность |
|---------|--------|----------|
| Ежедневная энергия | 50 Energy | ~30 мин игры |
| LP за чек | 100-500 LP | 0.5-2.5 pulls |
| Streak бонусы | Scrolls | Шанс на SSR |
| VIP статус | Перманентные бонусы | Преимущество |
| Эксклюзивы | Уникальные монстры | Коллекционирование |

### 7.2 Retention Loop

```
Игрок хочет SSR монстра
    ↓
Нужны кристаллы/scrolls
    ↓
LP дают scrolls дешевле
    ↓
LP получаются в ресторане
    ↓
Посещение ресторана
    ↓
Еда + игровые награды
    ↓
Прогресс в игре
    ↓
Хочется больше прогресса
    ↓
(цикл повторяется)
```

### 7.3 Баланс F2P vs Посетители

| Метрика | F2P | Посетитель (1 раз/нед) | Частый (3+ раз/нед) |
|---------|-----|------------------------|---------------------|
| Energy/день | 480 | 530 (+50) | 630 (+150) |
| Crystals/неделя | 680 | 830 | 1030 |
| Pulls/неделя | 22 | 27 | 34 |
| SSR/месяц | 1.5 | 2 | 2.5 |
| Time to 6★ | 2 недели | 1.5 недели | 1 неделя |

**Принцип:** Посетители прогрессируют на 30-50% быстрее, но F2P могут достичь всего того же со временем.

---

## 8. Итоговые Параметры Баланса

### 8.1 Daily Caps (Дневные лимиты)

| Ресурс | F2P Cap | С рестораном |
|--------|---------|--------------|
| Energy | ~480 | ~630 |
| Gold | ~75,000 | ~95,000 |
| Crystals | ~50 | ~100 |
| Arena Wings | 10 | 10 |
| Guild Battles | 3 | 3 |
| Free Summons | 1 | 1 |

### 8.2 Weekly Progress

| Метрика | Target |
|---------|--------|
| Dungeon runs | 100-150 |
| Campaign runs | 50-100 |
| Arena battles | 70 |
| ToA floors | 30-50 |
| Monster levels gained | 50-100 |
| Rune upgrades | 20-30 |
| Summons | 25-35 |

### 8.3 Monthly Milestones

| Месяц | Milestone |
|-------|-----------|
| 1 | First 6★, Giants B10, ToA 50 |
| 2 | Second 6★, Dragons B10, ToA 100 |
| 3 | Third-Fourth 6★, Necro B10, ToA Hard 50 |
| 4 | Fifth-Sixth 6★, Rift farming, Arena Platinum |
| 6 | Full 6★ team, ToA Hard 100, Speed teams |

---

## 9. Формулы для Реализации

### 9.1 Experience Formula

```typescript
function getExpForLevel(level: number, stars: number): number {
  const baseExp = 100;
  const starMultiplier = 1 + (stars - 1) * 0.15;
  return Math.floor(baseExp * level * starMultiplier);
}

function getTotalExpForMaxLevel(stars: number): number {
  const maxLevels = { 1: 15, 2: 20, 3: 25, 4: 30, 5: 35, 6: 40 };
  let total = 0;
  for (let i = 1; i <= maxLevels[stars]; i++) {
    total += getExpForLevel(i, stars);
  }
  return total;
}
```

### 9.2 Energy Formula

```typescript
const ENERGY_CONFIG = {
  baseMax: 60,
  regenMinutes: 3,
  vipBonuses: {
    bronze: 0,
    silver: 10,
    gold: 25,
    platinum: 50,
    diamond: 100,
  },
  restaurantBonus: 50, // per visit
  maxVisitsPerDay: 1,
};

function getMaxEnergy(vipLevel: string, playerLevel: number): number {
  const levelBonus = Math.floor(playerLevel / 10) * 5;
  return ENERGY_CONFIG.baseMax + ENERGY_CONFIG.vipBonuses[vipLevel] + levelBonus;
}
```

### 9.3 Loyalty Points Formula

```typescript
const LP_CONFIG = {
  visitBonus: 50,
  checkBonuses: [
    { min: 0, max: 500, lp: 100 },
    { min: 500, max: 1500, lp: 250 },
    { min: 1500, max: Infinity, lp: 500 },
  ],
  streakMultipliers: {
    2: 1.1,
    3: 1.2,
    5: 1.3,
    7: 1.5,
  },
  vipMultipliers: {
    bronze: 1.0,
    silver: 1.1,
    gold: 1.25,
    platinum: 1.5,
    diamond: 2.0,
  },
};

function calculateLP(checkAmount: number, streak: number, vipLevel: string): number {
  let baseLp = LP_CONFIG.visitBonus;

  for (const tier of LP_CONFIG.checkBonuses) {
    if (checkAmount >= tier.min && checkAmount < tier.max) {
      baseLp += tier.lp;
      break;
    }
  }

  const streakMult = LP_CONFIG.streakMultipliers[streak] || 1;
  const vipMult = LP_CONFIG.vipMultipliers[vipLevel];

  return Math.floor(baseLp * streakMult * vipMult);
}
```

### 9.4 Rune Upgrade Formula

```typescript
const RUNE_UPGRADE_CONFIG = {
  costs: [1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10000, 15000, 20000, 25000, 30000],
  successRates: [1.0, 1.0, 1.0, 0.95, 0.90, 0.85, 0.80, 0.75, 0.70, 0.60, 0.50, 0.40, 0.35, 0.30, 0.25],
};

function getUpgradeCost(currentLevel: number): number {
  return RUNE_UPGRADE_CONFIG.costs[currentLevel] || 30000;
}

function getSuccessRate(currentLevel: number): number {
  return RUNE_UPGRADE_CONFIG.successRates[currentLevel] || 0.25;
}
```

---

## 10. Следующие Шаги Реализации

### Приоритет 1: Loyalty Integration
1. Создать LoyaltyStore (LP, VIP level, visit streak)
2. Добавить LP Shop UI
3. Интегрировать QR код сканирование
4. Реализовать VIP систему

### Приоритет 2: Балансировка
1. Обновить энергетическую систему (3 мин/energy)
2. Переработать стоимость эволюции
3. Добавить Rainbowmon систему
4. Улучшить rune crafting

### Приоритет 3: Контент
1. Добавить ToA Hard
2. Реализовать Guild систему
3. Добавить еженедельные ивенты
4. Эксклюзивные монстры для VIP

---

*Документ создан: 2024-12-27*
*Версия: 1.0*
