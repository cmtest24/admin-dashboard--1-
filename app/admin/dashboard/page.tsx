import AdminLayout from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShoppingBag, FileText, Video } from "lucide-react"

export default function DashboardPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Tổng số người dùng trong hệ thống</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sản phẩm</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Tổng số sản phẩm trong hệ thống</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bài viết</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Tổng số bài viết trong hệ thống</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Videos</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Tổng số video trong hệ thống</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Chào mừng đến với trang quản trị</CardTitle>
              <CardDescription>
                Đây là trang quản trị của hệ thống. Bạn có thể quản lý tất cả nội dung của website từ đây.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Sử dụng menu bên trái để điều hướng đến các phần quản lý khác nhau.</p>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Hướng dẫn nhanh</CardTitle>
              <CardDescription>Các thao tác cơ bản trong hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>• Quản lý người dùng: Thêm, sửa, xóa người dùng</li>
                <li>• Quản lý sản phẩm: Thêm, sửa, xóa sản phẩm và danh mục</li>
                <li>• Quản lý nội dung: Cập nhật các nội dung trên website</li>
                <li>• Cài đặt: Thay đổi thông tin cửa hàng</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
