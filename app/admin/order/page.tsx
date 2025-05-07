"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin-layout"
import { DataTable } from "@/components/data-table"
import { fetchWithAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import type { ColumnDef } from "@tanstack/react-table"

interface Order {
  id: string;
  userId: string | null;
  guestEmail: string | null;
  guestPhoneNumber: string | null;
  guestFullName: string | null;
  isGuestOrder: boolean;
  status: string;
  subtotal: string;
  shippingFee: string;
  discount: string;
  total: string;
  promotionCode: string | null;
  note: string | null;
  shippingFullName: string | null;
  shippingPhone: string | null;
  shippingAddress: string | null;
  shippingWard: string | null;
  shippingDistrict: string | null;
  shippingCity: string | null;
  shippingZipCode: string | null;
  trackingNumber: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: any | null; // Define a proper type if user data is used
  items: any[]; // Define a proper type if item data is used
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchOrders = async () => {
    setLoading(true)
    try {
      // API /api/orders does not require authentication based on the provided info,
      // but using fetchWithAuth for consistency with the project structure.
      const response = await fetchWithAuth("/api/orders")
      if (!response.ok) throw new Error("Không thể tải danh sách đơn hàng")
      const data = await response.json()
      // Assuming data is an array of order objects from the API
      setOrders(data || []);
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách đơn hàng",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "guestFullName",
      header: "Tên khách hàng",
      cell: ({ row }) => row.original.guestFullName || row.original.user?.fullName || "N/A",
    },
     {
      accessorKey: "note",
      header: "Ghi chú",
      cell: ({ row }) => row.original.note || row.original.user?.note || "N/A",
    },
    {
      accessorKey: "items",
      header: "Sản phẩm",
      cell: ({ row }) => (
        <ul>
          {row.original.items.map((item, index) => (
            <li key={index}>
              {item.productName} (x{item.quantity})
            </li>
          ))}
        </ul>
      ),
    },
    {
      accessorKey: "total",
      header: "Tổng tiền",
      cell: ({ row }) => {
        const total = parseFloat(row.original.total);
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(total);
      },
    },
    {
      accessorKey: "guestPhoneNumber",
      header: "Số điện thoại",
      cell: ({ row }) => row.original.guestPhoneNumber || row.original.shippingPhone || "N/A",
    },
    {
      accessorKey: "shippingAddress",
      header: "Địa chỉ giao hàng",
      cell: ({ row }) => row.original.shippingAddress || "N/A",
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return date.toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    // Add more columns as needed based on the Order interface and desired display
  ]

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
          {/* Add button for new order if needed */}
          {/* <Button asChild>
            <Link href="/admin/orders/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm đơn hàng
            </Link>
          </Button> */}
        </div>
        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          searchColumn="guestFullName" // Or guestEmail, depending on search preference
          searchPlaceholder="Tìm kiếm theo tên hoặc email khách hàng..."
        />
      </div>
    </AdminLayout>
  )
}