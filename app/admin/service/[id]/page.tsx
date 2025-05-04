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
import RichTextEditor from "@/components/rich-text-editor"
import { fetchWithAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Import Select components

interface Category { // Define Category interface
  id: string
  name: string
  type: string
}

interface ServiceFormData {
  name: string
  slug: string
  categoryId: string
  description: string
  longdescription: string
  image: string
  price: number
  salePrice: number
}

export default function ServiceEditPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const isNew = params.id === "new"
  const serviceId = isNew ? null : (params.id as string)

  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    slug: "",
    categoryId: "",
    description: "",
    longdescription: "",
    image: "",
    price: 0,
    salePrice: 0,
  })
  const [categories, setCategories] = useState<Category[]>([]) // Add state for categories
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories() // Fetch categories on mount
    if (!isNew) {
      fetchService()
    }
  }, [serviceId])

  const fetchCategories = async () => { // Add fetchCategories function
    try {
      const response = await fetchWithAuth("/api/categories/by-type/service") // Assuming this endpoint exists
      if (!response.ok) throw new Error("Không thể tải danh sách danh mục")

      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách danh mục",
        variant: "destructive",
      })
    }
  }

  const fetchService = async () => {
    try {
      const response = await fetchWithAuth(`/api/services/${serviceId}`)
      if (!response.ok) throw new Error("Không thể tải thông tin dịch vụ")

      const data = await response.json()
      setFormData({
        name: data.name || "",
        slug: data.slug || "",
        categoryId: data.categoryId || "",
        description: data.description || "",
        longdescription: data.longdescription || "",
        image: data.image || "",
        price: data.price !== undefined ? data.price : 0,
        salePrice: data.salePrice !== undefined ? data.salePrice : 0,
      })
    } catch (error) {
      console.error(error)
      setError("Không thể tải thông tin dịch vụ")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }))
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
      // Kiểm tra dữ liệu bắt buộc (ví dụ: name, categoryId, description, image)
      if (!formData.name || !formData.categoryId || !formData.description || !formData.image) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc (Tên, Danh mục, Mô tả, Hình ảnh)")
      }

      // Tự động tạo slug nếu chưa có và có tên
      if (!formData.slug && formData.name) {
        generateSlug()
      }

      const url = isNew ? "/api/services" : `/api/services/${serviceId}`
      const method = isNew ? "POST" : "PUT"

      const response = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Không thể lưu thông tin dịch vụ")
      }

      toast({
        title: "Thành công",
        description: isNew ? "Đã tạo dịch vụ mới" : "Đã cập nhật thông tin dịch vụ",
      })

      // Chuyển về trang danh sách
      router.push("/admin/service")
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
      <div className="container max-w-6xl py-8">
        <div className="mb-6 flex items-start justify-between gap-6"> {/* Added flex, items-start, justify-between, gap */}
          <div className="flex items-center"> {/* Wrapped back button and title */}
            <Button variant="ghost" onClick={() => router.push("/admin/service")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            <h1 className="ml-4 text-2xl font-bold">{isNew ? "Thêm dịch vụ mới" : "Chỉnh sửa dịch vụ"}</h1>
          </div>

        </div>

        {error && (
          <div className="mb-6">
            <StatusAlert title="Lỗi" description={error} variant="destructive" />
          </div>
        )}

        <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row gap-6">
          <Card className="md:w-2/3">
            <CardHeader>
              <CardTitle>Thông tin dịch vụ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên dịch vụ <span className="text-destructive">*</span>
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
                <Label htmlFor="categoryId">
                  Danh mục <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Mô tả ngắn <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longdescription">Mô tả chi tiết</Label>
                <RichTextEditor
                  initialValue={formData.longdescription}
                  onEditorChange={(content) => setFormData((prev) => ({ ...prev, longdescription: content }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Giá</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salePrice">Giá khuyến mãi</Label>
                <Input
                  id="salePrice"
                  name="salePrice"
                  type="number"
                  value={formData.salePrice}
                  onChange={handleChange}
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
                    Tạo
                  </Button>
                </div>
              </div>

            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/service")}>
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
          <Card className="md:w-1/3"> {/* Image section takes 1/3 width */}
            <CardHeader>
              <CardTitle>Hình ảnh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                label="Hình ảnh"
              />
            </CardContent>
          </Card>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
