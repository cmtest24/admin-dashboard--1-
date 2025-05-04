"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin-layout"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui-elements"
import { fetchWithAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import type { ColumnDef, PaginationState, SortingState, ColumnFiltersState } from "@tanstack/react-table"
import { Edit, Trash2, Plus, Youtube } from "lucide-react"

interface Video {
  id: string
  tieuDe: string
  linkYtb: string
  createdAt: string
  updatedAt: string
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [totalVideos, setTotalVideos] = useState(0)

  // State for pagination
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // State for sorting
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ])

  // State for search (using ColumnFiltersState for DataTable compatibility)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const searchQuery = (columnFilters.find(f => f.id === 'tieuDe')?.value as string) || '';


  const router = useRouter()
  const { toast } = useToast()

  const fetchVideos = async (
    pageIndex: number,
    pageSize: number,
    search: string,
    sortBy: string,
    sortOrder: "asc" | "desc"
  ) => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: (pageIndex + 1).toString(),
        limit: pageSize.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder.toUpperCase(),
      })

      if (search) {
        queryParams.append("search", search)
      }

      const url = `/api/videos?${queryParams.toString()}`
      const response = await fetchWithAuth(url)

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể tải danh sách video");
      }

      const data = await response.json()
      setVideos(data.videos)
      setTotalVideos(data.total)

    } catch (error: any) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách video",
        variant: "destructive",
      })
      setVideos([]);
      setTotalVideos(0);
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const sortBy = sorting.length > 0 ? sorting[0].id : "createdAt";
    const sortOrder = sorting.length > 0 && sorting[0].desc ? "desc" : "asc";

    // Fetch immediately on pagination, sorting, or search changes
    fetchVideos(pagination.pageIndex, pagination.pageSize, searchQuery, sortBy, sortOrder as "asc" | "desc");

  }, [pagination, sorting, searchQuery]) // Removed debouncedFetchVideos from dependencies

  const handleDelete = async () => {
    if (!videoToDelete) return

    setDeleteLoading(true)
    try {
      const response = await fetchWithAuth(`/api/videos/${videoToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || "Không thể xóa video");
      }

      toast({
        title: "Thành công",
        description: "Đã xóa video",
      })

      // After deletion, refetch videos to update the list and total count
      const sortBy = sorting.length > 0 ? sorting[0].id : "createdAt";
      const sortOrder = sorting.length > 0 && sorting[0].desc ? "desc" : "asc";
      fetchVideos(pagination.pageIndex, pagination.pageSize, searchQuery, sortBy, sortOrder as "asc" | "desc");

    } catch (error: any) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa video",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setDeleteDialogOpen(false)
      setVideoToDelete(null)
    }
  }

  // Hàm lấy ID video từ URL YouTube
  const getYoutubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const columns: ColumnDef<Video>[] = [
    {
      accessorKey: "tieuDe",
      header: "Tiêu đề",
      enableSorting: true, // Enable sorting for this column
    },
    {
      accessorKey: "linkYtb",
      header: "Link YouTube",
      cell: ({ row }) => {
        const link = row.getValue("linkYtb") as string
        return (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:underline"
          >
            <Youtube className="mr-2 h-4 w-4" />
            {link.length > 30 ? link.substring(0, 30) + "..." : link}
          </a>
        )
      },
      enableSorting: false, // Disable sorting for this column
    },
    {
      id: "thumbnail",
      header: "Hình thu nhỏ",
      cell: ({ row }) => {
        const link = row.original.linkYtb
        const videoId = getYoutubeVideoId(link)

        if (!videoId) return <div>Link không hợp lệ</div>

        return (
          <div className="relative h-16 w-28 overflow-hidden rounded-md">
            <img
              src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
              alt="Thumbnail"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Youtube className="h-8 w-8 text-red-600" />
            </div>
          </div>
        )
      },
      enableSorting: false, // Disable sorting for this column
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const video = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/videos/${video.id}`)}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Chỉnh sửa</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setVideoToDelete(video.id)
                setDeleteDialogOpen(true)
              }}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Xóa</span>
            </Button>
          </div>
        )
      },
      enableSorting: false, // Disable sorting for this column
    },
  ]

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Quản lý video</h1>
          <Button asChild>
            <Link href="/admin/videos/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm video
            </Link>
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={videos}
          searchColumn="tieuDe"
          searchPlaceholder="Tìm kiếm theo tiêu đề..."
          manualPagination={true}
          manualFiltering={true}
          manualSorting={true}
          pageCount={Math.ceil(totalVideos / pagination.pageSize)}
          state={{
            pagination,
            sorting,
            columnFilters,
          }}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          onColumnFiltersChange={setColumnFilters}
          loading={loading}
        />
      </div>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa video"
        description="Bạn có chắc chắn muốn xóa video này? Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </AdminLayout>
  )
}
