import { useEffect, useState } from "react"
import { Bell } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toUserFacingError } from "@/lib/network-errors"
import {
  fetchUserNotifications,
  markNotificationRead,
  type AppNotification,
} from "@/lib/notifications"
import { cn } from "@/lib/utils"

interface NotificationsMenuProps {
  variant?: "admin" | "citizen"
  onSelect: (notification: AppNotification) => void
}

function formatNotificationTime(value: string) {
  return new Date(value).toLocaleString("es-GT", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

/**
 * Menú de campana con avisos persistidos del usuario autenticado.
 *
 * El cliente solo lee y marca `read_at`. La creación ocurre en triggers de
 * PostgreSQL para no exponer INSERT ni datos sensibles del muro.
 *
 * @component
 * @module Layout
 */
export function NotificationsMenu({
  variant = "admin",
  onSelect,
}: NotificationsMenuProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadNotifications = async () => {
    const { notifications: nextNotifications, error } = await fetchUserNotifications()

    if (error) {
      setErrorMessage(toUserFacingError(error))
      setNotifications([])
      setIsLoading(false)
      return
    }

    setNotifications(nextNotifications)
    setErrorMessage(null)
    setIsLoading(false)
  }

  useEffect(() => {
    const bootstrapTimer = window.setTimeout(() => {
      void loadNotifications()
    }, 0)

    return () => window.clearTimeout(bootstrapTimer)
  }, [])

  const unreadCount = notifications.filter((item) => item.read_at === null).length

  const handleSelect = async (notification: AppNotification) => {
    if (notification.read_at === null) {
      await markNotificationRead(notification.id)
      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notification.id
            ? { ...item, read_at: new Date().toISOString() }
            : item
        )
      )
    }

    onSelect(notification)
  }

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) {
          void loadNotifications()
        }
      }}
    >
      <DropdownMenuTrigger
        type="button"
        aria-label="Notificaciones"
        title="Notificaciones"
        className={cn(
          "relative rounded-xl p-2 transition-colors",
          variant === "citizen"
            ? "rounded-lg p-1.5 text-indigo-300 hover:bg-indigo-900"
            : "text-gray-500 hover:bg-gray-100 dark:text-indigo-300 dark:hover:bg-indigo-900"
        )}
      >
        <Bell className="size-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading && (
          <p className="px-2 py-3 text-sm text-muted-foreground">Cargando avisos...</p>
        )}
        {errorMessage && (
          <p className="px-2 py-3 text-sm text-destructive">{errorMessage}</p>
        )}
        {!isLoading && !errorMessage && notifications.length === 0 && (
          <p className="px-2 py-3 text-sm text-muted-foreground">
            No hay notificaciones.
          </p>
        )}
        {notifications.map((notification) => (
          <DropdownMenuItem
            key={notification.id}
            className="flex-col items-start gap-1 py-2"
            onSelect={() => {
              void handleSelect(notification)
            }}
          >
            <span
              className={cn(
                "text-sm",
                notification.read_at ? "font-medium" : "font-semibold"
              )}
            >
              {notification.title}
            </span>
            <span className="line-clamp-2 text-xs text-muted-foreground">
              {notification.body}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {formatNotificationTime(notification.created_at)}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
