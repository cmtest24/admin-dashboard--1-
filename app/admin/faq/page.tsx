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

interface FAQ {
  id: string
  tieuDe: string
  noiDung: string
  slug: string
  createdAt: string
}

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [faqToDelete, setFaqToDelete] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const fetchFAQs = async () => {
    setLoading(true)
    try {
      const response = await fetchWithAuth("/api/faq")
      if (!response.ok) throw new Error("Không thể tải danh sách câu hỏi")
      const data = await response.json()
      setFaqs(data)
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách câu hỏi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFAQs()
  }, [])

  const handleDelete = async () => {
    if (!faqToDelete) return

    setDeleteLoading(true)
    try {
      const response = await fetchWithAuth(`/api/faq/${faqToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Không thể xóa câu hỏi")

      toast({
        title: "Thành công",
        description: "Đã xóa câu hỏi",
      })

      // Cập nhật danh sách câu hỏi
      setFaqs((prev) => prev.filter((faq) => faq.id !== faqToDelete))
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa câu hỏi",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setDeleteDialogOpen(false)
      setFaqToDelete(null)
    }
  }

  const columns: ColumnDef<FAQ>[] = [
    {
      accessorKey: "tieuDe",
      header: "Câu hỏi",
    },
    {
      accessorKey: "noiDung",
      header: "Câu trả lời",
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
        const faq = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/faq/${faq.id}`)}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Chỉnh sửa</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setFaqToDelete(faq.id)
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
          <h1 className="text-2xl font-bold">Câu hỏi thường gặp</h1>
          <Button asChild>
            <Link href="/admin/faq/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm câu hỏi
            </Link>
          </Button>
        </div>
        <DataTable columns={columns} data={faqs} searchColumn="tieuDe" searchPlaceholder="Tìm kiếm theo câu hỏi..." />
      </div>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa câu hỏi"
        description="Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </AdminLayout>
  )
}
