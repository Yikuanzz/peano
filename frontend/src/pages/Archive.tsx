/**
 * 归档 - 归档视图
 */
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Search,
  Filter,
  Trash2,
  Check,
  Star,
  Calendar,
  ChevronDown,
  Heart,
  Zap,
  Flame,
  Coffee,
  Book,
  Briefcase,
  Code,
  Music,
  Camera,
  Palette,
  Lightbulb,
  Target,
  Trophy,
  Flag,
  Bell,
  Clock,
  Mail,
  Phone,
  Map,
  Home,
  Building,
  Smile,
} from "lucide-react";
import type { ItemDTO, ItemStatus, TagDTO } from "@/types/item";
import { getItemList, updateItem, deleteItem } from "@/api/itemApi";
import { getTagList } from "@/api/tagApi";
import { formatDateTime } from "@/utils/date";

// 可选图标列表
const ICON_OPTIONS = [
  { name: "Star", icon: Star },
  { name: "Heart", icon: Heart },
  { name: "Zap", icon: Zap },
  { name: "Flame", icon: Flame },
  { name: "Coffee", icon: Coffee },
  { name: "Book", icon: Book },
  { name: "Briefcase", icon: Briefcase },
  { name: "Code", icon: Code },
  { name: "Music", icon: Music },
  { name: "Camera", icon: Camera },
  { name: "Palette", icon: Palette },
  { name: "Lightbulb", icon: Lightbulb },
  { name: "Target", icon: Target },
  { name: "Trophy", icon: Trophy },
  { name: "Flag", icon: Flag },
  { name: "Bell", icon: Bell },
  { name: "Clock", icon: Clock },
  { name: "Calendar", icon: Calendar },
  { name: "Mail", icon: Mail },
  { name: "Phone", icon: Phone },
  { name: "Map", icon: Map },
  { name: "Home", icon: Home },
  { name: "Building", icon: Building },
  { name: "Smile", icon: Smile },
];

// 渲染标签图标的辅助函数
const renderTagIcon = (iconName?: string) => {
  const iconOption = ICON_OPTIONS.find((opt) => opt.name === iconName);
  if (!iconOption) return null;
  const IconComponent = iconOption.icon;
  return <IconComponent size={14} className="inline" />;
};

// 便签卡片组件
function ItemCard({
  item,
  onUpdate,
  onDelete,
}: {
  item: ItemDTO;
  onUpdate: (id: number, status: ItemStatus) => void;
  onDelete: (id: number) => void;
}) {
  const statusIcons = {
    normal: Calendar,
    done: Check,
    marked: Star,
  };

  const StatusIcon = statusIcons[item.status];

  return (
    <Card className="group hover:shadow-md transition-all">
      <CardContent className="p-3 md:p-4">
        <div className="space-y-2 md:space-y-3">
          {/* 内容 - 支持 HTML */}
          <div
            className="prose prose-sm max-w-none text-sm md:text-base"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />

          {/* 标签 */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {item.tags.map((tag) => (
                <Badge
                  key={tag.tag_id}
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor: tag.color + "20",
                    color: tag.color,
                  }}
                >
                  {tag.icon && (
                    <span className="mr-1">{renderTagIcon(tag.icon)}</span>
                  )}
                  {tag.tag_name}
                </Badge>
              ))}
            </div>
          )}

          {/* 底部操作栏 */}
          <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground">
            <span>{formatDateTime(item.created_at)}</span>
            <div className="flex items-center gap-1 md:gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 md:h-8 md:w-8"
                onClick={() => {
                  const nextStatus: Record<ItemStatus, ItemStatus> = {
                    normal: "done",
                    done: "marked",
                    marked: "normal",
                  };
                  onUpdate(item.item_id, nextStatus[item.status]);
                }}
              >
                <StatusIcon className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 md:h-8 md:w-8"
                onClick={() => onDelete(item.item_id)}
              >
                <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 筛选器组件
function ItemFilters({
  tags,
  onFilterChange,
}: {
  tags: TagDTO[];
  onFilterChange: (filters: {
    status?: ItemStatus;
    tagIds?: number[];
    keyword?: string;
  }) => void;
}) {
  const [status, setStatus] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [keyword, setKeyword] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    onFilterChange({
      status: status === "all" ? undefined : (status as ItemStatus),
      tagIds: selectedTags.length > 0 ? selectedTags : undefined,
      keyword: keyword.trim() || undefined,
    });
  }, [status, selectedTags, keyword, onFilterChange]);

  return (
    <Card>
      <CardContent className="p-3 md:p-4 space-y-3 md:space-y-4">
        {/* 搜索框 */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
            <Input
              placeholder="搜索内容..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-8 md:pl-9 text-sm md:text-base h-9 md:h-10"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs md:text-sm h-9 md:h-10"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-1" />
            <span className="hidden sm:inline">筛选</span>
            <ChevronDown
              className={`h-3.5 w-3.5 md:h-4 md:w-4 ml-1 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </Button>
        </div>

        {/* 高级筛选 */}
        {showFilters && (
          <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t">
            {/* 状态筛选 */}
            <div className="space-y-2">
              <Label className="text-sm">状态</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="text-sm md:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="normal">普通</SelectItem>
                  <SelectItem value="done">完成</SelectItem>
                  <SelectItem value="marked">标记</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 标签筛选 */}
            {tags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">标签</Label>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.tag_id}
                      variant={
                        selectedTags.includes(tag.tag_id)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer text-xs"
                      style={
                        selectedTags.includes(tag.tag_id)
                          ? { backgroundColor: tag.color }
                          : { borderColor: tag.color, color: tag.color }
                      }
                      onClick={() => {
                        setSelectedTags((prev) =>
                          prev.includes(tag.tag_id)
                            ? prev.filter((id) => id !== tag.tag_id)
                            : [...prev, tag.tag_id]
                        );
                      }}
                    >
                      {tag.icon && (
                        <span className="mr-1">{renderTagIcon(tag.icon)}</span>
                      )}
                      {tag.tag_name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 主页面
export default function Archive() {
  const [items, setItems] = useState<ItemDTO[]>([]);
  const [tags, setTags] = useState<TagDTO[]>([]);
  const [filteredItems, setFilteredItems] = useState<ItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{
    status?: ItemStatus;
    tagIds?: number[];
    keyword?: string;
  }>({});

  const fetchData = useCallback(
    async (pageNum: number, reset = false) => {
      try {
        setIsLoading(true);
        const [itemsRes, tagsRes] = await Promise.all([
          getItemList({
            page: pageNum,
            page_size: 20,
            status: filters.status,
          }),
          pageNum === 1
            ? getTagList({ page: 1, page_size: 100 })
            : Promise.resolve(null),
        ]);

        if (tagsRes) {
          setTags(tagsRes.tags || []);
        }

        if (reset) {
          setItems(itemsRes.items || []);
        } else {
          setItems((prev) => [...prev, ...(itemsRes.items || [])]);
        }

        setHasMore(pageNum < itemsRes.total_pages);
      } catch (error) {
        toast.error("加载数据失败");
      } finally {
        setIsLoading(false);
      }
    },
    [filters.status]
  );

  useEffect(() => {
    setPage(1);
    fetchData(1, true);
  }, [fetchData]);

  // 客户端筛选
  useEffect(() => {
    let result = items;

    // 标签筛选
    if (filters.tagIds && filters.tagIds.length > 0) {
      result = result.filter((item) =>
        item.tags.some((tag) => filters.tagIds!.includes(tag.tag_id))
      );
    }

    // 关键词搜索
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      result = result.filter((item) =>
        item.content.toLowerCase().includes(keyword)
      );
    }

    setFilteredItems(result);
  }, [items, filters]);

  const handleUpdate = async (id: number, status: ItemStatus) => {
    try {
      await updateItem(id, { status });
      setItems((prev) =>
        prev.map((item) => (item.item_id === id ? { ...item, status } : item))
      );
      toast.success("更新成功");
    } catch (error) {
      toast.error("更新失败");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((item) => item.item_id !== id));
      toast.success("删除成功");
    } catch (error) {
      toast.error("删除失败");
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage, false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 pb-20 md:pb-6">
      <ItemFilters tags={tags} onFilterChange={setFilters} />

      {/* 列表 */}
      <div className="space-y-3 md:space-y-4">
        {filteredItems.length === 0 && !isLoading ? (
          <Empty
            type="default"
            title="没有找到便签"
            description="尝试调整筛选条件"
          />
        ) : (
          <>
            {filteredItems.map((item) => (
              <ItemCard
                key={item.item_id}
                item={item}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </>
        )}

        {/* 加载更多 */}
        {hasMore && !isLoading && filteredItems.length > 0 && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadMore}
              className="text-xs md:text-sm"
            >
              加载更多
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-6 md:py-8">
            <div className="text-sm text-muted-foreground">加载中...</div>
          </div>
        )}
      </div>
    </div>
  );
}
