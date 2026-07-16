export type IncidentStatus = "Pendiente" | "En Progreso" | "Resuelto"
export type UserRole = "admin" | "citizen"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole
        }
        Insert: {
          id: string
          role?: UserRole
        }
        Update: {
          id?: string
          role?: UserRole
        }
      }
      incidents: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          category: string
          status: IncidentStatus
          created_at: string
          image_url: string | null
          is_public: boolean
          resolution_summary: string | null
          resolved_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          category: string
          status?: IncidentStatus
          created_at?: string
          image_url?: string | null
          is_public?: boolean
          resolution_summary?: string | null
          resolved_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          category?: string
          status?: IncidentStatus
          created_at?: string
          image_url?: string | null
          is_public?: boolean
          resolution_summary?: string | null
          resolved_at?: string | null
        }
      }
    }
  }
}
