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

interface StoreInfo {
  id: string
  logo: string
  favicon: string
  facebook: string
  youtube: string
  googleMap: string
  hotline: string
  zalo: string
  workingHours: string
}

export default function StoreInfoPage() {
  const [storeInfos, setStoreInfos] = useState<StoreInfo[]>([])
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [storeInfoToDelete, setStoreInfoToDelete] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const fetchStoreInfos = async () => {
    setLoading(true)
    try {
      const response = await fetchWithAuth("/api/storeinfo")
      if (!response.ok) throw new Error("Không thể tải thông tin cửa hàng")
      const data = await response.json()
      setStoreInfos(data)
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin cửa hàng",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStoreInfo = async () => {
    setLoading(true)
    try {
      const response = await fetchWithAuth("/api/store-info")
      if (!response.ok) throw new Error("Không thể tải thông tin cửa hàng")
      const data = await response.json()
      setStoreInfo(data)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin cửa hàng",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStoreInfos()
    fetchStoreInfo()
  }, [])

  const handleDelete = async () => {
    if (!storeInfoToDelete) return

    setDeleteLoading(true)
    try {
      const response = await fetchWithAuth(`/api/storeinfo/${storeInfoToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Không thể xóa thông tin cửa hàng")

      toast({
        title: "Thành công",
        description: "Đã xóa thông tin cửa hàng",
      })

      // Cập nhật danh sách
      setStoreInfos((prev) => prev.filter((info) => info.id !== storeInfoToDelete))
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa thông tin cửa hàng",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setDeleteDialogOpen(false)
      setStoreInfoToDelete(null)
    }
  }

  const columns: ColumnDef<StoreInfo>[] = [
    {
      accessorKey: "address",
      header: "Địa chỉ",
    },
    {
      accessorKey: "phone",
      header: "Số điện thoại",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "workingHours",
      header: "Giờ làm việc",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const storeInfo = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/storeinfo/${storeInfo.id}`)}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Chỉnh sửa</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setStoreInfoToDelete(storeInfo.id)
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
          <h1 className="text-2xl font-bold">Quản lý thông tin cửa hàng</h1>
          <Button asChild>
            <Link href={`/admin/storeinfo/${storeInfo?.id || "new"}`}>
              <Edit className="mr-2 h-4 w-4" />
              {storeInfo ? "Chỉnh sửa" : "Thêm thông tin"}
            </Link>
          </Button>
        </div>
        {loading ? (
          <div>Đang tải...</div>
        ) : storeInfo ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="mb-2 font-semibold">Logo:</div>
              <img src={storeInfo.logo} alt="Logo" className="h-16 rounded border" />
              <div className="mb-2 font-semibold mt-4">Favicon:</div>
              <img src={storeInfo.favicon} alt="Favicon" className="h-8 w-8 rounded border" />
              <div className="mb-2 font-semibold mt-4">Hotline:</div>
              <div>{storeInfo.hotline}</div>
              <div className="mb-2 font-semibold mt-4">Zalo:</div>
              <div>{storeInfo.zalo}</div>
              <div className="mb-2 font-semibold mt-4">Giờ làm việc:</div>
              <div>{storeInfo.workingHours}</div>
            </div>
            <div>
              <div className="mb-2 font-semibold">Facebook:</div>
              <a href={storeInfo.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{storeInfo.facebook}</a>
              <div className="mb-2 font-semibold mt-4">YouTube:</div>
              <a href={storeInfo.youtube} target="_blank" rel="noopener noreferrer" className="text-red-600 underline">{storeInfo.youtube}</a>
              <div className="mb-2 font-semibold mt-4">Google Map:</div>
              <div dangerouslySetInnerHTML={{ __html: storeInfo.googleMap }} />
            </div>
          </div>
        ) : (
          <div>Chưa có thông tin cửa hàng.</div>
        )}
      </div>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa thông tin cửa hàng"
        description="Bạn có chắc chắn muốn xóa thông tin cửa hàng này? Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </AdminLayout>
  )
}
