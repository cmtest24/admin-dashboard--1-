"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin-layout"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui-elements"
import { fetchWithAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2, Plus } from "lucide-react"

interface User {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  role: string
  avatarUrl?: string
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetchWithAuth("/api/users")
      if (!response.ok) throw new Error("Không thể tải danh sách người dùng")
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người dùng",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleDelete = async () => {
    if (!userToDelete) return

    setDeleteLoading(true)
    try {
      const response = await fetchWithAuth(`/api/users/${userToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Không thể xóa người dùng")

      toast({
        title: "Thành công",
        description: "Đã xóa người dùng",
      })

      // Cập nhật danh sách người dùng
      setUsers((prev) => prev.filter((user) => user.id !== userToDelete))
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa người dùng",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "fullName",
      header: "Họ tên",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phoneNumber",
      header: "Số điện thoại",
    },
    {
      accessorKey: "role",
      header: "Vai trò",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/users/${user.id}`)}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Chỉnh sửa</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setUserToDelete(user.id)
                setDeleteDialogOpen(true)
              }}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Xóa</span>
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
          <Button asChild>
            <Link href="/admin/users/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm người dùng
            </Link>
          </Button>
        </div>
        <DataTable columns={columns} data={users} searchColumn="fullName" searchPlaceholder="Tìm kiếm theo tên..." />
      </div>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa người dùng"
        description="Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </AdminLayout>
  )
}
