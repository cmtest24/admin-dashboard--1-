"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import AdminLayout from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusAlert } from "@/components/ui-elements"
import { ImageUpload } from "@/components/image-upload"
import { fetchWithAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface BannerFormData {
  imageUrl: string
  shortTitle: string
  longTitle: string
  link: string
  order: number
}

export default function BannerEditPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const isNew = params.id === "new"
  const bannerId = isNew ? null : (params.id as string)

  const [formData, setFormData] = useState<BannerFormData>({
    imageUrl: "",
    shortTitle: "",
    longTitle: "",
    link: "",
    order: 0,
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isNew) {
      fetchBanner()
    }
  }, [bannerId])

  const fetchBanner = async () => {
    try {
      const response = await fetchWithAuth(`/api/banners/${bannerId}`)
      if (!response.ok) throw new Error("Không thể tải thông tin banner")

      const data = await response.json()
      setFormData({
        imageUrl: data.imageUrl || "",
        shortTitle: data.shortTitle || "",
        longTitle: data.longTitle || "",
        link: data.link || "",
        order: data.order || 0,
      })
    } catch (error) {
      console.error(error)
      setError("Không thể tải thông tin banner")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: Number(value) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Kiểm tra dữ liệu
      if (!formData.imageUrl) {
        throw new Error("Vui lòng tải lên hình ảnh banner")
      }

      const url = isNew ? "/api/banners" : `/api/banners/${bannerId}`
      const method = isNew ? "POST" : "PUT"

      const response = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Không thể lưu thông tin banner")
      }

      toast({
        title: "Thành công",
        description: isNew ? "Đã tạo banner mới" : "Đã cập nhật thông tin banner",
      })

      // Chuyển về trang danh sách
      router.push("/admin/banner")
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
          <Button variant="ghost" onClick={() => router.push("/admin/banner")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="ml-4 text-2xl font-bold">{isNew ? "Thêm banner mới" : "Chỉnh sửa banner"}</h1>
        </div>

        {error && (
          <div className="mb-6">
            <StatusAlert title="Lỗi" description={error} variant="destructive" />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin banner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
                label="Hình ảnh banner"
              />

              <div className="space-y-2">
                <Label htmlFor="shortTitle">Tiêu đề ngắn</Label>
                <Input id="shortTitle" name="shortTitle" value={formData.shortTitle} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longTitle">Tiêu đề dài</Label>
                <Input id="longTitle" name="longTitle" value={formData.longTitle} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">Đường dẫn khi nhấp vào banner</Label>
                <Input id="link" name="link" value={formData.link} onChange={handleChange} placeholder="https://" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Thứ tự hiển thị</Label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  value={formData.order}
                  onChange={handleNumberChange}
                  min={0}
                />
                <p className="text-sm text-muted-foreground">Số nhỏ hơn sẽ hiển thị trước</p>
              </div>

              
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/banner")}>
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
