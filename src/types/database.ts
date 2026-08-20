/**
 * Stub manual — substituir pelo output real de:
 *   npx supabase gen types typescript --project-id <id> > src/types/database.ts
 * assim que o projeto Supabase existir e as migrations forem aplicadas.
 * As formas abaixo espelham supabase/migrations/*.sql para tipar os
 * clientes enquanto isso. Cada tabela precisa de `Relationships: []` (ou das
 * FKs reais) porque é isso que o postgrest-js usa para resolver `.select()`
 * com embeds — sem isso todo select() degenera para `never`.
 */

export type UserRole = "administrador" | "gestor" | "colaborador" | "financeiro";
export type CardPriority = "baixa" | "media" | "alta" | "urgente";
export type TransactionCategoryType = "receita" | "despesa";
export type ClientStatus = "lead" | "proposta" | "ativo" | "pausa" | "inadimplente" | "cancelado";
export type AccessCategory = "hospedagem" | "curso" | "ferramenta" | "outro";

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      organizations: {
        Row: { id: string; name: string; slug: string; created_at: string };
        Insert: { id?: string; name: string; slug: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          organization_id: string | null;
          full_name: string;
          email: string;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          organization_id?: string | null;
          full_name: string;
          email: string;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      clients: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          company: string | null;
          email: string | null;
          phone: string | null;
          status: ClientStatus;
          monthly_value: number | null;
          notes: string | null;
          logo_url: string | null;
          document_id: string | null;
          whatsapp: string | null;
          responsible_user_id: string | null;
          segment_id: string | null;
          entry_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["clients"]["Row"]> & {
          organization_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "clients_responsible_user_id_fkey";
            columns: ["responsible_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clients_segment_id_fkey";
            columns: ["segment_id"];
            isOneToOne: false;
            referencedRelation: "client_segments";
            referencedColumns: ["id"];
          },
        ];
      };
      client_segments: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["client_segments"]["Row"]> & {
          organization_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["client_segments"]["Row"]>;
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          organization_id: string;
          client_id: string | null;
          name: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["projects"]["Row"]> & {
          organization_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Row"]>;
        Relationships: [];
      };
      boards: {
        Row: {
          id: string;
          organization_id: string;
          project_id: string | null;
          name: string;
          description: string | null;
          archived_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["boards"]["Row"]> & {
          organization_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["boards"]["Row"]>;
        Relationships: [];
      };
      board_lists: {
        Row: {
          id: string;
          board_id: string;
          name: string;
          position: number;
          archived_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["board_lists"]["Row"]> & { board_id: string; name: string };
        Update: Partial<Database["public"]["Tables"]["board_lists"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "board_lists_board_id_fkey";
            columns: ["board_id"];
            isOneToOne: false;
            referencedRelation: "boards";
            referencedColumns: ["id"];
          },
        ];
      };
      board_cards: {
        Row: {
          id: string;
          list_id: string;
          title: string;
          description: string | null;
          status: string;
          priority: CardPriority;
          position: number;
          start_date: string | null;
          due_date: string | null;
          client_id: string | null;
          project_id: string | null;
          cover_color: string | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["board_cards"]["Row"]> & { list_id: string; title: string };
        Update: Partial<Database["public"]["Tables"]["board_cards"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "board_cards_list_id_fkey";
            columns: ["list_id"];
            isOneToOne: false;
            referencedRelation: "board_lists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "board_cards_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "board_cards_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      card_members: {
        Row: { id: string; card_id: string; user_id: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["card_members"]["Row"]> & { card_id: string; user_id: string };
        Update: Partial<Database["public"]["Tables"]["card_members"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "card_members_card_id_fkey";
            columns: ["card_id"];
            isOneToOne: false;
            referencedRelation: "board_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "card_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      labels: {
        Row: { id: string; organization_id: string; name: string; color_token: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["labels"]["Row"]> & { organization_id: string; name: string };
        Update: Partial<Database["public"]["Tables"]["labels"]["Row"]>;
        Relationships: [];
      };
      card_labels: {
        Row: { id: string; card_id: string; label_id: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["card_labels"]["Row"]> & { card_id: string; label_id: string };
        Update: Partial<Database["public"]["Tables"]["card_labels"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "card_labels_card_id_fkey";
            columns: ["card_id"];
            isOneToOne: false;
            referencedRelation: "board_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "card_labels_label_id_fkey";
            columns: ["label_id"];
            isOneToOne: false;
            referencedRelation: "labels";
            referencedColumns: ["id"];
          },
        ];
      };
      checklists: {
        Row: { id: string; card_id: string; title: string; position: number; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["checklists"]["Row"]> & { card_id: string };
        Update: Partial<Database["public"]["Tables"]["checklists"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "checklists_card_id_fkey";
            columns: ["card_id"];
            isOneToOne: false;
            referencedRelation: "board_cards";
            referencedColumns: ["id"];
          },
        ];
      };
      checklist_items: {
        Row: {
          id: string;
          checklist_id: string;
          title: string;
          done: boolean;
          assignee_id: string | null;
          position: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["checklist_items"]["Row"]> & {
          checklist_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["checklist_items"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "checklist_items_checklist_id_fkey";
            columns: ["checklist_id"];
            isOneToOne: false;
            referencedRelation: "checklists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "checklist_items_assignee_id_fkey";
            columns: ["assignee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      card_comments: {
        Row: { id: string; card_id: string; user_id: string | null; body: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["card_comments"]["Row"]> & { card_id: string; body: string };
        Update: Partial<Database["public"]["Tables"]["card_comments"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "card_comments_card_id_fkey";
            columns: ["card_id"];
            isOneToOne: false;
            referencedRelation: "board_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "card_comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      card_attachments: {
        Row: {
          id: string;
          card_id: string;
          uploaded_by: string | null;
          file_name: string;
          file_path: string;
          file_size: number | null;
          mime_type: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["card_attachments"]["Row"]> & {
          card_id: string;
          file_name: string;
          file_path: string;
        };
        Update: Partial<Database["public"]["Tables"]["card_attachments"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "card_attachments_card_id_fkey";
            columns: ["card_id"];
            isOneToOne: false;
            referencedRelation: "board_cards";
            referencedColumns: ["id"];
          },
        ];
      };
      contracts: {
        Row: {
          id: string;
          organization_id: string;
          client_id: string | null;
          project_id: string | null;
          title: string;
          value: number | null;
          status: string;
          is_recurring: boolean;
          signed_at: string | null;
          renewal_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["contracts"]["Row"]> & {
          organization_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["contracts"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contracts_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          type: TransactionCategoryType;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]> & {
          organization_id: string;
          name: string;
          type: TransactionCategoryType;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Relationships: [];
      };
      revenues: {
        Row: {
          id: string;
          organization_id: string;
          client_id: string | null;
          category_id: string | null;
          description: string;
          amount: number;
          status: string;
          is_recurring: boolean;
          issue_date: string;
          due_date: string | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["revenues"]["Row"]> & {
          organization_id: string;
          description: string;
          amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["revenues"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "revenues_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "revenues_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      expenses: {
        Row: {
          id: string;
          organization_id: string;
          category_id: string | null;
          related_project_id: string | null;
          client_id: string | null;
          description: string;
          amount: number;
          is_recurring: boolean;
          installments_total: number | null;
          installments_paid: number;
          expense_date: string;
          due_date: string | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["expenses"]["Row"]> & {
          organization_id: string;
          description: string;
          amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["expenses"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "expenses_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          type: string;
          payload: Record<string, unknown>;
          read_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["notifications"]["Row"]> & {
          organization_id: string;
          user_id: string;
          type: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string | null;
          entity_type: string;
          entity_id: string | null;
          action: string;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["activities"]["Row"]> & {
          organization_id: string;
          entity_type: string;
          action: string;
        };
        Update: Partial<Database["public"]["Tables"]["activities"]["Row"]>;
        Relationships: [];
      };
      client_attachments: {
        Row: {
          id: string;
          client_id: string;
          uploaded_by: string | null;
          file_name: string;
          file_path: string;
          file_size: number | null;
          mime_type: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["client_attachments"]["Row"]> & {
          client_id: string;
          file_name: string;
          file_path: string;
        };
        Update: Partial<Database["public"]["Tables"]["client_attachments"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "client_attachments_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
        ];
      };
      access_credentials: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          category: AccessCategory;
          url: string | null;
          login: string | null;
          password: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["access_credentials"]["Row"]> & {
          organization_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["access_credentials"]["Row"]>;
        Relationships: [];
      };
    };
    Views: {
      client_profitability: {
        Row: {
          client_id: string;
          organization_id: string;
          revenue_total: number;
        };
        // View sem FK real no Postgres — PostgREST não expõe embeds
        // automáticos para ela (só para tabelas com FK declarada). Buscar
        // sempre com uma query separada, nunca via .select("clients(client_profitability(...))")
        Relationships: [];
      };
      financial_summary: {
        Row: {
          organization_id: string;
          period: string;
          kind: TransactionCategoryType;
          total: number;
        };
        // Mesma limitação de client_profitability — view sem FK, buscar
        // sempre com query separada.
        Relationships: [];
      };
    };
    Functions: {
      create_organization_and_admin: {
        Args: { org_name: string; admin_user_id: string };
        Returns: string;
      };
      reorder_lists: {
        Args: { p_board_id: string; p_ordered_ids: string[] };
        Returns: undefined;
      };
      reorder_cards: {
        Args: { p_list_id: string; p_ordered_ids: string[] };
        Returns: undefined;
      };
      move_card: {
        Args: { p_card_id: string; p_target_list_id: string; p_target_position: number };
        Returns: undefined;
      };
      duplicate_board: {
        Args: { p_board_id: string; p_new_name: string };
        Returns: string;
      };
    };
    Enums: {
      user_role: UserRole;
      card_priority: CardPriority;
      transaction_category_type: TransactionCategoryType;
      client_status: ClientStatus;
      access_category: AccessCategory;
    };
    CompositeTypes: Record<string, never>;
  };
}
