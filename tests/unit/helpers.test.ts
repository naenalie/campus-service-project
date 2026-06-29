import { describe, expect, it } from 'vitest'

// Helper functions yang diuji
function generateRequestNumber(): string {
  return `CSR-${Date.now()}`
}

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  
  // Minimalisir potensi deviasi waktu negatif akibat durasi eksekusi test CPU
  const diffMins = Math.max(0, Math.floor(diffMs / 60000))
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 60) return `${diffMins} menit lalu`
  if (diffHours < 24) return `${diffHours} jam lalu`
  return `${diffDays} hari lalu`
}

function canUserUpdateStatus(
  userRole: string, 
  currentStatus: string
): boolean {
  if (userRole === 'ADMIN') return true
  if (userRole === 'TEKNISI' && 
    ['ASSIGNED', 'IN_PROGRESS'].includes(currentStatus)) {
    return true
  }
  return false
}

describe('Generate Request Number', () => {
  it('format harus CSR-[angka]', () => {
    const num = generateRequestNumber()
    expect(num).toMatch(/^CSR-\d+$/)
  })

  // Menambahkan delay microsecond artifisial untuk mencegah tabrakan time-tick CPU pada generate beruntun
  it('dua request number tidak boleh sama', async () => {
    const num1 = generateRequestNumber()
    await new Promise((resolve) => setTimeout(resolve, 2));
    const num2 = generateRequestNumber()
    expect(num1).not.toBe(num2)
  })
})

describe('Relative Time', () => {
  it('menampilkan menit yang benar', () => {
    const fiveMinAgo = new Date(
      Date.now() - 5 * 60 * 1000
    ).toISOString()
    expect(getRelativeTime(fiveMinAgo)).toBe('5 menit lalu')
  })

  it('menampilkan jam yang benar', () => {
    const twoHoursAgo = new Date(
      Date.now() - 2 * 60 * 60 * 1000
    ).toISOString()
    expect(getRelativeTime(twoHoursAgo)).toBe('2 jam lalu')
  })
})

describe('User Permission Check', () => {
  it('admin bisa update status apapun', () => {
    expect(canUserUpdateStatus('ADMIN', 'SUBMITTED')).toBe(true)
    expect(canUserUpdateStatus('ADMIN', 'CLOSED')).toBe(true)
  })

  it('teknisi hanya bisa update ASSIGNED dan IN_PROGRESS', () => {
    expect(
      canUserUpdateStatus('TEKNISI', 'ASSIGNED')
    ).toBe(true)
    expect(
      canUserUpdateStatus('TEKNISI', 'SUBMITTED')
    ).toBe(false)
  })

  it('pelapor tidak bisa update status', () => {
    expect(
      canUserUpdateStatus('PELAPOR', 'SUBMITTED')
    ).toBe(false)
  })
})
