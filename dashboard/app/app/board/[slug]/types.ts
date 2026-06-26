export type BoardColumn = {
  column_id: string
  title: string | null
  column_type: string
  position: number
  settings: Record<string, unknown>
}

export type RawCell = {
  type: string
  text: string | null
  value: string | null
  display_value?: string | null
  linked_item_ids?: string[]
}

export type BoardItem = {
  monday_item_id: string
  name: string | null
  monday_group_title: string | null
  raw: Record<string, RawCell | undefined>
  updated_at_monday: string | null
}
