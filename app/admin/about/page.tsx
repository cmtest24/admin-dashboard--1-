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

interface About {
  id: string
  title: string
  content: string
  mission: string
  vision: string
  history: string
  createdAt: string
}

export default function AboutPage() {
  const [aboutItems, setAboutItems] = useState<About[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [aboutToDelete, setAboutToDelete] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const fetchAboutItems = async () => {
    setLoading(true)
    try {
      const response = await fetchWithAuth("/api/about")
      if (!response.ok) throw new Error("Không thể tải thông tin giới thiệu")
      const data = await response.json()
      setAboutItems(data)
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin giới thiệu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAboutItems()
  }, [])

  const handleDelete = async () => {
    if (!aboutToDelete) return

    setDeleteLoading(true)
    try {
      const response = await fetchWithAuth(`/api/about/${aboutToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Không thể xóa thông tin giới thiệu")

      toast({
        title: "Thành công",
        description: "Đã xóa thông tin giới thiệu",
      })

      // Cập nhật danh sách
      setAboutItems((prev) => prev.filter((item) => item.id !== aboutToDelete))
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa thông tin giới thiệu",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setDeleteDialogOpen(false)
      setAboutToDelete(null)
    }
  }

  const columns: ColumnDef<About>[] = [
    {
      accessorKey: "title",
      header: "Tiêu đề",
    },
    {
      accessorKey: "content",
      header: "Nội dung",
      cell: ({ row }) => {
        const content = row.getValue("content") as string
        return content.length > 100 ? content.substring(0, 100) + "..." : content
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const about = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/about/${about.id}`)}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Chỉnh sửa</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setAboutToDelete(about.id)
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
          <h1 className="text-2xl font-bold">Quản lý thông tin giới thiệu</h1>
          <Button asChild>
            <Link href="/admin/about/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm thông tin
            </Link>
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={aboutItems}
          searchColumn="title"
          searchPlaceholder="Tìm kiếm theo tiêu đề..."
        />
      </div>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa thông tin giới thiệu"
        description="Bạn có chắc chắn muốn xóa thông tin này? Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </AdminLayout>
  )
}
