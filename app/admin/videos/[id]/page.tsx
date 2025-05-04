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
import { ArrowLeft, Save, Youtube } from "lucide-react"

interface VideoFormData {
  tieuDe: string
  linkYtb: string
}

export default function VideoEditPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const isNew = params.id === "new"
  const videoIdParam = isNew ? null : (params.id as string)

  const [formData, setFormData] = useState<VideoFormData>({
    tieuDe: "",
    linkYtb: "",
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isNew) {
      fetchVideo()
    }
  }, [videoIdParam])

  const fetchVideo = async () => {
    try {
      const response = await fetchWithAuth(`/api/videos/${videoIdParam}`)
      if (!response.ok) throw new Error("Không thể tải thông tin video")

      const data = await response.json()
      setFormData({
        tieuDe: data.tieuDe || "",
        linkYtb: data.linkYtb || "",
      })
    } catch (error) {
      console.error(error)
      setError("Không thể tải thông tin video")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Hàm lấy ID video từ URL YouTube
  const getYoutubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Kiểm tra dữ liệu
      if (!formData.tieuDe || !formData.linkYtb) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc")
      }

      // Kiểm tra link YouTube hợp lệ
      if (!getYoutubeVideoId(formData.linkYtb)) {
        throw new Error("Link YouTube không hợp lệ")
      }

      const url = isNew ? "/api/videos" : `/api/videos/${videoIdParam}`
      const method = isNew ? "POST" : "PUT"

      const response = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Không thể lưu thông tin video")
      }

      toast({
        title: "Thành công",
        description: isNew ? "Đã tạo video mới" : "Đã cập nhật thông tin video",
      })

      // Chuyển về trang danh sách
      router.push("/admin/videos")
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

  const videoId = getYoutubeVideoId(formData.linkYtb)

  return (
    <AdminLayout>
      <div className="container max-w-4xl py-8">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" onClick={() => router.push("/admin/videos")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="ml-4 text-2xl font-bold">{isNew ? "Thêm video mới" : "Chỉnh sửa video"}</h1>
        </div>

        {error && (
          <div className="mb-6">
            <StatusAlert title="Lỗi" description={error} variant="destructive" />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tieuDe">
                  Tiêu đề <span className="text-destructive">*</span>
                </Label>
                <Input id="tieuDe" name="tieuDe" value={formData.tieuDe} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkYtb">
                  Link YouTube <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Youtube className="h-5 w-5 text-red-600" />
                  <Input
                    id="linkYtb"
                    name="linkYtb"
                    value={formData.linkYtb}
                    onChange={handleChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </div>
              </div>

              {videoId && (
                <div className="rounded-md border p-4">
                  <p className="mb-2 font-medium">Xem trước:</p>
                  <div className="aspect-video overflow-hidden rounded-md">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="border-0"
                    ></iframe>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/videos")}>
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
