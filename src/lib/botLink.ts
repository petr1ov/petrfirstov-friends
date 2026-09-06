export type FunnelTemp = "cold" | "warm" | "hot" | "club" | "partner";

const BOT = "https://t.me/PetrFirstovBot";

/**
 * Ссылка в бота с указанием «температуры» и блока сайта,
 * из которого пришёл человек. Бот подставит релевантный сценарий.
 */
export const botLink = (temp: FunnelTemp, block: string) => `${BOT}?start=${temp}_${block}`;
