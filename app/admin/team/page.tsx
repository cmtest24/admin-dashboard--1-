"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import AdminLayout from "@/components/admin-layout"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui-elements"
import { fetchWithAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2, Plus } from "lucide-react"

interface TeamMember {
  id: string
  name: string
  image: string
  description: string
  createdAt: string
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const fetchTeamMembers = async () => {
    setLoading(true)
    try {
      const response = await fetchWithAuth("/api/team")
      if (!response.ok) throw new Error("Không thể tải danh sách thành viên")
      const data = await response.json()
      setTeamMembers(data)
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách thành viên",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const handleDelete = async () => {
    if (!memberToDelete) return

    setDeleteLoading(true)
    try {
      const response = await fetchWithAuth(`/api/team/${memberToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Không thể xóa thành viên")

      toast({
        title: "Thành công",
        description: "Đã xóa thành viên",
      })

      // Cập nhật danh sách
      setTeamMembers((prev) => prev.filter((member) => member.id !== memberToDelete))
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa thành viên",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setDeleteDialogOpen(false)
      setMemberToDelete(null)
    }
  }

  const columns: ColumnDef<TeamMember>[] = [
    {
      accessorKey: "image",
      header: "Hình ảnh",
      cell: ({ row }) => {
        const member = row.original
        return member.image ? (
          <div className="relative h-10 w-10 overflow-hidden rounded-full">
            <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
          </div>
        ) : (
          <div className="h-10 w-10 rounded-full bg-muted" />
        )
      },
    },
    {
      accessorKey: "name",
      header: "Tên",
    },
    {
      accessorKey: "description",
      header: "Mô tả",
      cell: ({ row }) => {
        const description = row.getValue("description") as string
        return description.length > 100 ? description.substring(0, 100) + "..." : description
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const member = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/team/${member.id}`)}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Chỉnh sửa</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setMemberToDelete(member.id)
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
          <h1 className="text-2xl font-bold">Quản lý đội ngũ</h1>
          <Button asChild>
            <Link href="/admin/team/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm thành viên
            </Link>
          </Button>
        </div>
        <DataTable columns={columns} data={teamMembers} searchColumn="name" searchPlaceholder="Tìm kiếm theo tên..." />
      </div>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa thành viên"
        description="Bạn có chắc chắn muốn xóa thành viên này? Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </AdminLayout>
  )
}
