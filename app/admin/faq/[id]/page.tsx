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

interface FAQFormData {
  tieuDe: string
  noiDung: string
  slug: string
}

export default function FAQEditPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const isNew = params.id === "new"
  const faqId = isNew ? null : (params.id as string)

  const [formData, setFormData] = useState<FAQFormData>({
    tieuDe: "",
    noiDung: "",
    slug: "",
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isNew) {
      fetchFAQ()
    }
  }, [faqId])

  const fetchFAQ = async () => {
    try {
      const response = await fetchWithAuth(`/api/faq/${faqId}`)
      if (!response.ok) throw new Error("Không thể tải thông tin câu hỏi")

      const data = await response.json()
      setFormData({
        tieuDe: data.tieuDe || "",
        noiDung: data.noiDung || "",
        slug: data.slug || "",
      })
    } catch (error) {
      console.error(error)
      setError("Không thể tải thông tin câu hỏi")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const generateSlug = () => {
    const slug = formData.tieuDe
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
      if (!formData.tieuDe || !formData.noiDung) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc")
      }

      // Tự động tạo slug nếu chưa có
      if (!formData.slug) {
        generateSlug()
      }

      const url = isNew ? "/api/faq" : `/api/faq/${faqId}`
      const method = isNew ? "POST" : "PUT"

      const response = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Không thể lưu thông tin câu hỏi")
      }

      toast({
        title: "Thành công",
        description: isNew ? "Đã tạo câu hỏi mới" : "Đã cập nhật thông tin câu hỏi",
      })

      // Chuyển về trang danh sách
      router.push("/admin/faq")
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
          <Button variant="ghost" onClick={() => router.push("/admin/faq")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="ml-4 text-2xl font-bold">{isNew ? "Thêm câu hỏi mới" : "Chỉnh sửa câu hỏi"}</h1>
        </div>

        {error && (
          <div className="mb-6">
            <StatusAlert title="Lỗi" description={error} variant="destructive" />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin câu hỏi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tieuDe">
                  Câu hỏi <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tieuDe"
                  name="tieuDe"
                  value={formData.tieuDe}
                  onChange={handleChange}
                  onBlur={() => !formData.slug && generateSlug()}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="noiDung">
                  Câu trả lời <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="noiDung"
                  name="noiDung"
                  value={formData.noiDung}
                  onChange={handleChange}
                  rows={6}
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
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/faq")}>
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
