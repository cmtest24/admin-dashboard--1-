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
import { fetchWithAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface CategoryFormData {
  type: string
  name: string
  slug: string
  description: string
  isActive: boolean
  sortOrder: number
  level: number
}

export default function CategoryEditPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const isNew = params.id === "new"
  const categoryId = isNew ? null : (params.id as string)

  const [formData, setFormData] = useState<CategoryFormData>({
    type: "",
    name: "",
    slug: "",
    description: "",
    isActive: true,
    sortOrder: 0,
    level: 0,
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isNew) {
      fetchCategory()
    }
  }, [categoryId])

  const fetchCategory = async () => {
    try {
      const response = await fetchWithAuth(`/api/categories/${categoryId}`)
      if (!response.ok) throw new Error("Không thể tải thông tin danh mục")

      const data = await response.json()
      setFormData({
        type: data.type || "",
        name: data.name || "",
        slug: data.slug || "",
        description: data.description || "",
        isActive: data.isActive !== undefined ? data.isActive : true,
        sortOrder: data.sortOrder || 0,
        level: data.level || 0,
      })
    } catch (error) {
      console.error(error)
      setError("Không thể tải thông tin danh mục")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: Number(value) }))
  }

  const generateSlug = () => {
    const slug = formData.name
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
      // Kiểm tra dữ liệu
      if (!formData.name || !formData.type) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc")
      }

      // Tự động tạo slug nếu chưa có
      if (!formData.slug) {
        generateSlug()
      }

      const url = isNew ? "/api/categories" : `/api/categories/${categoryId}`
      const method = isNew ? "POST" : "PUT"

      const response = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Không thể lưu thông tin danh mục")
      }

      toast({
        title: "Thành công",
        description: isNew ? "Đã tạo danh mục mới" : "Đã cập nhật thông tin danh mục",
      })

      // Chuyển về trang danh sách
      router.push("/admin/categories")
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
          <Button variant="ghost" onClick={() => router.push("/admin/categories")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="ml-4 text-2xl font-bold">{isNew ? "Thêm danh mục mới" : "Chỉnh sửa danh mục"}</h1>
        </div>

        {error && (
          <div className="mb-6">
            <StatusAlert title="Lỗi" description={error} variant="destructive" />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin danh mục</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Tên danh mục <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => !formData.slug && generateSlug()}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">
                    Loại danh mục <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Sản phẩm</SelectItem>
                      <SelectItem value="post">Bài viết</SelectItem>
                      <SelectItem value="service">Dịch vụ</SelectItem>
                    </SelectContent>
                  </Select>
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
                      Tạo
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Thứ tự hiển thị</Label>
                  <Input
                    id="sortOrder"
                    name="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={handleNumberChange}
                    min={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Cấp độ</Label>
                  <Input
                    id="level"
                    name="level"
                    type="number"
                    value={formData.level}
                    onChange={handleNumberChange}
                    min={0}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Hiển thị danh mục</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/categories")}>
                Hủy
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  "Đang lưu..."
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
