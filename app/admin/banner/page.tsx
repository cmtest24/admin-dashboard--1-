"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { API_BASE_URL } from "@/lib/config"

function getFullImageUrl(url: string | undefined): string {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/public/")) return `${API_BASE_URL}${url}`;
  return url;
}
import AdminLayout from "@/components/admin-layout"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui-elements"
import { fetchWithAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2, Plus, Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Banner {
  id: string
  imageUrl: string
  shortTitle: string
  longTitle: string
  link: string
  order: number
  createdAt: string
}

export default function BannerPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const fetchBanners = async () => {
    setLoading(true)
    try {
      const response = await fetchWithAuth("/api/banners")
      if (!response.ok) throw new Error("Không thể tải danh sách banner")
      const data = await response.json()
      setBanners(data)
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách banner",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  const handleDelete = async () => {
    if (!bannerToDelete) return

    setDeleteLoading(true)
    try {
      const response = await fetchWithAuth(`/api/banners/${bannerToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Không thể xóa banner")

      toast({
        title: "Thành công",
        description: "Đã xóa banner",
      })

      // Cập nhật danh sách
      setBanners((prev) => prev.filter((banner) => banner.id !== bannerToDelete))
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa banner",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setDeleteDialogOpen(false)
      setBannerToDelete(null)
    }
  }

  const columns: ColumnDef<Banner>[] = [
    {
      accessorKey: "image",
      header: "Hình ảnh",
      cell: ({ row }) => {
        const banner = row.original
        return banner.imageUrl ? (
          <div className="relative h-16 w-32 overflow-hidden rounded-md">
            <Image src={getFullImageUrl(banner.imageUrl)} alt="Banner" fill className="object-cover" />
          </div>
        ) : (
          <div className="h-16 w-32 rounded-md bg-muted" />
        )
      },
    },
    {
      accessorKey: "link",
      header: "Đường dẫn",
      cell: ({ row }) => {
        const link = row.getValue("link") as string
        return link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {link.length > 30 ? link.substring(0, 30) + "..." : link}
          </a>
        ) : (
          <span className="text-muted-foreground">Không có</span>
        )
      },
    },
    {
      accessorKey: "sortOrder",
      header: "Thứ tự",
    },
    // {
    //   accessorKey: "isActive",
    //   header: "Trạng thái",
    //   cell: ({ row }) => {
    //     const isActive = row.original.isActive
    //     return isActive ? (
    //       <Badge className="bg-green-500 hover:bg-green-600">
    //         <Check className="mr-1 h-3 w-3" /> Hoạt động
    //       </Badge>
    //     ) : (
    //       <Badge variant="outline">
    //         <X className="mr-1 h-3 w-3" /> Ẩn
    //       </Badge>
    //     )
    //   },
    // },
    {
      id: "actions",
      cell: ({ row }) => {
        const banner = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/banner/${banner.id}`)}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Chỉnh sửa</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setBannerToDelete(banner.id)
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
          <h1 className="text-2xl font-bold">Quản lý banner</h1>
          <Button asChild>
            <Link href="/admin/banner/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm banner
            </Link>
          </Button>
        </div>
        <DataTable columns={columns} data={banners} searchPlaceholder="Tìm kiếm..." />
      </div>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa banner"
        description="Bạn có chắc chắn muốn xóa banner này? Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </AdminLayout>
  )
}
