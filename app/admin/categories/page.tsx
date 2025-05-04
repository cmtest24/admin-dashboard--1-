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
import { Edit, Trash2, Plus, Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Category {
  id: string
  name: string
  slug: string
  type: string
  description: string
  isActive: boolean
  sortOrder: number
  level: number
  createdAt: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await fetchWithAuth("/api/categories")
      if (!response.ok) throw new Error("Không thể tải danh sách danh mục")
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách danh mục",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleDelete = async () => {
    if (!categoryToDelete) return

    setDeleteLoading(true)
    try {
      const response = await fetchWithAuth(`/api/categories/${categoryToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Không thể xóa danh mục")

      toast({
        title: "Thành công",
        description: "Đã xóa danh mục",
      })

      // Cập nhật danh sách danh mục
      setCategories((prev) => prev.filter((category) => category.id !== categoryToDelete))
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa danh mục",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: "Tên danh mục",
    },
    {
      accessorKey: "type",
      header: "Loại",
    },
    {
      accessorKey: "sortOrder",
      header: "Thứ tự",
    },
    {
      accessorKey: "isActive",
      header: "Trạng thái",
      cell: ({ row }) => {
        const isActive = row.original.isActive
        return isActive ? (
          <Badge className="bg-green-500 hover:bg-green-600">
            <Check className="mr-1 h-3 w-3" /> Hoạt động
          </Badge>
        ) : (
          <Badge variant="outline">
            <X className="mr-1 h-3 w-3" /> Ẩn
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const category = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/categories/${category.id}`)}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Chỉnh sửa</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setCategoryToDelete(category.id)
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
          <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
          <Button asChild>
            <Link href="/admin/categories/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm danh mục
            </Link>
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={categories}
          searchColumn="name"
          searchPlaceholder="Tìm kiếm theo tên danh mục..."
        />
      </div>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa danh mục"
        description="Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác và có thể ảnh hưởng đến các sản phẩm liên quan."
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </AdminLayout>
  )
}
