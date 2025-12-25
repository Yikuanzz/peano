/**
 * 首页 - 时间轴视图
 */
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Send,
  Image as ImageIcon,
  Trash2,
  Check,
  Star,
  Calendar,
  Plus,
  X,
  Edit3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Bookmark,
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
  Home as HomeIcon,
  Building,
  Smile,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import type { ItemDTO, ItemStatus, TagDTO } from "@/types/item";
import { createItem, getItemList, updateItem, deleteItem } from "@/api/itemApi";
import { createTag, updateTag, deleteTag, getTagList } from "@/api/tagApi";
import { uploadFile } from "@/api/fileApi";
import { formatRelativeTime } from "@/utils/date";
import "@/styles/editor.css";

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
  { name: "Home", icon: HomeIcon },
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

// 图标选择器组件
function IconPicker({
  value,
  onChange,
  color = "#3b82f6",
}: {
  value: string;
  onChange: (iconName: string) => void;
  color?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedIcon = ICON_OPTIONS.find((opt) => opt.name === value);
  const SelectedIconComponent = selectedIcon?.icon || Star;

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-8 p-0"
        style={{ borderColor: color }}
      >
        <SelectedIconComponent size={16} style={{ color }} />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 p-2 bg-background border rounded-lg shadow-lg w-64 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-6 gap-1">
              {ICON_OPTIONS.map((option) => {
                const IconComponent = option.icon;
                const isSelected = value === option.name;
                return (
                  <Button
                    key={option.name}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onChange(option.name);
                      setIsOpen(false);
                    }}
                    className={`p-2 h-auto relative ${
                      isSelected ? "bg-accent" : ""
                    }`}
                    title={option.name}
                  >
                    <IconComponent
                      size={18}
                      style={{ color: isSelected ? color : "#64748b" }}
                    />
                    {isSelected && (
                      <Check
                        size={10}
                        className="absolute top-0 right-0 text-primary"
                      />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

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
            <span>{formatRelativeTime(item.created_at)}</span>
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

// 时间轴组件
function ItemTimeline({
  items,
  onUpdate,
  onDelete,
}: {
  items: ItemDTO[];
  onUpdate: (id: number, status: ItemStatus) => void;
  onDelete: (id: number) => void;
}) {
  // 按日期分组
  const groupedItems = items.reduce((acc, item) => {
    const date = new Date(item.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBeforeYesterday = new Date(today);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

    let label = "";
    if (date.toDateString() === today.toDateString()) {
      label = "今天";
    } else if (date.toDateString() === yesterday.toDateString()) {
      label = "昨天";
    } else if (date.toDateString() === dayBeforeYesterday.toDateString()) {
      label = "前天";
    } else {
      return acc; // 忽略更早的日期
    }

    if (!acc[label]) {
      acc[label] = [];
    }
    acc[label].push(item);
    return acc;
  }, {} as Record<string, ItemDTO[]>);

  const timelineOrder = ["今天", "昨天", "前天"];

  if (items.length === 0) {
    return (
      <Empty
        type="default"
        title="还没有便签"
        description="开始创建你的第一条便签吧~"
      />
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {timelineOrder.map((label) => {
        const dayItems = groupedItems[label];
        if (!dayItems || dayItems.length === 0) return null;

        return (
          <div key={label} className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <h2 className="text-base md:text-lg font-semibold">{label}</h2>
              <span className="text-xs md:text-sm text-muted-foreground">
                ({dayItems.length})
              </span>
            </div>
            <div className="space-y-2 md:space-y-3 pl-0">
              {dayItems.map((item) => (
                <ItemCard
                  key={item.item_id}
                  item={item}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 标签管理组件
function TagManager({
  tags,
  onTagsChange,
}: {
  tags: TagDTO[];
  onTagsChange: () => void;
}) {
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingIcon, setEditingIcon] = useState("Star");
  const [editingColor, setEditingColor] = useState("#3b82f6");
  const [isAdding, setIsAdding] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagIcon, setNewTagIcon] = useState("Star");
  const [newTagColor, setNewTagColor] = useState("#3b82f6");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 开始编辑标签
  const handleEditTag = (tag: TagDTO) => {
    setEditingTagId(tag.tag_id);
    setEditingName(tag.tag_name);
    setEditingIcon(tag.icon || "Star");
    setEditingColor(tag.color || "#3b82f6");
  };

  // 保存标签编辑
  const handleSaveEdit = async (tagId: number) => {
    const name = editingName.trim();

    // 如果名称为空,删除标签
    if (!name) {
      try {
        await deleteTag(tagId);
        toast.success("标签已删除");
        onTagsChange();
      } catch (error) {
        toast.error("删除失败");
      }
      setEditingTagId(null);
      return;
    }

    // 更新标签
    try {
      await updateTag(tagId, {
        tag_name: name,
        icon: editingIcon,
        color: editingColor,
      });
      toast.success("标签已更新");
      onTagsChange();
      setEditingTagId(null);
    } catch (error) {
      toast.error("更新失败");
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingTagId(null);
    setEditingName("");
    setEditingIcon("Star");
    setEditingColor("#3b82f6");
  };

  // 添加新标签
  const handleAddTag = async () => {
    const name = newTagName.trim();
    if (!name) {
      toast.error("请输入标签名称");
      return;
    }

    setIsSubmitting(true);
    try {
      await createTag({
        tag_name: name,
        tag_value: name.toLowerCase().replace(/\s+/g, "-"),
        icon: newTagIcon,
        color: newTagColor,
      });
      toast.success("标签已添加");
      setNewTagName("");
      setNewTagIcon("Star");
      setNewTagColor("#3b82f6");
      setIsAdding(false);
      onTagsChange();
    } catch (error) {
      toast.error("添加失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-3 md:p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Bookmark size={18} />
            <Label className="text-sm font-medium">标签管理</Label>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
            className="h-7 text-xs"
          >
            {isAdding ? (
              <>
                <X className="h-3 w-3 mr-1" />
                取消
              </>
            ) : (
              <>
                <Plus className="h-3 w-3 mr-1" />
                新建
              </>
            )}
          </Button>
        </div>

        {/* 现有标签列表 */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <div key={tag.tag_id} className="inline-flex">
                {editingTagId === tag.tag_id ? (
                  // 编辑模式
                  <div className="flex items-center gap-1">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveEdit(tag.tag_id);
                        } else if (e.key === "Escape") {
                          handleCancelEdit();
                        }
                      }}
                      autoFocus
                      className="h-7 w-24 text-xs px-2"
                      style={{ borderColor: editingColor }}
                    />
                    <IconPicker
                      value={editingIcon}
                      onChange={setEditingIcon}
                      color={editingColor}
                    />
                    <Input
                      type="color"
                      value={editingColor}
                      onChange={(e) => setEditingColor(e.target.value)}
                      className="w-10 h-7 cursor-pointer p-0.5"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSaveEdit(tag.tag_id)}
                      className="h-7 w-7 p-0"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  // 显示模式
                  <Badge
                    variant="outline"
                    className="cursor-pointer text-xs hover:opacity-80 transition-opacity group relative"
                    style={{
                      borderColor: tag.color,
                      color: tag.color,
                      backgroundColor: tag.color + "10",
                    }}
                    onClick={() => handleEditTag(tag)}
                  >
                    {renderTagIcon(tag.icon)}
                    <span className="mx-1">{tag.tag_name}</span>
                    <Edit3 className="h-2.5 w-2.5" />
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 添加新标签表单 */}
        {isAdding && (
          <div className="border-t pt-3 space-y-2">
            <div className="flex gap-2">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddTag();
                  }
                }}
                placeholder="标签名称"
                className="flex-1 h-8 text-xs"
              />
              <IconPicker
                value={newTagIcon}
                onChange={setNewTagIcon}
                color={newTagColor}
              />
              <Input
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="w-12 h-8 cursor-pointer"
              />
            </div>
            <Button
              onClick={handleAddTag}
              disabled={isSubmitting}
              size="sm"
              className="w-full h-8 text-xs"
            >
              {isSubmitting ? "添加中..." : "添加标签"}
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          💡 点击标签可编辑,清空名称可删除
        </p>
      </CardContent>
    </Card>
  );
}

// 富文本编辑器组件
function RichTextEditor({
  editor,
  onImageUpload,
  isUploading,
}: {
  editor: ReturnType<typeof useEditor>;
  onImageUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!editor) return null;

  // 处理粘贴图片
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await onImageUpload(file);
        }
      }
    }
  };

  // 处理拖拽
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        await onImageUpload(file);
      }
    }
  };

  // 处理文件选择
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      await onImageUpload(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      {/* 工具栏 */}
      <div className="flex flex-wrap gap-1 p-2 border rounded-md bg-muted/30">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-7 w-7 p-0 ${
            editor.isActive("bold") ? "bg-accent" : ""
          }`}
          title="粗体 (Ctrl+B)"
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-7 w-7 p-0 ${
            editor.isActive("italic") ? "bg-accent" : ""
          }`}
          title="斜体 (Ctrl+I)"
        >
          <Italic className="h-3.5 w-3.5" />
        </Button>
        <div className="w-px h-7 bg-border mx-1" />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-7 w-7 p-0 ${
            editor.isActive("bulletList") ? "bg-accent" : ""
          }`}
          title="无序列表"
        >
          <List className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-7 w-7 p-0 ${
            editor.isActive("orderedList") ? "bg-accent" : ""
          }`}
          title="有序列表"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </Button>
        <div className="w-px h-7 bg-border mx-1" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="h-7 px-2"
          title="插入图片"
        >
          {isUploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ImageIcon className="h-3.5 w-3.5" />
          )}
          <span className="ml-1 text-xs hidden md:inline">图片</span>
        </Button>
      </div>

      {/* 编辑器 */}
      <div
        onPaste={handlePaste}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative ${isDragging ? "drag-over" : ""}`}
      >
        <EditorContent editor={editor} className="tiptap-editor" />
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/10 border-2 border-dashed border-primary rounded-md pointer-events-none">
            <p className="text-sm font-medium text-primary">松开鼠标上传图片</p>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        💡 支持粘贴图片 (Ctrl+V)、拖拽图片、富文本格式
      </p>
    </div>
  );
}

// 便签编辑器组件
function ItemEditor({
  tags,
  onSubmit,
  onTagsChange,
}: {
  tags: TagDTO[];
  onSubmit: () => void;
  onTagsChange: () => void;
}) {
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: "写点什么...",
      }),
    ],
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none",
      },
    },
  });

  // 上传图片
  const handleImageUpload = async (file: File) => {
    if (!editor) return;

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("图片大小不能超过 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadFile(file);

      // 处理图片 URL
      let imageUrl = result.file_url;

      // 提取 /uploads/... 路径部分
      const urlObj = new URL(imageUrl);
      imageUrl = urlObj.pathname; // 获取 /uploads/2025/12/25/xxx.png

      editor.chain().focus().setImage({ src: imageUrl }).run();
      toast.success("图片已插入");
    } catch (error) {
      toast.error("图片上传失败");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!editor) return;

    const content = editor.getHTML();
    const text = editor.getText().trim();

    if (!text) {
      toast.error("请输入内容");
      return;
    }

    setIsSubmitting(true);
    try {
      await createItem({
        content: content,
        status: "normal",
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });
      toast.success("创建成功");
      editor.commands.clearContent();
      setSelectedTags([]);
      onSubmit();
    } catch (error) {
      toast.error("创建失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {/* 标签管理（可折叠） */}
      {showTagManager && <TagManager tags={tags} onTagsChange={onTagsChange} />}

      {/* 便签编辑器 */}
      <Card>
        <CardContent className="p-3 md:p-4 space-y-3 md:space-y-4">
          {/* 富文本编辑器 */}
          <RichTextEditor
            editor={editor}
            onImageUpload={handleImageUpload}
            isUploading={isUploading}
          />

          {/* 标签选择 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">选择标签</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTagManager(!showTagManager)}
                className="h-6 text-xs"
              >
                {showTagManager ? "隐藏" : "管理标签"}
              </Button>
            </div>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.tag_id}
                    variant={
                      selectedTags.includes(tag.tag_id) ? "default" : "outline"
                    }
                    className="cursor-pointer text-xs hover:opacity-80 transition-opacity"
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
            ) : (
              <p className="text-xs text-muted-foreground">
                暂无标签，点击"管理标签"创建
              </p>
            )}
          </div>

          {/* 发布按钮 */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isUploading}
              size="sm"
              className="text-xs md:text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 animate-spin" />
                  发布中...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />
                  发布
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 主页面
export default function Home() {
  const [items, setItems] = useState<ItemDTO[]>([]);
  const [tags, setTags] = useState<TagDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const now = new Date();
      const threeDaysAgo = new Date(now);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 2);
      threeDaysAgo.setHours(0, 0, 0, 0);

      const [itemsRes, tagsRes] = await Promise.all([
        getItemList({
          date_start: threeDaysAgo.toISOString().split("T")[0],
          page: 1,
          page_size: 100,
        }),
        getTagList({ page: 1, page_size: 100 }),
      ]);

      setItems(itemsRes.items || []);
      setTags(tagsRes.tags || []);
    } catch (error) {
      toast.error("加载数据失败");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 pb-20 md:pb-6">
      <ItemEditor tags={tags} onSubmit={fetchData} onTagsChange={fetchData} />
      <ItemTimeline
        items={items}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
