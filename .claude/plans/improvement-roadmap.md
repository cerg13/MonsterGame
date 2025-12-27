# Monster Battle - План улучшений и развития

## Статус: В разработке
**Последнее обновление:** 2025-12-27

---

## Раздел 1: Backend Persistence (Серверная персистентность)

### Статус: ⏳ Не начато

### Описание
Текущее состояние: все данные хранятся только в localStorage на клиенте. Серверные модели базы данных пустые. Необходимо реализовать полноценное хранение данных в PostgreSQL.

### Функциональность

#### 1.1 Модель Player (Игрок)
```
Поля:
- id: UUID (первичный ключ)
- username: string (уникальный)
- email: string (уникальный)
- passwordHash: string
- level: number (1-100)
- experience: number
- crystals: number (премиум валюта)
- gold: number (основная валюта)
- energy: number (0-100)
- maxEnergy: number
- arenaTickets: number
- lastEnergyRefresh: timestamp
- lastLogin: timestamp
- createdAt: timestamp
- updatedAt: timestamp

Связи:
- hasMany: PlayerMonster
- hasMany: PlayerRune
- hasMany: PlayerAchievement
- hasMany: PlayerQuest
- belongsTo: Guild (nullable)
```

#### 1.2 Модель Monster (Шаблон монстра)
```
Поля:
- id: string (например 'phoenix_fire')
- name: string
- element: enum ('fire', 'water', 'wind', 'light', 'dark')
- rarity: enum ('common', 'rare', 'sr', 'ssr')
- baseHp: number
- baseAtk: number
- baseDef: number
- baseSpd: number
- baseCritRate: number
- baseCritDmg: number
- baseAccuracy: number
- baseResistance: number
- skillIds: string[] (ссылки на навыки)
- awakenedForm: string (nullable, ссылка на пробуждённую форму)
```

#### 1.3 Модель PlayerMonster (Монстр игрока)
```
Поля:
- id: UUID
- playerId: UUID (внешний ключ)
- monsterId: string (ссылка на шаблон)
- level: number (1-40)
- stars: number (1-6)
- experience: number
- awakened: boolean
- skillLevels: JSON {skill1: 1-15, skill2: 1-15, skill3: 1-15}
- equippedRunes: JSON {slot1: runeId, slot2: runeId, ...}
- locked: boolean (защита от продажи)
- inStorage: boolean
- obtainedAt: timestamp

Связи:
- belongsTo: Player
- belongsTo: Monster (template)
```

#### 1.4 Модель Rune (Руна)
```
Поля:
- id: UUID
- playerId: UUID
- set: enum ('energy', 'fatal', 'blade', 'swift', 'focus', 'guard', 'endure', 'violent', 'will', 'despair', 'vampire', 'rage')
- slot: number (1-6)
- stars: number (1-6)
- level: number (0-15)
- mainStat: JSON {type: string, value: number}
- subStats: JSON [{type: string, value: number, upgrades: number}]
- innateSubStat: JSON (nullable)
- equippedTo: UUID (nullable, ссылка на PlayerMonster)
- locked: boolean
- obtainedAt: timestamp

Главные статы по слотам:
- Слот 1: ATK (только плоский)
- Слот 2: ATK, ATK%, DEF, DEF%, HP, HP%, SPD
- Слот 3: DEF (только плоский)
- Слот 4: ATK, ATK%, DEF, DEF%, HP, HP%, CRIT Rate, CRIT Dmg
- Слот 5: HP (только плоский)
- Слот 6: ATK, ATK%, DEF, DEF%, HP, HP%, Accuracy, Resistance
```

#### 1.5 Модель Achievement (Достижение)
```
Поля:
- id: string (например 'first_summon')
- category: enum ('combat', 'collection', 'progression', 'social')
- tier: number (1-5, для многоуровневых)
- requirement: number (целевое значение)
- rewards: JSON {crystals: number, gold: number, items: [...]}

PlayerAchievement (связующая):
- playerId: UUID
- achievementId: string
- progress: number
- completed: boolean
- claimed: boolean
- completedAt: timestamp
```

#### 1.6 Модель Quest (Квест)
```
Поля:
- id: string
- type: enum ('daily', 'weekly', 'story')
- requirement: JSON {action: string, target: number, conditions: {...}}
- rewards: JSON
- order: number (для story)

PlayerQuest:
- playerId: UUID
- questId: string
- progress: number
- completed: boolean
- claimed: boolean
- resetAt: timestamp (для daily/weekly)
```

#### 1.7 Модель Guild (Гильдия)
```
Поля:
- id: UUID
- name: string (уникальный)
- description: string
- leaderId: UUID
- level: number (1-30)
- experience: number
- maxMembers: number (20-50 в зависимости от уровня)
- warWins: number
- warLosses: number
- createdAt: timestamp

GuildMember:
- guildId: UUID
- playerId: UUID
- role: enum ('leader', 'vice_leader', 'member')
- contribution: number
- joinedAt: timestamp
```

### Файлы для создания
- [ ] `monster-battle-server/src/models/Player.ts`
- [ ] `monster-battle-server/src/models/Monster.ts`
- [ ] `monster-battle-server/src/models/PlayerMonster.ts`
- [ ] `monster-battle-server/src/models/Rune.ts`
- [ ] `monster-battle-server/src/models/Achievement.ts`
- [ ] `monster-battle-server/src/models/Quest.ts`
- [ ] `monster-battle-server/src/models/Guild.ts`
- [ ] `monster-battle-server/src/models/index.ts`
- [ ] `monster-battle-server/src/migrations/` (миграции)

### API Endpoints
- [ ] `POST /api/v1/player/sync` - синхронизация данных
- [ ] `GET /api/v1/player/monsters` - список монстров
- [ ] `POST /api/v1/player/monsters/:id/level-up` - повышение уровня
- [ ] `GET /api/v1/player/runes` - список рун
- [ ] `POST /api/v1/player/runes/equip` - экипировка руны
- [ ] `GET /api/v1/achievements` - все достижения
- [ ] `POST /api/v1/achievements/:id/claim` - получить награду

---

## Раздел 2: Monster Idle Animations (Анимации покоя монстров)

### Статус: ⏳ Не начато

### Описание
Монстры на поле боя должны выглядеть "живыми" даже когда ничего не происходит. Это создаёт ощущение полноценной игры и улучшает визуальное восприятие.

### Функциональность

#### 2.1 Floating Animation (Парение)
```typescript
Параметры:
- amplitude: 3-5 пикселей (амплитуда покачивания)
- frequency: 2-3 секунды (период полного цикла)
- phase: random (начальная фаза для каждого монстра)

Формула движения:
y = baseY + sin(time * frequency + phase) * amplitude

Особенности по редкости:
- Common: amplitude=3, frequency=3s (медленное, слабое)
- Rare: amplitude=4, frequency=2.5s
- SR: amplitude=4, frequency=2s
- SSR: amplitude=5, frequency=1.8s (быстрое, заметное)
```

#### 2.2 Breathing Effect (Эффект дыхания)
```typescript
Параметры:
- scaleMin: 0.98 (минимальный масштаб)
- scaleMax: 1.02 (максимальный масштаб)
- duration: 2-4 секунды (вдох-выдох)

Реализация:
scale = lerp(scaleMin, scaleMax, (sin(time * speed) + 1) / 2)

Применение: только к корпусу, не к элементам UI
```

#### 2.3 Eye Blink (Моргание)
```typescript
Параметры:
- blinkInterval: 3-7 секунд (случайный интервал)
- blinkDuration: 150ms (длительность моргания)
- doubleBlink: 20% шанс двойного моргания

Последовательность:
1. Ожидание (случайный интервал)
2. Закрытие глаз (50ms)
3. Удержание (50ms)
4. Открытие глаз (50ms)
5. [Если double] Повтор через 200ms
```

#### 2.4 Элементальные эффекты покоя
```typescript
Fire monsters:
- Мерцающее пламя вокруг (частицы)
- Лёгкое оранжевое свечение
- Искры периодически

Water monsters:
- Капли воды поднимаются вверх
- Голубоватый отблеск
- Волнистая аура

Wind monsters:
- Вращающиеся листья/лепестки
- Зелёные искры
- Колыхание (более выраженное floating)

Light monsters:
- Золотистое свечение
- Периодические вспышки
- Звёздочки вокруг

Dark monsters:
- Теневая аура
- Частицы тьмы
- Пульсирующее затемнение по краям
```

### Файлы для изменения
- [ ] `monster-battle-client/src/components/battle/MonsterSprite.ts`
  - Добавить методы анимации покоя
  - Интегрировать с PixiJS ticker
- [ ] `monster-battle-client/src/utils/animations.ts`
  - Добавить функции idle-анимаций
  - Создать генераторы частиц для элементов
- [ ] `monster-battle-client/src/components/battle/BattleStage.tsx`
  - Запуск idle-анимаций для всех монстров
  - Управление производительностью

### Технические требования
- FPS: поддержка 60fps без падения производительности
- Memory: переиспользование объектов частиц (object pooling)
- Отключение: возможность выключить в настройках для слабых устройств

---

## Раздел 3: Status Effect Visuals (Визуализация статус-эффектов)

### Статус: ⏳ Не начато

### Описание
Каждый статус-эффект в бою должен иметь уникальную визуальную индикацию, чтобы игрок мог быстро оценить состояние монстров.

### Функциональность

#### 3.1 Freeze (Заморозка)
```typescript
Визуальные элементы:
- Голубой/белый оттенок на спрайте (tint: 0x88CCFF)
- Ледяные кристаллы вокруг монстра (6-8 штук)
- Морозные частицы падают вниз
- Лёгкое дрожание (замёрзший)
- Прозрачность 80%

Звуковое сопровождение:
- При наложении: звук замерзания
- Во время: тихий треск льда

Снятие эффекта:
- Кристаллы разбиваются
- Вспышка синего света
- Частицы разлетаются
```

#### 3.2 Stun (Оглушение)
```typescript
Визуальные элементы:
- Звёзды кружатся над головой (3-5 штук)
- Жёлтый цвет звёзд с белым свечением
- Спираль вращения
- Монстр слегка покачивается
- Иконка звёздочек над HP-баром

Анимация звёзд:
- Радиус орбиты: 30-40px
- Скорость вращения: 1 оборот за 1.5s
- Вертикальное колебание: ±5px
```

#### 3.3 Burn (Горение)
```typescript
Визуальные элементы:
- Оранжево-красный tint (0xFF6644)
- Языки пламени на теле (частицы огня)
- Дым поднимается вверх
- Периодические вспышки ярче
- Искры отлетают

Урон от горения:
- При каждом тике: красная вспышка
- Число урона с иконкой огня
- Экран слегка краснеет
```

#### 3.4 Poison (Отравление)
```typescript
Визуальные элементы:
- Зелёный tint (0x66FF66)
- Пузырьки яда поднимаются вверх
- Капли яда стекают вниз
- Пульсирующее зелёное свечение
- Черепа в частицах (редко)

Урон от яда:
- Зелёные числа урона
- Булькающий звук
- Зелёная вспышка
```

#### 3.5 Sleep (Сон)
```typescript
Визуальные элементы:
- Буквы "Z" плавают вверх (3 размера)
- Глаза закрыты (если есть анимация)
- Голова наклонена
- Замедленное дыхание
- Лёгкое затемнение

Анимация "Z":
- Появление: каждые 1.5s новая буква
- Движение: вверх и вправо по дуге
- Размер: маленькая → средняя → большая
- Исчезание: fade out за 2s
```

#### 3.6 Silence (Безмолвие)
```typescript
Визуальные элементы:
- Символ "X" над ртом
- Фиолетовые цепи вокруг
- Приглушённые цвета (saturation -30%)
- Иконка перечёркнутого навыка
```

#### 3.7 Defense Break (Пробитие защиты)
```typescript
Визуальные элементы:
- Красные трещины на теле
- Разбитый щит над монстром
- Красноватое мерцание
- Частицы осколков
```

#### 3.8 Attack Break (Ослабление атаки)
```typescript
Визуальные элементы:
- Тусклое оружие/когти
- Серый оттенок на атакующих частях
- Опущенные плечи (поза)
- Сломанный меч иконка
```

#### 3.9 Speed Buff/Debuff
```typescript
Speed Up:
- Зелёные стрелки вверх
- Зелёное свечение под ногами
- Размытие движения (motion blur)
- Частицы скорости

Speed Down:
- Красные стрелки вниз
- Тяжёлые цепи/гири
- Замедленные движения
- Серая аура
```

#### 3.10 Immunity/Invincibility
```typescript
Immunity:
- Золотой щит вокруг
- Святое свечение
- Отражающая поверхность

Invincibility:
- Полупрозрачность
- Радужные переливы
- Звёздная пыль
```

### Файлы для создания/изменения
- [ ] `monster-battle-client/src/utils/statusEffects.ts` (новый)
- [ ] `monster-battle-client/src/components/battle/StatusEffectRenderer.ts` (новый)
- [ ] `monster-battle-client/src/utils/animations.ts` (расширение)
- [ ] `monster-battle-client/src/components/battle/BattleStage.tsx`

---

## Раздел 4: Element Attack Effects (Элементальные эффекты атак)

### Статус: ⏳ Не начато

### Описание
Каждая стихия должна иметь уникальные визуальные эффекты при атаках, создавая разнообразие и улучшая читаемость боя.

### Функциональность

#### 4.1 Fire (Огонь)
```typescript
Projectile (снаряд):
- Огненный шар с хвостом
- Искры отлетают по траектории
- Тепловое искажение воздуха
- Цвета: оранжевый → жёлтый центр

Impact (попадание):
- Взрыв пламени
- Огненные волны расходятся
- Чёрный дым
- Тряска экрана (лёгкая)
- Угольки разлетаются

Charge (зарядка):
- Огонь собирается к монстру
- Аура накаливания
- Земля под ногами светится
```

#### 4.2 Water (Вода)
```typescript
Projectile:
- Водяной поток/волна
- Пузырьки внутри
- Отражения света
- Голубой с белыми бликами

Impact:
- Всплеск воды
- Капли разлетаются
- Волны на "полу"
- Туман/брызги

Charge:
- Водоворот вокруг монстра
- Поднимающиеся капли
- Голубое свечение
```

#### 4.3 Wind (Ветер)
```typescript
Projectile:
- Спиральный вихрь
- Листья/лепестки внутри
- Воздушные потоки (линии)
- Зелёно-белые цвета

Impact:
- Торнадо на месте удара
- Листья разлетаются
- Пыль поднимается
- Режущие полосы воздуха

Charge:
- Ветер кружит вокруг
- Волосы/элементы развеваются
- Зелёные искры
```

#### 4.4 Light (Свет)
```typescript
Projectile:
- Луч света/святая стрела
- Звёздная пыль за ним
- Золотисто-белый цвет
- Ослепительное сияние

Impact:
- Взрыв света
- Лучи во все стороны
- Звёзды появляются
- Белая вспышка экрана

Charge:
- Нимб над головой
- Лучи сходятся к монстру
- Святые символы
```

#### 4.5 Dark (Тьма)
```typescript
Projectile:
- Теневой сгусток
- Тёмные щупальца
- Поглощение света вокруг
- Фиолетово-чёрный

Impact:
- Взрыв тьмы
- Тени расползаются
- Трещины в реальности
- Затемнение экрана

Charge:
- Тёмная аура поглощает свет
- Глаза светятся
- Теневые руки поднимаются
```

#### 4.6 Универсальные эффекты
```typescript
Critical Hit:
- Увеличенный эффект (scale 1.5x)
- Дополнительная вспышка
- "CRITICAL" текст
- Усиленная тряска

Elemental Advantage:
- Особый звук попадания
- "EFFECTIVE!" текст
- Элементальный символ при ударе

Miss/Glancing:
- Уменьшенный эффект
- Серый оттенок
- "MISS" / "GLANCING" текст
```

### Файлы для изменения
- [ ] `monster-battle-client/src/utils/animations.ts`
  - `createElementalProjectile(element, start, end)`
  - `createElementalImpact(element, position, isCrit)`
  - `createElementalCharge(element, monster)`
- [ ] `monster-battle-client/src/components/battle/BattleStage.tsx`
  - Интеграция элементальных эффектов в боевой цикл

---

## Раздел 5: Dungeon System (Система подземелий)

### Статус: ⏳ Не начато

### Описание
Расширение PvE контента с различными типами подземелий, каждое со своими механиками и наградами.

### Функциональность

#### 5.1 Giants Keep (Замок Гигантов)
```typescript
Этажи: B1 - B10
Босс: Гигантский Голем

Механики:
- Контратака босса при критическом ударе
- AoE удар каждые 3 хода
- Башни поддержки (нужно убить первыми)
- Enrage после 50% HP

Награды:
- Сеты рун: Energy, Fatal, Blade, Swift
- Золото: 5000-15000 за этаж
- Шанс 6* руны: 2% на B10

Рекомендации:
- B1-B6: любая команда
- B7-B9: нужны дебаффы, лечение
- B10: speed-команда или sustain
```

#### 5.2 Dragons Lair (Логово Дракона)
```typescript
Этажи: B1 - B10
Босс: Огненный Дракон

Механики:
- Иммунитет к дебаффам (до снятия башнями)
- DoT эффекты (горение)
- Левая башня: снимает баффы врагов
- Правая башня: накладывает иммунитет на босса
- Rage-режим при 30% HP

Награды:
- Сеты рун: Violent, Revenge, Focus, Guard
- Больше золота чем Giants
- Шанс 6* руны: 2.5% на B10
```

#### 5.3 Necropolis (Некрополис)
```typescript
Этажи: B1 - B10
Босс: Лич-Король

Механики:
- Захват монстра (переходит на сторону босса)
- Multi-hit атаки наносят больше урона
- Босс воскрешает миньонов
- Щит из поглощённых душ

Награды:
- Сеты рун: Will, Nemesis, Destroy, Vampire
- Редкие материалы для пробуждения
- Шанс 6* руны: 3% на B10
```

#### 5.4 Trial of Ascension (Испытание Вознесения)
```typescript
Этажей: 100 (Normal), 100 (Hard)
Сброс: ежемесячно

Особенности:
- Уникальные этажи-боссы каждые 10 уровней
- Нельзя использовать одного монстра дважды за сброс
- Специальные условия на некоторых этажах

Награды:
- Этаж 30/60/90: кристаллы
- Этаж 50/80/100: свиток призыва
- Этаж 100: легендарный свиток + деvilmon
```

#### 5.5 Rift of Worlds (Разлом Миров)
```typescript
Боссы стихий: Fire/Water/Wind/Light/Dark
Сложность: динамическая (A-SSS ранг)

Механики:
- 3 фазы боя
- Groggy-состояние босса (окно для урона)
- Элементальные щиты
- Командная синергия важна

Награды:
- Кристаллы конденсации
- Гомункулус материалы
- Ранг влияет на награды
```

### Файлы для создания
- [ ] `monster-battle-client/src/pages/DungeonSelectScreen.tsx`
- [ ] `monster-battle-client/src/pages/DungeonBattleScreen.tsx`
- [ ] `monster-battle-client/src/data/dungeons.ts`
- [ ] `monster-battle-client/src/store/useDungeonStore.ts`
- [ ] `monster-battle-server/src/services/DungeonService.ts`

---

## Раздел 6: Guild War System (Система гильд-войн)

### Статус: ⏳ Не начато

### Описание
PvP контент для гильдий с осадной механикой и еженедельными наградами.

### Функциональность

#### 6.1 Структура войны
```typescript
Расписание:
- Регистрация: Понедельник-Вторник
- Матчмейкинг: Вторник вечер
- Бои: Среда-Четверг, Пятница-Суббота
- Награды: Воскресенье

Формат:
- Гильдия выставляет защиту (10-25 команд)
- Атакующие имеют ограниченные мечи (3 за период)
- Каждая защита может быть атакована 2 раза
```

#### 6.2 Защита (Defense)
```typescript
Настройка защиты:
- Каждый участник ставит 1-2 защитных команды
- Команда = 3 монстра
- Лидер защиты выбирает расположение

Базы:
- Штаб (HQ): x3 очков, сложнее захватить
- Аванпосты: x1.5 очков
- Башни: x1 очко
```

#### 6.3 Атака (Offense)
```typescript
Механика:
- 3 меча на период войны
- Нельзя использовать монстра дважды за войну
- Победа = 2 очка, ничья = 1 очко, поражение = 0
- Бонус за первое поражение защиты (+1)

Стратегия:
- Scout перед атакой (посмотреть защиту)
- Выбор слабых защит
- Координация с гильдией
```

#### 6.4 Награды
```typescript
По рангу гильдии:
- G1 (топ 1000): 150 кристаллов + 50 gp
- G2 (топ 300): 200 кристаллов + 70 gp
- G3 (топ 100): 300 кристаллов + 100 gp
- Guardian: эксклюзивные награды

Guild Points (GP):
- За победу в войне: 6 GP
- За личные атаки: 2 GP за победу
- Магазин гильдии: ifrit pieces, rainbowmon
```

#### 6.5 UI Компоненты
```typescript
GuildWarScreen:
- Карта с базами и позициями
- Список защит противника
- Свои оставшиеся мечи
- Таблица результатов

DefenseSetup:
- Перетаскивание монстров
- Предпросмотр команды
- История атак на защиту

BattleHistory:
- Логи всех боёв
- Replay возможность
- Статистика побед/поражений
```

### Файлы для создания
- [ ] `monster-battle-client/src/pages/GuildWarScreen.tsx`
- [ ] `monster-battle-client/src/components/guild/WarMap.tsx`
- [ ] `monster-battle-client/src/components/guild/DefenseSetup.tsx`
- [ ] `monster-battle-client/src/store/useGuildWarStore.ts`
- [ ] `monster-battle-server/src/services/GuildWarService.ts`
- [ ] `monster-battle-server/src/models/GuildWar.ts`

---

## Раздел 7: Screen Transitions (Переходы между экранами)

### Статус: ⏳ Не начато

### Описание
Плавные анимированные переходы между экранами для улучшения UX.

### Функциональность

#### 7.1 Page Transitions
```css
Типы переходов:
- Slide: экран выезжает слева/справа
- Fade: плавное появление/исчезание
- Scale: масштабирование от центра
- Flip: 3D переворот

Применение:
- Главное меню → подэкран: Slide Right
- Подэкран → назад: Slide Left
- Модальные окна: Scale + Fade
- Боевой экран: специальный Zoom
```

#### 7.2 Battle Start Cinematic
```typescript
Последовательность (2-3 секунды):
1. Затемнение текущего экрана
2. "VS" анимация по центру
3. Команды выезжают с боков
4. Камера zoom-in на арену
5. Flash и начало боя

Элементы:
- Портреты монстров с подсветкой редкости
- Название локации
- Музыка меняется
```

#### 7.3 Victory/Defeat Transitions
```typescript
Victory:
- Золотое свечение расходится
- Конфетти падает
- Монстры делают victory-позу
- Плавный переход к экрану наград

Defeat:
- Экран темнеет
- Красные частицы
- Камера отдаляется
- Кнопка "Retry" с анимацией
```

### Файлы для создания/изменения
- [ ] `monster-battle-client/src/components/transitions/PageTransition.tsx`
- [ ] `monster-battle-client/src/components/transitions/BattleTransition.tsx`
- [ ] `monster-battle-client/src/styles/transitions.css`
- [ ] `monster-battle-client/src/App.tsx` (интеграция)

---

## Раздел 8: Quality of Life Features (Удобства)

### Статус: ⏳ Не начато

### Описание
Мелкие, но важные улучшения пользовательского опыта.

### Функциональность

#### 8.1 Monster Sorting & Filtering
```typescript
Сортировка:
- По уровню (↑↓)
- По редкости (↑↓)
- По элементу
- По дате получения
- По силе (Power)

Фильтры:
- Элемент (checkboxes)
- Редкость (checkboxes)
- Уровень (range slider)
- Locked/Unlocked
- In storage
- С рунами / без рун
```

#### 8.2 Rune Management
```typescript
Функции:
- Массовая продажа (выбор + продать)
- Авто-продажа по правилам
- Сохранение билдов рун
- Оптимизатор рун (подбор)
- Сравнение руны до/после апгрейда
```

#### 8.3 Batch Operations
```typescript
Монстры:
- Массовый level-up
- Массовое скармливание
- Групповая блокировка

Руны:
- Массовое улучшение
- Авто-экипировка сета
```

#### 8.4 Search & Favorites
```typescript
Поиск:
- По имени монстра
- По навыку
- По сету руны

Избранное:
- Закрепить монстров наверху
- Быстрый доступ к командам
- Сохранённые фильтры
```

### Файлы для изменения
- [ ] `monster-battle-client/src/pages/MonstersScreen.tsx`
- [ ] `monster-battle-client/src/pages/RuneScreen.tsx`
- [ ] `monster-battle-client/src/components/ui/FilterPanel.tsx` (новый)
- [ ] `monster-battle-client/src/components/ui/SearchBar.tsx` (новый)

---

## Прогресс выполнения

| Раздел | Статус | Прогресс |
|--------|--------|----------|
| 1. Backend Persistence | ✅ Готово | 100% |
| 2. Monster Idle Animations | ✅ Готово | 100% |
| 3. Status Effect Visuals | ✅ Готово | 100% |
| 4. Element Attack Effects | ✅ Готово | 100% |
| 5. Dungeon System | 🔄 В процессе | 60% |
| 6. Guild War System | ⏳ Не начато | 0% |
| 7. Screen Transitions | ✅ Готово | 100% |
| 8. QoL Features | ⏳ Не начато | 0% |

### Выполнено 2025-12-27:
- **Monster Idle Animations**: Добавлены в MonsterSprite.ts
  - Floating/bobbing (парение) с разной амплитудой по редкости
  - Breathing effect (дыхание) с пульсацией масштаба
  - Eye blink (моргание) каждые 3-7 секунд с 20% шансом двойного
  - Element particles (элементальные частицы) - огонь, вода, ветер, свет, тьма

- **Status Effect Visuals**: Уже интегрированы в BattleStage.tsx
  - createFreezeEffect, createStunEffect, createBurnEffect
  - createSleepEffect, createPoisonEffect
  - Автоматическое отображение при наличии дебаффов

- **Element Attack Effects**: Уже реализованы в animations.ts
  - createProjectile с элементальными цветами
  - createImpactEffect с масштабированием для критов
  - createCastingEffect для зарядки навыков

- **Screen Transitions**: Уже реализованы в App.css и BattleStage.css
  - Page transitions (slide, fade, zoom)
  - Battle victory/defeat с конфетти и эффектами
  - Modal animations с elastic bounce
  - List item stagger animations

- **Backend Persistence**: Созданы все модели Sequelize
  - `Player.ts` - игрок с уровнями, ресурсами, энергией
  - `Monster.ts` - шаблоны монстров (статичные данные)
  - `PlayerMonster.ts` - монстры игрока с уровнями, звёздами, навыками
  - `Rune.ts` - руны с сетами, слотами, статами, улучшениями
  - `Achievement.ts` + `PlayerAchievement.ts` - достижения и прогресс
  - `Quest.ts` + `PlayerQuest.ts` - квесты с дневными/недельными сбросами
  - `Guild.ts` + `GuildMember.ts` - гильдии с ролями и вкладом
  - `models/index.ts` - ассоциации между моделями
  - `config/database.ts` - конфигурация PostgreSQL

- **Dungeon System (частично)**:
  - ✅ `types/dungeon.ts` - типы для подземелий (DungeonType, DungeonFloor, BossMechanic, RiftGrade и др.)
  - ✅ `data/dungeons.ts` - конфигурации подземелий (Giants, Dragons, Necropolis, ToA, Rift)
    - BOSS_MECHANICS с механиками для каждого босса
    - DUNGEON_CONFIG с названиями, иконками, наградами
    - generateDungeonFloors() для генерации этажей B1-B10
    - generateToAFloors() для 100 этажей ToA
    - RIFT_BOSSES с элементальными боссами
  - ✅ `store/useDungeonStore.ts` - Zustand store для управления состоянием
    - Прогресс по подземельям, ToA, Rift
    - Auto-repeat функционал
    - Методы для продвижения и завершения
  - ✅ `pages/DungeonScreen.tsx` - UI экран выбора подземелий
    - Три вкладки: Cairos Dungeon, Trial of Ascension, Rift of Worlds
    - Выбор этажа с progress-индикаторами
    - Выбор команды для боя
  - ✅ `pages/DungeonScreen.css` - стили для экрана подземелий
  - ✅ Добавлена кнопка в MainMenu и роут в App.tsx
  - ✅ Локализация для "Подземелья" / "Dungeons"
  - ⏳ Осталось: интеграция с боевой системой, механики боссов, награды

---

## Рекомендуемый порядок реализации

1. **Monster Idle Animations** - быстрый visual impact
2. **Status Effect Visuals** - улучшает боевую читаемость
3. **Element Attack Effects** - завершает visual polish
4. **Screen Transitions** - улучшает общий UX
5. **Backend Persistence** - подготовка к production
6. **Dungeon System** - расширение контента
7. **Guild War System** - социальный контент
8. **QoL Features** - полировка

---

## Заметки

- Приоритет визуальным улучшениям, так как игра уже функциональна
- Backend можно делать параллельно с визуальными фичами
- Каждый раздел независим и может быть реализован отдельно
