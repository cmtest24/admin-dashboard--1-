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
import RichTextEditor from "@/components/rich-text-editor" // Import RichTextEditor
import { fetchWithAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, X } from "lucide-react" // Import X
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Category {
  id: string
  name: string
  type: string
}

interface ProductFormData {
  name: string
  slug: string
  description: string // Short description
  longDescription: string // Rich text description
  price: number
  salePrice: number // Sale price
  imageUrl: string
  additionalImages: string[] // Array of image URLs
  categoryId: string
}

export default function ProductEditPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const isNew = params.id === "new"
  const productId = isNew ? null : (params.id as string)

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "", // Short description
    longDescription: "", // Rich text description
    price: 0,
    salePrice: 0, // Sale price
    imageUrl: "",
    additionalImages: [], // Array of image URLs
    categoryId: "",
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
    if (!isNew) {
      fetchProduct()
    }
  }, [productId])

  const fetchCategories = async () => {
    try {
      const response = await fetchWithAuth("/api/categories/by-type/product")
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

  const fetchProduct = async () => {
    try {
      const response = await fetchWithAuth(`/api/products/${productId}`)
      if (!response.ok) throw new Error("Không thể tải thông tin sản phẩm")

      const data = await response.json()
      setFormData({
        name: data.name || "",
        slug: data.slug || "",
        description: data.description || "", // Short description
        longDescription: data.longDescription || "", // Rich text description
        price: data.price || 0,
        salePrice: data.salePrice || 0, // Sale price
        categoryId: data.categoryId || "",
        imageUrl: data.imageUrl || "",
        additionalImages: data.additionalImages || [], // Array of image URLs
      })
    } catch (error) {
      console.error(error)
      setError("Không thể tải thông tin sản phẩm")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Use parseFloat to handle potential decimal values from text input
    const numberValue = parseFloat(value);

    // Check if the parsed value is a valid number
    if (!isNaN(numberValue)) {
      setFormData((prev) => ({ ...prev, [name]: numberValue }));
    } else {
      // If not a valid number (e.g., empty string or non-numeric input), set to 0 or handle as needed
      // For now, let's set to 0 for invalid input to avoid NaN in state
      setFormData((prev) => ({ ...prev, [name]: 0 }));
    }
  };

  const handleRichTextChange = (content: string) => {
    setFormData((prev) => ({ ...prev, longDescription: content }));
  };

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
      // Kiểm tra dữ liệu bắt buộc
      if (!formData.name || !formData.categoryId) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc")
      }

      // Kiểm tra giá sản phẩm
      if (formData.price <= 0) {
        throw new Error("Giá sản phẩm phải là số dương")
      }

      // Tự động tạo slug nếu chưa có
      if (!formData.slug) {
        generateSlug()
      }

      // Prepare data to send, matching the API structure
      const dataToSend = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        longDescription: formData.longDescription,
        price: formData.price,
        salePrice: formData.salePrice,
        imageUrl: formData.imageUrl,
        additionalImages: formData.additionalImages,
        categoryId: formData.categoryId,
      };

      const url = isNew ? "/api/products" : `/api/products/${productId}`
      const method = isNew ? "POST" : "PUT"

      const response = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Không thể lưu thông tin sản phẩm")
      }

      toast({
        title: "Thành công",
        description: isNew ? "Đã tạo sản phẩm mới" : "Đã cập nhật thông tin sản phẩm",
      })

      // Chuyển về trang danh sách
      router.push("/admin/products")
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
      <div className="container max-w-6xl py-8"> {/* Increased max-width */}
        <div className="mb-6 flex items-center">
          <Button variant="ghost" onClick={() => router.push("/admin/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="ml-4 text-2xl font-bold">{isNew ? "Thêm sản phẩm mới" : "Chỉnh sửa sản phẩm"}</h1>
        </div>

        {error && (
          <div className="mb-6">
            <StatusAlert title="Lỗi" description={error} variant="destructive" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6"> {/* Use flex for layout */}
          <Card className="md:w-2/3"> {/* Card takes 2/3 width on medium screens */}
            <CardHeader>
              <CardTitle>Thông tin sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Tên sản phẩm <span className="text-destructive">*</span>
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
                  <Label htmlFor="price">
                    Giá <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="text" // Change type to text
                    value={Number.isInteger(formData.price) ? formData.price.toFixed(0) : formData.price.toString()} // Display as integer string if no decimal, otherwise as string
                    onChange={handleNumberChange} // Use the updated handler
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salePrice">Giá khuyến mãi</Label>
                  <Input
                    id="salePrice"
                    name="salePrice"
                    type="text" // Change type to text
                    value={Number.isInteger(formData.salePrice) ? formData.salePrice.toFixed(0) : formData.salePrice.toString()} // Display as integer string if no decimal, otherwise as string
                    onChange={handleNumberChange} // Use the updated handler
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả ngắn</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3} // Reduced rows for short description
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longDescription">Mô tả chi tiết</Label>
                 <RichTextEditor
                   initialValue={formData.longDescription}
                   onEditorChange={handleRichTextChange}
                 />
              </div>

            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
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

          {/* Image Uploads Section */}
          <Card className="md:w-1/3"> {/* Image section takes 1/3 width */}
             <CardHeader>
                <CardTitle>Hình ảnh</CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
                  label="Hình ảnh sản phẩm chính"
                  multiple={false} // Explicitly set to false for single image
                />

                {/* Additional Images using ImageUpload components */}
                <div className="space-y-4"> {/* Increased spacing */}
                  <Label>Hình ảnh bổ sung</Label>
                  {/* Use a single ImageUpload component for multiple images */}
                  <ImageUpload
                    value={formData.additionalImages}
                    onChange={(urls) => setFormData((prev) => ({ ...prev, additionalImages: urls as string[] }))} // Cast to string[] as ImageUpload in multiple mode returns string[]
                    label="Tải lên hình ảnh bổ sung"
                    multiple={true} // Enable multiple image selection and upload
                  />
                </div>
             </CardContent>
          </Card>
        </form>
      </div>
    </AdminLayout>
  )
}
