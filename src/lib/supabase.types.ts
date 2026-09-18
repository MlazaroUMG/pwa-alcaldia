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
          first_name: string | null
          last_name: string | null
          dpi: string | null
          phone: string | null
          address: string | null
          consent_version: string | null
          consent_accepted_at: string | null
          anonymized_at: string | null
          deactivation_requested_at: string | null
        }
        Insert: {
          id: string
          role?: string
          created_at?: string
          first_name?: string | null
          last_name?: string | null
          dpi?: string | null
          phone?: string | null
          address?: string | null
          consent_version?: string | null
          consent_accepted_at?: string | null
          anonymized_at?: string | null
          deactivation_requested_at?: string | null
        }
        Update: {
          id?: string
          role?: string
          created_at?: string
          first_name?: string | null
          last_name?: string | null
          dpi?: string | null
          phone?: string | null
          address?: string | null
          consent_version?: string | null
          consent_accepted_at?: string | null
          anonymized_at?: string | null
          deactivation_requested_at?: string | null
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
          resolution_image_url: string | null
          is_public: boolean
          resolution_summary: string | null
          resolved_at: string | null
          published_at: string | null
          latitude: number | null
          longitude: number | null
          dependency: string | null
          call_type_code: number | null
          call_type_label: string | null
          ticket_number: string | null
          discarded_at: string | null
          discarded_by: string | null
          discard_reason: string | null
          discard_note: string | null
          image_path: string | null
          resolution_image_path: string | null
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
          resolution_image_url?: string | null
          is_public?: boolean
          resolution_summary?: string | null
          resolved_at?: string | null
          published_at?: string | null
          latitude?: number | null
          longitude?: number | null
          dependency?: string | null
          call_type_code?: number | null
          call_type_label?: string | null
          ticket_number?: string | null
          discarded_at?: string | null
          discarded_by?: string | null
          discard_reason?: string | null
          discard_note?: string | null
          image_path?: string | null
          resolution_image_path?: string | null
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
          resolution_image_url?: string | null
          is_public?: boolean
          resolution_summary?: string | null
          resolved_at?: string | null
          published_at?: string | null
          latitude?: number | null
          longitude?: number | null
          dependency?: string | null
          call_type_code?: number | null
          call_type_label?: string | null
          ticket_number?: string | null
          discarded_at?: string | null
          discarded_by?: string | null
          discard_reason?: string | null
          discard_note?: string | null
          image_path?: string | null
          resolution_image_path?: string | null
        }
        Relationships: []
      }
      incident_audit_events: {
        Row: {
          id: number
          incident_id: string
          actor_id: string | null
          action: string
          reason: string | null
          note: string | null
          created_at: string
        }
        Insert: {
          id?: number
          incident_id: string
          actor_id?: string | null
          action: string
          reason?: string | null
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          incident_id?: string
          actor_id?: string | null
          action?: string
          reason?: string | null
          note?: string | null
          created_at?: string
        }
        Relationships: []
      }
      account_anonymization_requests: {
        Row: {
          id: number
          user_id: string
          reason: string | null
          created_at: string
          processed_at: string | null
        }
        Insert: {
          id?: number
          user_id: string
          reason?: string | null
          created_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          reason?: string | null
          created_at?: string
          processed_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          incident_id: string | null
          type: "incident_received" | "status_changed" | "wall_published"
          title: string
          body: string
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          incident_id?: string | null
          type: "incident_received" | "status_changed" | "wall_published"
          title: string
          body: string
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          incident_id?: string | null
          type?: "incident_received" | "status_changed" | "wall_published"
          title?: string
          body?: string
          read_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          endpoint?: string
          p256dh?: string
          auth?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      get_community_board: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          resolution_summary: string | null
          resolution_image_url: string | null
          resolved_at: string | null
          published_at: string | null
        }[]
      }
      suggest_incident_duplicates: {
        Args: {
          input_latitude: number
          input_longitude: number
          input_description: string
          input_category: string
          input_dependency: string
          input_call_type_code: number
        }
        Returns: {
          category: string
          call_type_code: number | null
          call_type_label: string | null
          approximate_distance_m: number
          text_similarity: number
          created_at: string
        }[]
      }
      unpublish_expired_wall_posts: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      discard_incidents: {
        Args: {
          incident_ids: string[]
          reason: string
          note?: string | null
        }
        Returns: number
      }
      restore_incidents: {
        Args: {
          incident_ids: string[]
        }
        Returns: number
      }
      anonymize_citizen_profile: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
