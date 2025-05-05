"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { ConfirmDialog } from "@/components/ui-elements";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin-layout";

interface Store {
  id: string;
  fullName: string;
  phoneNumber: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  zipCode: string;
  isDefault: boolean;
}

export default function StoreListPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const fetchStores = async () => {
    try {
      const response = await fetch("/api/stores");
      const data = await response.json();
      setStores(data);
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách địa chỉ",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleDelete = async () => {
    if (!storeToDelete) return;
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/stores/${storeToDelete}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Không thể xóa địa chỉ");
      toast({ title: "Thành công", description: "Đã xóa địa chỉ" });
      setStores(prev => prev.filter(store => store.id !== storeToDelete));
    } catch (error) {
      console.error(error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa địa chỉ",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setStoreToDelete(null);
    }
  };

  const handleEdit = (store: Store) => {
    setCurrentStore(store);
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setShowCreateModal(true);
  };

  const columns = [
    { accessorKey: "fullName", header: "Tên cửa hàng" },
    { accessorKey: "phoneNumber", header: "Số điện thoại" },
    { accessorKey: "street", header: "Đường" },
    { accessorKey: "ward", header: "Phường/Xã" },
    { accessorKey: "district", header: "Quận/Huyện" },
    { accessorKey: "city", header: "Thành phố" },
    { accessorKey: "zipCode", header: "Mã bưu điện" },
    { accessorKey: "isDefault", header: "Mặc định" },
    {
      id: "actions",
      header: "Hành động",
      cell: ({ row }) => {
        const store = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(store)}>
              <FaEdit className="h-4 w-4" />
              <span className="sr-only">Chỉnh sửa</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setStoreToDelete(store.id);
                setDeleteDialogOpen(true);
              }}
            >
              <FaTrashAlt className="h-4 w-4" />
              <span className="sr-only">Xóa</span>
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Quản lý cửa hàng</h1>
          <Button variant="primary" onClick={handleAdd}>
            <FaPlus className="mr-2 h-4 w-4" />
            Thêm cửa hàng
          </Button>
        </div>

        <DataTable columns={columns} data={stores} />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Xóa cửa hàng"
          description="Bạn có chắc chắn muốn xóa cửa hàng này? Hành động này không thể hoàn tác."
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      </div>
    </AdminLayout>
  );
}