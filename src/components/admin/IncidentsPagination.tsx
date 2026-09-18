import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getVisiblePageItems } from "@/lib/pagination"

const INCIDENT_PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const

export type IncidentPageSize = (typeof INCIDENT_PAGE_SIZE_OPTIONS)[number]

interface IncidentsPaginationProps {
  page: number
  pageSize: IncidentPageSize
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: IncidentPageSize) => void
}

const pageChipClass =
  "inline-flex h-9 min-w-9 items-center justify-center rounded border border-[#e9e9e9] bg-white px-3 text-sm font-medium text-[#313131]"

/**
 * Controles de paginación del listado administrativo de incidencias.
 *
 * Muestra como máximo tres recuadros de página y un recuadro con "...".
 * El selector de resultados deja visible el número (5, 10, 25 o 50).
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
  const pageItems = getVisiblePageItems(currentPage, pageCount)

  return (
    <div className="mt-4 flex flex-col gap-3 text-sm text-[#626262] lg:flex-row lg:items-center lg:justify-between">
      <span>
        {totalItems === 0
          ? "0 incidencias"
          : `${startItem}–${endItem} de ${totalItems} incidencias`}
      </span>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#313131]">Resultados</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              onPageSizeChange(Number(value) as IncidentPageSize)
            }}
          >
            <SelectTrigger
              size="default"
              aria-label="Resultados por página"
              className="h-9 w-[5.25rem] min-w-[5.25rem] shrink-0 gap-2 overflow-visible border-[#e9e9e9] bg-white px-3 py-2 text-sm font-medium text-[#313131] *:data-[slot=select-value]:line-clamp-none *:data-[slot=select-value]:block *:data-[slot=select-value]:overflow-visible"
            >
              <SelectValue>{pageSize}</SelectValue>
            </SelectTrigger>
            <SelectContent position="popper" align="end" className="min-w-[5.25rem]">
              {INCIDENT_PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <nav className="flex items-center gap-1.5" aria-label="Paginación de incidencias">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoPrevious}
            className={`${pageChipClass} gap-1 px-3 disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:bg-gray-50`}
          >
            Anterior
          </button>

          {pageItems.map((item, index) => {
            if (item === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  aria-hidden="true"
                  className={`${pageChipClass} min-w-9 px-2`}
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
                className={
                  isCurrent
                    ? "h-9 min-w-9 rounded border border-transparent bg-[#2f80ed] px-3 text-sm font-bold text-white hover:bg-[#2f80ed] hover:text-white"
                    : `${pageChipClass} hover:bg-gray-50`
                }
              >
                {item}
              </Button>
            )
          })}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoNext}
            className={`${pageChipClass} gap-1 px-3 disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:bg-gray-50`}
          >
            Siguiente
          </button>
        </nav>
      </div>
    </div>
  )
}
