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

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  price: number;
  salePrice: number;
  imageUrl: string | null;
  additionalImages: string[];
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const fetchProducts = async () => {
    setLoading(true)
    try {
      // Removed limit=100 parameter to see if it resolves the 400 error
      const response = await fetchWithAuth("/api/products")
      if (!response.ok) throw new Error("Không thể tải danh sách sản phẩm")
      const data = await response.json()
      // Assuming data.products is an array of product objects from the API
      const productsData = data.products || []; // Handle case where products might be missing
      // Map and convert price/salePrice to numbers for frontend use
      const formattedProducts = productsData.map((product: any) => ({
        ...product,
        price: parseFloat(product.price), // Convert string price to number
        salePrice: parseFloat(product.salePrice), // Convert string salePrice to number
        // Ensure imageUrl is string or null
        imageUrl: product.imageUrl === null ? null : String(product.imageUrl),
      }));
      setProducts(formattedProducts);
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách sản phẩm",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = async () => {
    if (!productToDelete) return

    setDeleteLoading(true)
    try {
      const response = await fetchWithAuth(`/api/products/${productToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Không thể xóa sản phẩm")

      toast({
        title: "Thành công",
        description: "Đã xóa sản phẩm",
      })

      // Cập nhật danh sách sản phẩm
      setProducts((prev) => prev.filter((product) => product.id !== productToDelete))
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa sản phẩm",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "imageUrl",
      header: "Hình ảnh",
      cell: ({ row }) => {
        const product = row.original
        return product.imageUrl ? (
          <div className="relative h-10 w-10 overflow-hidden rounded-md">
            <Image src={getFullImageUrl(product.imageUrl)} alt={product.name} fill className="object-cover" />
          </div>
        ) : (
          <div className="h-10 w-10 rounded-md bg-muted" />
        )
      },
    },
    {
      accessorKey: "name",
      header: "Tên sản phẩm",
    },
    {
      accessorKey: "price",
      header: "Giá",
      cell: ({ row }) => formatPrice(row.original.price),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/products/${product.id}`)}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Chỉnh sửa</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setProductToDelete(product.id)
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
          <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm sản phẩm
            </Link>
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={products}
          searchColumn="name"
          searchPlaceholder="Tìm kiếm theo tên sản phẩm..."
        />
      </div>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa sản phẩm"
        description="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </AdminLayout>
  )
}
