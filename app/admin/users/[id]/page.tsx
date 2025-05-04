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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserFormData {
  fullName: string
  email: string
  phoneNumber: string
  password: string
  role: string
  avatarUrl: string
}

export default function UserEditPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const isNew = params.id === "new"
  const userId = isNew ? null : (params.id as string)

  const [formData, setFormData] = useState<UserFormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "admin",
    avatarUrl: "",
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isNew) {
      fetchUser()
    }
  }, [userId])

  const fetchUser = async () => {
    try {
      const response = await fetchWithAuth(`/api/users/${userId}`)
      if (!response.ok) throw new Error("Không thể tải thông tin người dùng")

      const data = await response.json()
      setFormData({
        fullName: data.fullName || "",
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
        password: "", // Không hiển thị mật khẩu
        role: data.role || "admin",
        avatarUrl: data.avatarUrl || "",
      })
    } catch (error) {
      console.error(error)
      setError("Không thể tải thông tin người dùng")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Kiểm tra dữ liệu
      if (!formData.fullName || !formData.email) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc")
      }

      // Nếu là người dùng mới, yêu cầu mật khẩu
      if (isNew && !formData.password) {
        throw new Error("Vui lòng nhập mật khẩu cho người dùng mới")
      }

      // Chuẩn bị dữ liệu gửi đi
      const dataToSend = { ...formData }

      // Nếu không thay đổi mật khẩu, không gửi trường password
      if (!isNew && !formData.password) {
        delete dataToSend.password
      }

      const url = isNew ? "/api/users" : `/api/users/${userId}`
      const method = isNew ? "POST" : "PUT"

      const response = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Không thể lưu thông tin người dùng")
      }

      toast({
        title: "Thành công",
        description: isNew ? "Đã tạo người dùng mới" : "Đã cập nhật thông tin người dùng",
      })

      // Chuyển về trang danh sách
      router.push("/admin/users")
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
          <Button variant="ghost" onClick={() => router.push("/admin/users")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="ml-4 text-2xl font-bold">{isNew ? "Thêm người dùng mới" : "Chỉnh sửa người dùng"}</h1>
        </div>

        {error && (
          <div className="mb-6">
            <StatusAlert title="Lỗi" description={error} variant="destructive" />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin người dùng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Họ tên <span className="text-destructive">*</span>
                  </Label>
                  <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Số điện thoại</Label>
                  <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu {isNew && <span className="text-destructive">*</span>}</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={isNew ? "" : "Để trống nếu không thay đổi"}
                    required={isNew}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Vai trò</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Quản trị viên</SelectItem>
                      <SelectItem value="user">Người dùng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ImageUpload
                value={formData.avatarUrl}
                onChange={(url) => setFormData((prev) => ({ ...prev, avatarUrl: url }))}
                label="Ảnh đại diện"
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>
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
