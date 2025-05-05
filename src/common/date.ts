import { DateTime, Duration } from 'luxon'

/**
 * 检查给定的时间是否已过期
 * @param datetime - 要检查的 Luxon DateTime 对象
 * @param durationSecond - 过期阈值（秒数）
 * @returns {boolean} 如果当前时间超过给定时间加上持续时间则返回 true，否则返回 false
 * @example
 * const pastDate = DateTime.utc(2020, 1, 1);
 * isExpired(pastDate, 3600); // 如果当前时间超过 2020-01-01 1小时则返回 true
 */
export function isExpired(datetime: DateTime, durationSecond: number): boolean {
    return DateTime.now().diff(datetime).valueOf() > durationSecond * 1000
}

/**
 * 获取当前 UTC 时间的 ISO 字符串
 * @returns {string} 当前 UTC 时间的 ISO 8601 格式字符串（如 "2023-05-15T12:34:56.789Z"）
 * @example
 * const utcString = getCurrentUtcString(); // 返回 "2023-05-15T12:34:56.789Z"
 */
export function getCurrentUtcString(): string {
    return toISO(getCurrentUtcDateTime())
}

/**
 * 获取当前 UTC 时间的 DateTime 对象
 * @returns {DateTime} 当前 UTC 时间的 Luxon DateTime 对象
 * @example
 * const now = getCurrentUtcDateTime();
 * now.toISO(); // 返回 "2023-05-15T12:34:56.789Z"
 */
export function getCurrentUtcDateTime(): DateTime {
    return DateTime.utc()
}

/**
 * 将 DateTime 对象转换为 UTC 时区
 * @param datetime - 要转换的 DateTime 对象
 * @returns {DateTime} 转换到 UTC 时区的新 DateTime 对象
 * @example
 * const localTime = DateTime.local();
 * const utcTime = convertToUtcDateTime(localTime);
 */
export function convertToUtcDateTime(datetime: DateTime): DateTime {
    return datetime.toUTC()
}

/**
 * 按照指定格式格式化 DateTime 对象
 * @param datetime - 要格式化的 DateTime 对象
 * @param format - 格式化字符串（参考 Luxon 的格式说明）
 * @returns {string} 格式化后的日期字符串
 * @example
 * const dt = DateTime.utc();
 * formatDateTime(dt, "yyyy-MM-dd"); // 返回 "2023-05-15"
 */
export function formatDateTime(datetime: DateTime, format: string): string {
    return datetime.toFormat(format)
}

/**
 * 从字符串解析 DateTime 对象
 * @param s - 要解析的日期字符串
 * @param format - 日期字符串的格式（参考 Luxon 的格式说明）
 * @returns {DateTime} 解析后的 DateTime 对象
 * @throws {Error} 如果字符串无法解析则抛出错误
 * @example
 * const dt = parseDateTime("2023-05-15", "yyyy-MM-dd");
 */
export function parseDateTime(s: string, format: string): DateTime {
    return DateTime.fromFormat(s, format)
}

/**
 * 将 DateTime 对象转换为 ISO 字符串
 * @param datetime - 要转换的 DateTime 对象
 * @returns {string} ISO 8601 格式的字符串表示
 * @example
 * const dt = DateTime.utc();
 * const isoString = toISO(dt); // 返回 "2023-05-15T12:34:56.789Z"
 */
export function toISO(datetime: DateTime): string {
    const s = datetime.toISO()
    return s === null ? '' : s
}

/**
 * 从 ISO 字符串创建 DateTime 对象
 * @param s - ISO 8601 格式的日期字符串
 * @returns {DateTime} 解析后的 DateTime 对象
 * @throws {Error} 如果字符串无法解析则抛出错误
 * @example
 * const dt = fromISO("2023-05-15T12:34:56.789Z");
 */
export function fromISO(s: string): DateTime {
    return DateTime.fromISO(s)
}

/**
 * 将 Luxon DateTime 对象转换为 JavaScript Date 对象
 * @param datetime - 要转换的 Luxon DateTime 对象
 * @returns {Date} 等效的 JavaScript Date 对象
 * @example
 * const luxonDate = DateTime.utc();
 * const jsDate = convertDateTimeToDate(luxonDate);
 */
export function convertDateTimeToDate(datetime: DateTime): Date {
    return datetime.toJSDate()
}

/**
 * 将 JavaScript Date 对象转换为 Luxon DateTime 对象
 * @param date - 要转换的 JavaScript Date 对象
 * @returns {DateTime} 等效的 Luxon DateTime 对象
 * @example
 * const jsDate = new Date();
 * const luxonDate = convertDateToDateTime(jsDate);
 */
export function convertDateToDateTime(date: Date): DateTime {
    return DateTime.fromJSDate(date)
}

/**
 * 将 DateTime 对象转换为本地时区
 * @param datetime - 要转换的 DateTime 对象（假定为 UTC 时间）
 * @returns {DateTime} 转换到本地时区的新 DateTime 对象
 * @example
 * const utcDate = DateTime.utc();
 * const localDate = convertDateTimeToLocal(utcDate);
 */
export function convertDateTimeToLocal(datetime: DateTime): DateTime {
    return datetime.toLocal()
}

/**
 * 向 DateTime 对象添加指定的秒数
 * @param datetime - 原始 DateTime 对象
 * @param seconds - 要添加的秒数
 * @returns {DateTime} 添加秒数后的新 DateTime 对象
 * @example
 * const now = DateTime.utc();
 * const future = plusSecond(now, 3600); // 添加 1 小时（3600 秒）
 */
export function plusSecond(datetime: DateTime, seconds: number): DateTime {
    return datetime.plus(Duration.fromObject({ seconds: seconds }))
}