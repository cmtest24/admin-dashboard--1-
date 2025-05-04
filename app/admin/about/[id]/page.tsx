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

interface AboutFormData {
  title: string
  content: string
  mission: string
  vision: string
  history: string
}

export default function AboutEditPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const isNew = params.id === "new"
  const aboutId = isNew ? null : (params.id as string)

  const [formData, setFormData] = useState<AboutFormData>({
    title: "",
    content: "",
    mission: "",
    vision: "",
    history: "",
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isNew) {
      fetchAbout()
    }
  }, [aboutId])

  const fetchAbout = async () => {
    try {
      const response = await fetchWithAuth(`/api/about/${aboutId}`)
      if (!response.ok) throw new Error("Không thể tải thông tin giới thiệu")

      const data = await response.json()
      setFormData({
        title: data.title || "",
        content: data.content || "",
        mission: data.mission || "",
        vision: data.vision || "",
        history: data.history || "",
      })
    } catch (error) {
      console.error(error)
      setError("Không thể tải thông tin giới thiệu")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Kiểm tra dữ liệu
      if (!formData.title || !formData.content) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc")
      }

      const url = isNew ? "/api/about" : `/api/about/${aboutId}`
      const method = isNew ? "POST" : "PATCH"

      const response = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Không thể lưu thông tin giới thiệu")
      }

      toast({
        title: "Thành công",
        description: isNew ? "Đã tạo thông tin giới thiệu mới" : "Đã cập nhật thông tin giới thiệu",
      })

      // Chuyển về trang danh sách
      router.push("/admin/about")
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
          <Button variant="ghost" onClick={() => router.push("/admin/about")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="ml-4 text-2xl font-bold">
            {isNew ? "Thêm thông tin giới thiệu" : "Chỉnh sửa thông tin giới thiệu"}
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
              <CardTitle>Thông tin giới thiệu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Tiêu đề <span className="text-destructive">*</span>
                </Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">
                  Nội dung <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mission">Sứ mệnh</Label>
                <Textarea id="mission" name="mission" value={formData.mission} onChange={handleChange} rows={4} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vision">Tầm nhìn</Label>
                <Textarea id="vision" name="vision" value={formData.vision} onChange={handleChange} rows={4} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="history">Lịch sử</Label>
                <Textarea id="history" name="history" value={formData.history} onChange={handleChange} rows={4} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/about")}>
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
