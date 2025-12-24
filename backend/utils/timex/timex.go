package timex

import (
	"fmt"
	"time"
)

// ParseDateString 解析日期字符串为 time.Time
// 支持的格式：
// - "2006-01-02" (YYYY-MM-DD)
// - "2006-01-02 15:04:05" (YYYY-MM-DD HH:MM:SS)
// - "2006-01-02T15:04:05Z07:00" (RFC3339)
// 如果解析失败，返回错误
func ParseDateString(dateStr string) (time.Time, error) {
	if dateStr == "" {
		return time.Time{}, fmt.Errorf("日期字符串不能为空")
	}

	// 尝试多种日期格式
	formats := []string{
		"2006-01-02",
		"2006-01-02 15:04:05",
		time.RFC3339,
		time.RFC3339Nano,
	}

	for _, format := range formats {
		if t, err := time.Parse(format, dateStr); err == nil {
			return t, nil
		}
	}

	return time.Time{}, fmt.Errorf("无法解析日期字符串: %s，支持的格式: YYYY-MM-DD, YYYY-MM-DD HH:MM:SS, RFC3339", dateStr)
}

// ParseDateStringOptional 解析日期字符串为 *time.Time（可选）
// 如果字符串为空，返回 nil
// 如果解析失败，返回错误
func ParseDateStringOptional(dateStr string) (*time.Time, error) {
	if dateStr == "" {
		return nil, nil
	}

	t, err := ParseDateString(dateStr)
	if err != nil {
		return nil, err
	}

	return &t, nil
}

// FormatDateString 将 time.Time 格式化为日期字符串
// 格式: "2006-01-02"
func FormatDateString(t time.Time) string {
	return t.Format("2006-01-02")
}

// FormatDateTimeString 将 time.Time 格式化为日期时间字符串
// 格式: "2006-01-02 15:04:05"
func FormatDateTimeString(t time.Time) string {
	return t.Format("2006-01-02 15:04:05")
}
