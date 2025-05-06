"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin-layout"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { fetchWithAuth } from "@/lib/auth"
import { Trash2, Check, Reply } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  isRead: boolean
  isReplied: boolean
  createdAt: string
}

export default function ContactPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  const fetchContacts = async () => {
    setLoading(true)
    try {
      const res = await fetchWithAuth("/api/contact")
      if (!res.ok) throw new Error("Không thể tải danh sách liên hệ")
      const data = await res.json()
      setContacts(data)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách liên hệ",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const markAsRead = async (id: string) => {
    try {
      await fetchWithAuth(`/api/contact/${id}/read`, { method: "PUT" })
      setContacts(prev => prev.map(c => c.id === id ? { ...c, isRead: true } : c))
    } catch (err) {
      toast({ title: "Lỗi", description: "Không thể đánh dấu đã đọc", variant: "destructive" })
    }
  }

  const markAsReplied = async (id: string) => {
    try {
      await fetchWithAuth(`/api/contact/${id}/replied`, { method: "PUT" })
      setContacts(prev => prev.map(c => c.id === id ? { ...c, isReplied: true } : c))
    } catch (err) {
      toast({ title: "Lỗi", description: "Không thể đánh dấu đã trả lời", variant: "destructive" })
    }
  }

  const deleteContact = async (id: string) => {
    try {
      await fetchWithAuth(`/api/contacts/${id}`, { method: "DELETE" })
      setContacts(prev => prev.filter(c => c.id !== id))
      toast({ title: "Thành công", description: "Đã xóa liên hệ" })
    } catch (err) {
      toast({ title: "Lỗi", description: "Không thể xóa liên hệ", variant: "destructive" })
    }
  }

  const columns: ColumnDef<Contact>[] = [
    {
      accessorKey: "name",
      header: "Tên",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phoneNumber",
      header: "SĐT",
    },
    {
      accessorKey: "subject",
      header: "Chủ đề",
    },
    {
      accessorKey: "message",
      header: "Nội dung",
      cell: ({ row }) => {
        const msg = row.original.message
        return msg.length > 40 ? msg.slice(0, 40) + "..." : msg
      },
    },
    {
      accessorKey: "isRead",
      header: "Đã đọc",
      cell: ({ row }) =>
        row.original.isRead ? (
          <Badge className="bg-green-500 hover:bg-green-600">Đã đọc</Badge>
        ) : (
          <Badge variant="outline">Chưa đọc</Badge>
        ),
    },
    {
      accessorKey: "isReplied",
      header: "Đã trả lời",
      cell: ({ row }) =>
        row.original.isReplied ? (
          <Badge className="bg-blue-500 hover:bg-blue-600">Đã trả lời</Badge>
        ) : (
          <Badge variant="outline">Chưa trả lời</Badge>
        ),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày gửi",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleString("vi-VN"),
    },
    {
      id: "actions",
      header: "Hành động",
      cell: ({ row }) => {
        const contact = row.original
        return (
          <div className="flex gap-2">
            {!contact.isRead && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => markAsRead(contact.id)}
              >
                <Check className="h-4 w-4" />
                <span className="sr-only">Đánh dấu đã đọc</span>
              </Button>
            )}
            {!contact.isReplied && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => markAsReplied(contact.id)}
              >
                <Reply className="h-4 w-4" />
                <span className="sr-only">Đánh dấu đã trả lời</span>
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => deleteContact(contact.id)}
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
          <h1 className="text-2xl font-bold">Quản lý liên hệ</h1>
          <Button variant="destructive" onClick={() => router.push("/admin/contact/trash")}>
            <Trash2 className="mr-2 h-4 w-4" /> Thùng rác
          </Button>
        </div>
        <DataTable columns={columns} data={contacts} searchPlaceholder="Tìm kiếm..." />
      </div>
    </AdminLayout>
  )
}
