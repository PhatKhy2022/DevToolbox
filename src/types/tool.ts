import type { Component } from 'vue'

export type ToolId =
  | 'dashboard'
  | 'json'
  | 'csv-json'
  | 'yaml-json'
  | 'jwt'
  | 'uuid'
  | 'base64'
  | 'timestamp'
  | 'js-playground'
  | 'english-vocab'

export interface ToolDefinition {
  id: ToolId
  name: string
  description: string
  shortcut: string
  component: Component
}

export interface HistoryItem {
  id: string
  toolId: ToolId
  label: string
  value: string
  createdAt: string
}

export interface Snippet {
  id: string
  name: string
  toolId: ToolId
  value: string
  createdAt: string
}

export interface WorkspaceTab {
  id: string
  title: string
  toolId: ToolId
  input: string
  updatedAt: string
}
