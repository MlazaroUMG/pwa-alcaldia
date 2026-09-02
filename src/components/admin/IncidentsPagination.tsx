import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const INCIDENT_PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const

export type IncidentPageSize = (typeof INCIDENT_PAGE_SIZE_OPTIONS)[number]

interface IncidentsPaginationProps {
  page: number
  pageSize: IncidentPageSize
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: IncidentPageSize) => void
}

function getPageItems(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  if (current <= 3) {
    return [1, 2, 3, "ellipsis", total]
  }

  if (current >= total - 2) {
    return [1, "ellipsis", total - 2, total - 1, total]
  }

  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total]
}

/**
 * Controles de paginación del listado administrativo de incidencias.
 *
 * Reproduce el estilo V3 del mockup (Anterior/Siguiente textuales y página
 * activa en squircle azul) y el selector de resultados por página.
 *
 * @component
 * @module Admin
 */
export function IncidentsPagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: IncidentsPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize))
  const currentPage = Math.min(Math.max(page, 1), pageCount)
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)
  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < pageCount
  const pageItems = getPageItems(currentPage, pageCount)

  return (
    <div className="mt-4 flex flex-col gap-3 text-sm text-gray-500 lg:flex-row lg:items-center lg:justify-between">
      <span>
        {totalItems === 0
          ? "0 incidencias"
          : `${startItem}–${endItem} de ${totalItems} incidencias`}
      </span>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#333]">Resultados</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              onPageSizeChange(Number(value) as IncidentPageSize)
            }}
          >
            <SelectTrigger className="h-[42px] w-[70px] rounded-lg border-[#ddd] bg-white px-[15px] py-2 text-sm font-semibold text-[#333]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INCIDENT_PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <nav className="flex items-center gap-[5px]" aria-label="Paginación de incidencias">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoPrevious}
            className="h-8 rounded-lg px-1 text-[13px] font-semibold disabled:cursor-not-allowed disabled:text-[#ccc] enabled:text-[#333] enabled:hover:bg-gray-50"
          >
            Anterior
          </button>

          {pageItems.map((item, index) => {
            if (item === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="flex size-8 items-center justify-center rounded-lg text-[13px] font-semibold text-[#333]"
                >
                  ...
                </span>
              )
            }

            const isCurrent = item === currentPage

            return (
              <Button
                key={item}
                type="button"
                size="sm"
                variant="ghost"
                aria-current={isCurrent ? "page" : undefined}
                onClick={() => onPageChange(item)}
                className={`size-8 rounded-lg p-0 text-[13px] font-semibold ${
                  isCurrent
                    ? "bg-[#2f80ed] text-white hover:bg-[#2f80ed] hover:text-white"
                    : "border border-[#f1f1f1] bg-white text-[#333] hover:bg-gray-50"
                }`}
              >
                {item}
              </Button>
            )
          })}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoNext}
            className="h-8 rounded-lg px-1 text-[13px] font-semibold disabled:cursor-not-allowed disabled:text-[#ccc] enabled:text-[#333] enabled:hover:bg-gray-50"
          >
            Siguiente
          </button>
        </nav>
      </div>
    </div>
  )
}
