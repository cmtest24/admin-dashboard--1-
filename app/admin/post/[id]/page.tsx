"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import AdminLayout from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusAlert } from "@/components/ui-elements"
import { ImageUpload } from "@/components/image-upload"
import { fetchWithAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import RichTextEditor from "@/components/rich-text-editor"

interface PostFormData {
  title: string
  slug: string
  content: string
  summary: string
  imageUrl: string
  isPublished: boolean
  tags: string[]
  authorName: string
}

export default function PostEditPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const isNew = params.id === "new"
  const postId = isNew ? null : (params.id as string)

  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    slug: "",
    content: "",
    summary: "",
    imageUrl: "",
    isPublished: true,
    tags: [],
    authorName: "",
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isNew) {
      fetchPost()
    }
    // eslint-disable-next-line
  }, [postId])

  const fetchPost = async () => {
    try {
      const response = await fetchWithAuth(`/api/posts/${postId}`)
      if (!response.ok) throw new Error("Không thể tải thông tin bài viết")
      const data = await response.json()
      setFormData({
        title: data.title || "",
        slug: data.slug || "",
        content: data.content || "",
        summary: data.summary || "",
        imageUrl: data.imageUrl || "",
        isPublished: data.isPublished !== undefined ? data.isPublished : true,
        tags: data.tags || [],
        authorName: data.authorName || "",
      })
    } catch (error) {
      console.error(error)
      setError("Không thể tải thông tin bài viết")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData((prev) => ({
      ...prev,
      tags: value.split(",").map(tag => tag.trim()).filter(tag => tag !== "")
    }))
  }

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
    setFormData((prev) => ({ ...prev, slug }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (!formData.title || !formData.content) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc (Tiêu đề và Nội dung)")
      }
      if (!formData.slug && formData.title) {
        generateSlug()
      }
      const url = isNew ? "/api/posts" : `/api/posts/${postId}`
      const method = isNew ? "POST" : "PUT"
      const dataToSend = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        summary: formData.summary,
        imageUrl: formData.imageUrl,
        isPublished: formData.isPublished,
        tags: formData.tags,
        authorName: formData.authorName,
      }

      const response = await fetchWithAuth(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Không thể lưu thông tin bài viết")
      }
      toast({
        title: "Thành công",
        description: isNew ? "Đã tạo bài viết mới" : "Đã cập nhật thông tin bài viết",
      })
      router.push("/admin/post")
    } catch (error: any) {
      console.error(error)
      setError(error.message || "Đã xảy ra lỗi khi lưu thông tin")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center p-8">
          <p>Đang tải...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="container max-w-4xl py-8">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" onClick={() => router.push("/admin/post")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="ml-4 text-2xl font-bold">{isNew ? "Thêm bài viết mới" : "Chỉnh sửa bài viết"}</h1>
        </div>
        {error && (
          <div className="mb-6">
            <StatusAlert title="Lỗi" description={error} variant="destructive" />
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin bài viết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Tiêu đề <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  onBlur={() => !formData.slug && generateSlug()}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">
                  Nội dung <span className="text-destructive">*</span>
                </Label>
                <RichTextEditor
                  initialValue={formData.content}
                  onEditorChange={(value: string) => setFormData((prev) => ({ ...prev, content: value }))}
                  // Có thể thêm disabled={false} nếu cần
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Tóm tắt</Label>
                <Textarea
                  id="summary"
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Đường dẫn</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="tu-dong-tao"
                  />
                  <Button type="button" variant="outline" onClick={generateSlug}>
                    Tạo slug
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
                  label="Hình ảnh"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags.join(", ")}
                  onChange={handleTagsChange}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorName">Tên tác giả</Label>
                <Input
                  id="authorName"
                  name="authorName"
                  value={formData.authorName}
                  onChange={handleChange}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPublished: checked }))}
                />
                <Label htmlFor="isPublished">Hiển thị bài viết</Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/post")}>
                Hủy
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </AdminLayout>
  )
}
