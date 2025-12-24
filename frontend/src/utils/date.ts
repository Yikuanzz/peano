/**
 * 日期处理工具函数
 */
import { startOfDay, subDays, isWithinInterval, format } from 'date-fns'
import type { ItemDTO } from '@/types/item'

// 将 items 按最近三天分组
export function groupItemsByRecentDays(items: ItemDTO[]) {
  const now = new Date()
  const todayStart = startOfDay(now)
  const yesterdayStart = subDays(todayStart, 1)
  const dayBeforeStart = subDays(todayStart, 2)

  return {
    today: items.filter(item =>
      isWithinInterval(new Date(item.created_at), {
        start: todayStart,
        end: now,
      })
    ),
    yesterday: items.filter(item =>
      isWithinInterval(new Date(item.created_at), {
        start: yesterdayStart,
        end: todayStart,
      })
    ),
    dayBeforeYesterday: items.filter(item =>
      isWithinInterval(new Date(item.created_at), {
        start: dayBeforeStart,
        end: yesterdayStart,
      })
    ),
  }
}

// 格式化日期为 YYYY-MM-DD
export function formatDate(date: Date | string): string {
  return format(new Date(date), 'yyyy-MM-dd')
}

// 格式化日期时间为 YYYY-MM-DD HH:mm:ss
export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'yyyy-MM-dd HH:mm:ss')
}

// 格式化相对时间（刚刚、5分钟前、1小时前等）
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const targetDate = new Date(date)
  const diff = now.getTime() - targetDate.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return formatDate(targetDate)
}
