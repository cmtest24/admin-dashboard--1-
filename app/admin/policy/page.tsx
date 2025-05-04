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

interface Policy {
  id: string
  tieuDe: string
  noiDung: string
  slug: string
  createdAt: string
}

export default function PolicyPage() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [policyToDelete, setPolicyToDelete] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const fetchPolicies = async () => {
    setLoading(true)
    try {
      const response = await fetchWithAuth("/api/policy")
      if (!response.ok) throw new Error("Không thể tải danh sách chính sách")
      const data = await response.json()
      setPolicies(data)
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách chính sách",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPolicies()
  }, [])

  const handleDelete = async () => {
    if (!policyToDelete) return

    setDeleteLoading(true)
    try {
      const response = await fetchWithAuth(`/api/policy/${policyToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Không thể xóa chính sách")

      toast({
        title: "Thành công",
        description: "Đã xóa chính sách",
      })

      // Cập nhật danh sách
      setPolicies((prev) => prev.filter((policy) => policy.id !== policyToDelete))
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa chính sách",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setDeleteDialogOpen(false)
      setPolicyToDelete(null)
    }
  }

  const columns: ColumnDef<Policy>[] = [
    {
      accessorKey: "tieuDe",
      header: "Tiêu đề",
    },
    {
      accessorKey: "noiDung",
      header: "Nội dung",
      cell: ({ row }) => {
        const content = row.getValue("noiDung") as string
        return content.length > 100 ? content.substring(0, 100) + "..." : content
      },
    },
    {
      accessorKey: "slug",
      header: "Đường dẫn",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const policy = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/policy/${policy.id}`)}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Chỉnh sửa</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setPolicyToDelete(policy.id)
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
          <h1 className="text-2xl font-bold">Quản lý chính sách</h1>
          <Button asChild>
            <Link href="/admin/policy/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm chính sách
            </Link>
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={policies}
          searchColumn="tieuDe"
          searchPlaceholder="Tìm kiếm theo tiêu đề..."
        />
      </div>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa chính sách"
        description="Bạn có chắc chắn muốn xóa chính sách này? Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </AdminLayout>
  )
}
