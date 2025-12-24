/**
 * 本地存储工具函数
 */

// 存储键名常量
export const StorageKeys = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER_ID: "user_id",
} as const;

// 存储值
export function setItem<T>(key: string, value: T): void {
  try {
    const serialized =
      typeof value === "string" ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`Error saving to localStorage: ${error}`);
  }
}

// 获取值
export function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return null;

    // 尝试解析 JSON
    try {
      return JSON.parse(item) as T;
    } catch {
      // 如果不是 JSON，返回原始字符串
      return item as T;
    }
  } catch (error) {
    console.error(`Error reading from localStorage: ${error}`);
    return null;
  }
}

// 移除值
export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage: ${error}`);
  }
}

// 清空所有
export function clear(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error(`Error clearing localStorage: ${error}`);
  }
}
