import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Node 26 ships an experimental global `localStorage` that shadows the one
// jsdom provides and resolves to `undefined` unless started with a special
// flag. Install a small in-memory Storage so bare `localStorage.*` calls (used
// throughout the app) work deterministically in tests.
class MemoryStorage implements Storage {
  private store = new Map<string, string>()
  get length() { return this.store.size }
  clear() { this.store.clear() }
  getItem(key: string) { return this.store.has(key) ? this.store.get(key)! : null }
  key(index: number) { return Array.from(this.store.keys())[index] ?? null }
  removeItem(key: string) { this.store.delete(key) }
  setItem(key: string, value: string) { this.store.set(key, String(value)) }
}

const memoryStorage = new MemoryStorage()
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: memoryStorage,
})
Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: memoryStorage,
})

// Unmount React trees and wipe persisted state between tests so each case
// starts from a clean slate (tokens, prefs and cached user all live in
// localStorage).
afterEach(() => {
  cleanup()
  localStorage.clear()
})
