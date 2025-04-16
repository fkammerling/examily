export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      exam_attempts: {
        Row: {
          answers: Json
          exam_id: string
          id: string
          score: number | null
          started_at: string
          student_id: string
          submitted_at: string | null
        }
        Insert: {
          answers: Json
          exam_id: string
          id?: string
          score?: number | null
          started_at?: string
          student_id: string
          submitted_at?: string | null
        }
        Update: {
          answers?: Json
          exam_id?: string
          id?: string
          score?: number | null
          started_at?: string
          student_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          questions: Json
          time_limit: number | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          questions: Json
          time_limit?: number | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          questions?: Json
          time_limit?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string
          id: string
          name: string
          role: string
        }
        Insert: {
          avatar_url?: string | null
          email: string
          id: string
          name: string
          role: string
        }
        Update: {
          avatar_url?: string | null
          email?: string
          id?: string
          name?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
