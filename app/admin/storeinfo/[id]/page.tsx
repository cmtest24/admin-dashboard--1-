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
import { fetchWithAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save } from "lucide-react"


interface StoreInfoFormData {
  logo: string
  favicon: string
  facebook: string
  youtube: string
  googleMap: string
  hotline: string
  zalo: string
  workingHours: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function StoreInfoEditPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const isNew = params.id === "new"
  const storeInfoId = isNew ? null : (params.id as string)

  const [formData, setFormData] = useState<StoreInfoFormData>({
    logo: "",
    favicon: "",
    facebook: "",
    youtube: "",
    googleMap: "",
    hotline: "",
    zalo: "",
    workingHours: "",
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isNew) {
      fetchStoreInfo()
    }
  }, [storeInfoId])

  const fetchStoreInfo = async () => {
    try {
      const response = await fetchWithAuth(`/api/store-info/${storeInfoId}`)
      if (!response.ok) throw new Error("Không thể tải thông tin cửa hàng")

      const data = await response.json()
      setFormData({
        logo: data.logo || "",
        favicon: data.favicon || "",
        facebook: data.facebook || "",
        youtube: data.youtube || "",
        googleMap: data.googleMap || "",
        hotline: data.hotline || "",
        zalo: data.zalo || "",
        workingHours: data.workingHours || "",
      })
    } catch (error) {
      console.error(error)
      setError("Không thể tải thông tin cửa hàng")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (name: "logo" | "favicon", url: string) => {
    setFormData((prev) => ({ ...prev, [name]: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Kiểm tra dữ liệu
      if (!formData.logo || !formData.favicon || !formData.hotline) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc")
      }

      const url = isNew ? "/api/store-info" : `/api/store-info/${storeInfoId}`
      const method = isNew ? "POST" : "PUT"

      const response = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Không thể lưu thông tin cửa hàng")
      }

      toast({
        title: "Thành công",
        description: isNew ? "Đã tạo thông tin cửa hàng mới" : "Đã cập nhật thông tin cửa hàng",
      })

      router.push("/admin/storeinfo")
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
          <Button variant="ghost" onClick={() => router.push("/admin/storeinfo")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="ml-4 text-2xl font-bold">
            {isNew ? "Thêm thông tin cửa hàng mới" : "Chỉnh sửa thông tin cửa hàng"}
          </h1>
        </div>

        {error && (
          <div className="mb-6">
            <StatusAlert title="Lỗi" description={error} variant="destructive" />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cửa hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo */}
              <div className="space-y-2">
                <Label>Logo <span className="text-destructive">*</span></Label>
                {formData.logo ? (
                  <div className="flex items-center gap-4">
                    <img src={formData.logo} alt="Logo preview" className="h-16 rounded border" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData((prev) => ({ ...prev, logo: "" }))}
                    >
                      Xóa
                    </Button>
                  </div>
                ) : (
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const formDataUpload = new FormData()
                      formDataUpload.append("images", file) // Đổi từ "file" thành "images"
                      const res = await fetch(`${API_BASE_URL}/api/upload-images`, {
                        method: "POST",
                        body: formDataUpload,
                      })
                      const data = await res.json()
                      setFormData((prev) => ({ ...prev, logo: data.imageUrls?.[0] || "" }))
                    }}
                  />
                )}
              </div>
              {/* Favicon */}
              <div className="space-y-2">
                <Label>Favicon <span className="text-destructive">*</span></Label>
                {formData.favicon ? (
                  <div className="flex items-center gap-4">
                    <img src={formData.favicon} alt="Favicon preview" className="h-8 w-8 rounded border" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData((prev) => ({ ...prev, favicon: "" }))}
                    >
                      Xóa
                    </Button>
                  </div>
                ) : (
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const formDataUpload = new FormData()
                      formDataUpload.append("images", file) // Đổi từ "file" thành "images"
                      const res = await fetch(`${API_BASE_URL}/api/upload-images`, {
                        method: "POST",
                        body: formDataUpload,
                      })
                      const data = await res.json()
                      setFormData((prev) => ({ ...prev, favicon: data.imageUrls?.[0] || "" })) // Lấy đúng trường trả về
                    }}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input id="facebook" name="facebook" value={formData.facebook} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube</Label>
                <Input id="youtube" name="youtube" value={formData.youtube} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="googleMap">Mã nhúng Google Maps</Label>
                <Input id="googleMap" name="googleMap" value={formData.googleMap} onChange={handleChange} />
                {formData.googleMap && (
                  <div className="mt-2">
                    <div className="aspect-video w-full border rounded">
                      <iframe
                        srcDoc={formData.googleMap}
                        title="Google Map Preview"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="hotline">Hotline <span className="text-destructive">*</span></Label>
                <Input id="hotline" name="hotline" value={formData.hotline} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zalo">Zalo</Label>
                <Input id="zalo" name="zalo" value={formData.zalo} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workingHours">Giờ làm việc</Label>
                <Input id="workingHours" name="workingHours" value={formData.workingHours} onChange={handleChange} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/storeinfo")}>
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
