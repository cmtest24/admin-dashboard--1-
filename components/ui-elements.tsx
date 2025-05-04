"use client"

import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface StatusAlertProps {
  title: string
  description: string
  variant: "default" | "destructive" | "success" | "info"
}

export function StatusAlert({ title, description, variant }: StatusAlertProps) {
  const icons = {
    default: <Info className="h-4 w-4" />,
    destructive: <XCircle className="h-4 w-4" />,
    success: <CheckCircle2 className="h-4 w-4" />,
    info: <AlertCircle className="h-4 w-4" />,
  }

  return (
    <Alert variant={variant === "success" || variant === "info" ? "default" : variant}>
      {icons[variant]}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  )
}

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
