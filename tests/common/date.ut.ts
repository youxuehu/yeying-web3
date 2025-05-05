import {
  convertDateTimeToDate,
  convertDateTimeToLocal,
  convertDateToDateTime,
  convertToUtcDateTime,
  fromISO,
  getCurrentUtcDateTime,
  toISO
} from "../../src/common/date"
import { DateTime } from "luxon"

describe('DateTime', () => {
  it('Utc DateTime', () => {
    const dateTime0 = getCurrentUtcDateTime()
    const str0 = toISO(dateTime0)
    console.log(`utc time=${str0}`)
    const dateTime1 = convertToUtcDateTime(fromISO(str0))
    expect(dateTime1).toStrictEqual(dateTime0)
    const dateTime2 = convertToUtcDateTime(dateTime1)
    expect(dateTime2).toStrictEqual(dateTime0)

    const str1 = '2024-07-14T20:11:23.992Z'
    // 解析为当前测试用例所在时区
    const dateTime3 = fromISO(str1)
    // 转换为UTC并ISO格式化
    expect(toISO(convertToUtcDateTime(dateTime3))).toStrictEqual(str1)
  })

  it('DateTime and Date', () => {
    // DataTime to Date
    const dateTime1 = getCurrentUtcDateTime()
    const date1 = convertDateTimeToDate(dateTime1)
    const dateTime2 = convertToUtcDateTime(convertDateToDateTime(date1))
    expect(dateTime2).toStrictEqual(dateTime1)

    // Date to DateTime
    const date2 = new Date()
    const dateTime3 = convertDateToDateTime(date2)
    const date3 = convertDateTimeToDate(dateTime3)
    expect(date3).toStrictEqual(date2)
  })

  it('Utc and Local', () => {
    const date1 = new Date()
    const dateTime1 = convertDateToDateTime(date1)
    const dateTime2 = convertDateTimeToLocal(convertToUtcDateTime(dateTime1))
    expect(dateTime2).toStrictEqual(dateTime1)
    const date2 = convertDateTimeToDate(dateTime2)
    expect(date1).toStrictEqual(date2)
  })

  it('Utc and Zone', () => {
    const str1 = '2024-07-14T20:11:23.992Z'
    const dateTime1 = fromISO(str1)
    const zone1 = 'America/New_York'
    const dateTime2 = dateTime1.setZone(zone1)
    const str2 = dateTime2.toISO()
    expect(str2).toBe('2024-07-14T16:11:23.992-04:00')
    expect(toISO(convertToUtcDateTime(dateTime2))).toBe(str1)

    const dateTime3 = fromISO(str1)
    const zone2 = 'Asia/Shanghai'
    const dateTime4 = dateTime3.setZone(zone2)
    const str3 = dateTime4.toISO()
    expect(str3).toBe('2024-07-15T04:11:23.992+08:00')
    expect(toISO(convertToUtcDateTime(dateTime4))).toBe(str1)
  })
})
