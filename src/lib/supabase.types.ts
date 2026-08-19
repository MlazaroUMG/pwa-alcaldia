export type IncidentStatus = "Pendiente" | "En Progreso" | "Resuelto"
export type UserRole = "admin" | "citizen"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: string
          created_at: string
          dpi: string | null
          phone: string | null
          address: string | null
        }
        Insert: {
          id: string
          role?: string
          created_at?: string
          dpi?: string | null
          phone?: string | null
          address?: string | null
        }
        Update: {
          id?: string
          role?: string
          created_at?: string
          dpi?: string | null
          phone?: string | null
          address?: string | null
        }
        Relationships: []
      }
      incidents: {
        Row: {
          id: string
          user_id: string | null
          title: string
          description: string
          category: string
          status: IncidentStatus
          created_at: string
          image_url: string | null
          is_public: boolean
          resolution_summary: string | null
          resolved_at: string | null
          latitude: number | null
          longitude: number | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          description: string
          category: string
          status?: IncidentStatus
          created_at?: string
          image_url?: string | null
          is_public?: boolean
          resolution_summary?: string | null
          resolved_at?: string | null
          latitude?: number | null
          longitude?: number | null
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          description?: string
          category?: string
          status?: IncidentStatus
          created_at?: string
          image_url?: string | null
          is_public?: boolean
          resolution_summary?: string | null
          resolved_at?: string | null
          latitude?: number | null
          longitude?: number | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
