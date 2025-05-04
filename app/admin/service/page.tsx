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
import { Edit, Trash2, Plus } from "lucide-react" // Removed Check, X as isActive column is removed

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface Service {
  id: string;
  name: string; // Changed from tieuDe
  slug: string;
  categoryId: string;
  description: string; // Changed from noiDung
  longdescription: string;
  image: string;
  price: number;
  salePrice: number;
  category: Category; // Added category object
  // isActive and createdAt from the original interface are not in the provided API response for the list
}

export default function ServicePage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const fetchServices = async () => {
    setLoading(true)
    try {
      const response = await fetchWithAuth("/api/services")
      if (!response.ok) throw new Error("Không thể tải danh sách dịch vụ")
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách dịch vụ",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const handleDelete = async () => {
    if (!serviceToDelete) return

    setDeleteLoading(true)
    try {
      const response = await fetchWithAuth(`/api/services/${serviceToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Không thể xóa dịch vụ")

      toast({
        title: "Thành công",
        description: "Đã xóa dịch vụ",
      })

      // Cập nhật danh sách
      setServices((prev) => prev.filter((service) => service.id !== serviceToDelete))
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa dịch vụ",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setDeleteDialogOpen(false)
      setServiceToDelete(null)
    }
  }

  const columns: ColumnDef<Service>[] = [
    {
      accessorKey: "image",
      header: "Hình ảnh",
      cell: ({ row }) => {
        const service = row.original
        // Added basic check for image URL validity
        const imageUrl = service.image && (service.image.startsWith('http') || service.image.startsWith('/')) ? service.image : "/placeholder.svg";
        return (
          <div className="relative h-10 w-16 overflow-hidden rounded-md">
            <Image src={imageUrl} alt={service.name} fill className="object-cover" /> {/* Changed alt to service.name */}
          </div>
        );
      },
    },
    {
      accessorKey: "name", // Changed from tieuDe
      header: "Tên dịch vụ", // Updated header text
    },
    {
      accessorKey: "slug",
      header: "Đường dẫn",
    },
    {
      accessorKey: "price",
      header: "Giá",
    },
    {
      accessorKey: "salePrice",
      header: "Giá khuyến mãi",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const service = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/service/${service.id}`)}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Chỉnh sửa</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setServiceToDelete(service.id)
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
          <h1 className="text-2xl font-bold">Quản lý dịch vụ</h1>
          <Button asChild>
            <Link href="/admin/service/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm dịch vụ
            </Link>
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={services}
          searchColumn="name" // Changed searchColumn to name
          searchPlaceholder="Tìm kiếm theo tên dịch vụ..." // Updated placeholder
        />
      </div>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa dịch vụ"
        description="Bạn có chắc chắn muốn xóa dịch vụ này? Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </AdminLayout>
  )
}
