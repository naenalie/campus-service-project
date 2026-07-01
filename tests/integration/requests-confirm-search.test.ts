import { describe, expect, it } from 'vitest'
import { getAllRequests } from '../../worker/db/queries'
import { handleRequestRoutes } from '../../worker/routes/requests'
import type { User } from '../../worker/types'

function createSearchDb() {
  const calls: Array<{ sql: string; params: unknown[] }> = []

  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...params: unknown[]) {
          calls.push({ sql, params })
          return {
            async all() {
              return { results: [] }
            }
          }
        }
      }
    }
  }
}

function createConfirmDb() {
  const state = {
    batchCalled: false,
    request: {
      id: 'req-1',
      request_number: 'CSR-1',
      title: 'AC selesai diperbaiki',
      description: 'AC sudah selesai diperbaiki oleh teknisi.',
      location: 'GK1-202',
      category: 'AC',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      reporter_id: 'pelapor-1',
      assigned_to: 'teknisi-1',
      created_at: '2026-06-30T10:00:00Z',
      updated_at: '2026-06-30T13:00:00Z'
    }
  }

  const db = {
    state,
    prepare(sql: string) {
      return {
        bind(...params: unknown[]) {
          return {
            async first() {
              if (sql.includes('SELECT * FROM service_requests')) {
                return state.request
              }
              return null
            },
            async run() {
              if (sql.includes('UPDATE service_requests')) {
                state.request = {
                  ...state.request,
                  status: String(params[0])
                }
              }
              return { success: true }
            }
          }
        }
      }
    },
    async batch(statements: Array<{ run: () => Promise<unknown> }>) {
      state.batchCalled = true
      for (const statement of statements) {
        await statement.run()
      }
      return []
    }
  }

  return db
}

const pelapor: User = {
  id: 'pelapor-1',
  name: 'Test Pelapor',
  email: 'pelapor@test.com',
  role: 'PELAPOR',
  is_active: 1,
  created_at: '2026-06-30T09:00:00Z'
}

describe('requests keyword search query', () => {
  it('menambahkan klausa LIKE untuk keyword pencarian', async () => {
    const db = createSearchDb()

    await getAllRequests(db as any, { keyword: 'AC GK1' })

    expect(db.calls[0].sql).toContain('request_number LIKE ?')
    expect(db.calls[0].sql).toContain('title LIKE ?')
    expect(db.calls[0].sql).toContain('description LIKE ?')
    expect(db.calls[0].sql).toContain('location LIKE ?')
    expect(db.calls[0].params).toEqual(['%AC GK1%', '%AC GK1%', '%AC GK1%', '%AC GK1%'])
  })

  it('menggabungkan filter status dan keyword dalam query yang sama', async () => {
    const db = createSearchDb()

    await getAllRequests(db as any, { status: 'resolved', keyword: 'toilet' })

    expect(db.calls[0].sql).toContain('status = ?')
    expect(db.calls[0].sql).toContain('request_number LIKE ?')
    expect(db.calls[0].params).toEqual(['RESOLVED', '%toilet%', '%toilet%', '%toilet%', '%toilet%'])
  })
})

describe('requests confirmation route', () => {
  it('menutup laporan RESOLVED ketika pelapor mengonfirmasi hasil', async () => {
    const db = createConfirmDb()
    const request = new Request('https://example.test/api/requests/req-1/confirm', {
      method: 'PATCH',
      body: JSON.stringify({ confirmed: true })
    })

    const response = await handleRequestRoutes(request, { DB: db as any }, new URL(request.url), pelapor)
    const payload = await response.json() as any

    expect(response.status).toBe(200)
    expect(payload.success).toBe(true)
    expect(payload.data.status).toBe('CLOSED')
    expect(db.state.batchCalled).toBe(true)
  })

  it('membuka kembali laporan ke UNDER_REVIEW ketika pelapor menolak hasil', async () => {
    const db = createConfirmDb()
    const request = new Request('https://example.test/api/requests/req-1/confirm', {
      method: 'PATCH',
      body: JSON.stringify({
        confirmed: false,
        rejection_notes: 'AC masih bocor setelah teknisi datang.'
      })
    })

    const response = await handleRequestRoutes(request, { DB: db as any }, new URL(request.url), pelapor)
    const payload = await response.json() as any

    expect(response.status).toBe(200)
    expect(payload.success).toBe(true)
    expect(payload.data.status).toBe('UNDER_REVIEW')
  })

  it('menolak konfirmasi dari pelapor yang bukan pemilik laporan', async () => {
    const db = createConfirmDb()
    const otherPelapor = { ...pelapor, id: 'pelapor-lain' }
    const request = new Request('https://example.test/api/requests/req-1/confirm', {
      method: 'PATCH',
      body: JSON.stringify({ confirmed: true })
    })

    const response = await handleRequestRoutes(request, { DB: db as any }, new URL(request.url), otherPelapor)
    const payload = await response.json() as any

    expect(response.status).toBe(403)
    expect(payload.success).toBe(false)
  })

  it('meminta catatan yang cukup ketika pelapor menolak hasil', async () => {
    const db = createConfirmDb()
    const request = new Request('https://example.test/api/requests/req-1/confirm', {
      method: 'PATCH',
      body: JSON.stringify({ confirmed: false, rejection_notes: 'kurang' })
    })

    const response = await handleRequestRoutes(request, { DB: db as any }, new URL(request.url), pelapor)
    const payload = await response.json() as any

    expect(response.status).toBe(422)
    expect(payload.success).toBe(false)
  })
})
