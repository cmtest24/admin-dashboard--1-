"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Tag,
  ShoppingBag,
  Video,
  HelpCircle,
  Info,
  FileText,
  Users2,
  Briefcase,
  FileEdit,
  ImageIcon,
  Store,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Phone,
  MapPin 
} from "lucide-react"
import { isAuthenticated, logout } from "@/lib/auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface NavItemProps {
  href: string
  icon: React.ReactNode
  title: string
  isActive: boolean
  onClick?: () => void
}

function NavItem({ href, icon, title, isActive, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
        isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {icon}
      <span>{title}</span>
    </Link>
  )
}

interface NavGroupProps {
  title: string
  children: React.ReactNode
}

function NavGroup({ title, children }: NavGroupProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        {title}
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {isOpen && <div className="ml-4 space-y-1">{children}</div>}
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Kiểm tra xác thực
    if (mounted && !isAuthenticated() && !pathname.includes("/login")) {
      router.push("/login")
    }
  }, [mounted, pathname, router])

  if (!mounted) return null

  const closeSheet = () => {
    setOpen(false)
  }

  const navigation = (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="space-y-4 py-4">
        <NavItem
          href="/admin/dashboard"
          icon={<LayoutDashboard className="h-5 w-5" />}
          title="Tổng quan"
          isActive={pathname === "/admin/dashboard"}
          onClick={closeSheet}
        />

        <NavGroup title="Quản lý người dùng">
          <NavItem
            href="/admin/users"
            icon={<Users className="h-5 w-5" />}
            title="Người dùng"
            isActive={pathname.includes("/admin/users")}
            onClick={closeSheet}
          />
        </NavGroup>

        <NavGroup title="Quản lý sản phẩm">
          <NavItem
            href="/admin/categories"
            icon={<Tag className="h-5 w-5" />}
            title="Danh mục"
            isActive={pathname.includes("/admin/categories")}
            onClick={closeSheet}
          />
          <NavItem
            href="/admin/products"
            icon={<ShoppingBag className="h-5 w-5" />}
            title="Sản phẩm"
            isActive={pathname.includes("/admin/products")}
            onClick={closeSheet}
          />
        </NavGroup>

        <NavGroup title="Quản lý nội dung">
          <NavItem
            href="/admin/videos"
            icon={<Video className="h-5 w-5" />}
            title="Videos"
            isActive={pathname.includes("/admin/videos")}
            onClick={closeSheet}
          />
          <NavItem
            href="/admin/faq"
            icon={<HelpCircle className="h-5 w-5" />}
            title="Câu hỏi thường gặp"
            isActive={pathname.includes("/admin/faq")}
            onClick={closeSheet}
          />
          <NavItem
            href="/admin/about"
            icon={<Info className="h-5 w-5" />}
            title="Giới thiệu"
            isActive={pathname.includes("/admin/about")}
            onClick={closeSheet}
          />
          <NavItem
            href="/admin/policy"
            icon={<FileText className="h-5 w-5" />}
            title="Chính sách"
            isActive={pathname.includes("/admin/policy")}
            onClick={closeSheet}
          />
          <NavItem
            href="/admin/team"
            icon={<Users2 className="h-5 w-5" />}
            title="Đội ngũ"
            isActive={pathname.includes("/admin/team")}
            onClick={closeSheet}
          />
          <NavItem
            href="/admin/service"
            icon={<Briefcase className="h-5 w-5" />}
            title="Dịch vụ"
            isActive={pathname.includes("/admin/service")}
            onClick={closeSheet}
          />
          <NavItem
            href="/admin/post"
            icon={<FileEdit className="h-5 w-5" />}
            title="Bài viết"
            isActive={pathname.includes("/admin/post")}
            onClick={closeSheet}
          />
          <NavItem
            href="/admin/banner"
            icon={<ImageIcon className="h-5 w-5" />}
            title="Banner"
            isActive={pathname.includes("/admin/banner")}
            onClick={closeSheet}
          />
            <NavItem
            href="/admin/contact"
            icon={<Phone  className="h-5 w-5" />}
            title="Liên Hệ "
            isActive={pathname.includes("/admin/contact")}
            onClick={closeSheet}
          />
           <NavItem
            href="/admin/order"
            icon={<ShoppingBag  className="h-5 w-5" />}
            title="Đơn Hàng "
            isActive={pathname.includes("/admin/order")}
            onClick={closeSheet}
          />
        </NavGroup>

        <NavGroup title="Cài đặt">
          <NavItem
            href="/admin/storeinfo"
            icon={<Store className="h-5 w-5" />}
            title="Thông tin cửa hàng"
            isActive={pathname.includes("/admin/storeinfo")}
            onClick={closeSheet}
          />
        </NavGroup>

        <Separator className="my-4" />

        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => {
            closeSheet()
            logout()
          }}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Đăng xuất
        </Button>
      </div>
    </ScrollArea>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Mở menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 sm:max-w-xs">
            <div className="flex h-16 items-center border-b px-4">
              <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold" onClick={closeSheet}>
                <LayoutDashboard className="h-6 w-6" />
                <span>Trang Quản Trị</span>
              </Link>
              <Button variant="ghost" size="icon" className="ml-auto" onClick={closeSheet}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            {navigation}
          </SheetContent>
        </Sheet>
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold md:hidden">
          <LayoutDashboard className="h-6 w-6" />
          <span>Trang Quản Trị</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Avatar>
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r md:block">
          <div className="flex h-16 items-center border-b px-4">
            <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
              <LayoutDashboard className="h-6 w-6" />
              <span>Trang Quản Trị</span>
            </Link>
          </div>
          <div className="p-4">{navigation}</div>
        </aside>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
