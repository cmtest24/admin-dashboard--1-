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

interface Post {
  id: string
  title: string
  content: string
  slug: string
  imageUrl: string
  isPublished: boolean
  createdAt: string // Keeping createdAt as it's likely returned by the GET API
  summary?: string // Adding optional fields from the schema that might be returned
  tags?: string[]
  authorName?: string
}

export default function PostPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const response = await fetchWithAuth("/api/posts") // Use /api/posts as per API doc
      if (!response.ok) throw new Error("Không thể tải danh sách bài viết")
      const data = await response.json()
      // The API returns an object with a 'posts' array and 'total' count
      setPosts(data.posts) // Extract the posts array
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách bài viết",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleDelete = async () => {
    if (!postToDelete) return

    setDeleteLoading(true)
    try {
      const response = await fetchWithAuth(`/api/post/${postToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Không thể xóa bài viết")

      toast({
        title: "Thành công",
        description: "Đã xóa bài viết",
      })

      // Cập nhật danh sách
      setPosts((prev) => prev.filter((post) => post.id !== postToDelete))
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa bài viết",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setDeleteDialogOpen(false)
      setPostToDelete(null)
    }
  }

  const columns: ColumnDef<Post>[] = [
    {
      accessorKey: "imageUrl",
      header: "Hình ảnh",
      cell: ({ row }) => {
        const post = row.original
        return post.imageUrl ? (
          <div className="relative h-10 w-16 overflow-hidden rounded-md">
            <Image src={getFullImageUrl(post.imageUrl)} alt={post.title} fill className="object-cover" />
          </div>
        ) : (
          <div className="h-10 w-16 rounded-md bg-muted" />
        )
      },
    },
    {
      accessorKey: "title",
      header: "Tiêu đề",
    },
    {
      accessorKey: "slug",
      header: "Đường dẫn",
    },
    {
      accessorKey: "isPublished",
      header: "Trạng thái",
      cell: ({ row }) => {
        const isPublished = row.original.isPublished
        return isPublished ? (
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
        const post = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/post/${post.id}`)}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Chỉnh sửa</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setPostToDelete(post.id)
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
          <h1 className="text-2xl font-bold">Quản lý bài viết</h1>
          <Button asChild>
            <Link href="/admin/post/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm bài viết
            </Link>
          </Button>
        </div>
        <DataTable columns={columns} data={posts} searchColumn="title" searchPlaceholder="Tìm kiếm theo tiêu đề..." />
      </div>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa bài viết"
        description="Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </AdminLayout>
  )
}
