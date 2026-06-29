import { describe, expect, it } from 'vitest'

// Import fungsi validasi dari worker
import { 
  validateRegister,
  validateCreateRequest,
  validateUpdateStatus,
  validateComment
} from '../../worker/middleware/validation'

describe('Validasi Register', () => {
  it('menolak email yang tidak valid', () => {
    const result = validateRegister({ 
      name: 'Test', 
      email: 'bukan-email', 
      password: 'password123' 
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain(
      'Format email tidak valid'
    )
  })

  it('menolak password kurang dari 8 karakter', () => {
    const result = validateRegister({ 
      name: 'Test', 
      email: 'test@unklab.ac.id', 
      password: '123' 
    })
    expect(result.valid).toBe(false)
  })

  it('menerima data yang valid', () => {
    const result = validateRegister({ 
      name: 'Test User', 
      email: 'test@unklab.ac.id', 
      password: 'password123' 
    })
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('menolak nama yang kosong', () => {
    const result = validateRegister({ 
      name: '', 
      email: 'test@unklab.ac.id', 
      password: 'password123' 
    })
    expect(result.valid).toBe(false)
  })
})

describe('Validasi Create Request', () => {
  it('menolak deskripsi kurang dari 20 karakter', () => {
    const result = validateCreateRequest({
      title: 'AC Rusak',
      description: 'Rusak',
      location: 'GK1',
      category: 'AC'
    })
    expect(result.valid).toBe(false)
  })

  it('menolak kategori yang tidak valid', () => {
    const result = validateCreateRequest({
      title: 'Test',
      description: 'Deskripsi yang cukup panjang untuk test ini',
      location: 'GK1',
      category: 'KategoriTidakAda'
    })
    expect(result.valid).toBe(false)
  })

  it('menerima laporan yang valid', () => {
    const result = validateCreateRequest({
      title: 'AC Tidak Dingin',
      description: 'AC di ruang 301 tidak mendingin sejak kemarin',
      location: 'GK1-301',
      category: 'AC'
    })
    expect(result.valid).toBe(true)
  })

  it('menolak title yang terlalu pendek', () => {
    const result = validateCreateRequest({
      title: 'AC',
      description: 'Deskripsi yang cukup panjang untuk test ini',
      location: 'GK1',
      category: 'AC'
    })
    expect(result.valid).toBe(false)
  })
})

describe('Validasi Status Transition', () => {
  it('memperbolehkan transisi SUBMITTED ke UNDER_REVIEW', () => {
    const result = validateUpdateStatus({
      currentStatus: 'SUBMITTED',
      newStatus: 'UNDER_REVIEW'
    })
    expect(result.valid).toBe(true)
  })

  it('menolak skip status dari SUBMITTED ke CLOSED', () => {
    const result = validateUpdateStatus({
      currentStatus: 'SUBMITTED',
      newStatus: 'CLOSED'
    })
    expect(result.valid).toBe(false)
  })

  it('memperbolehkan RESOLVED ke CLOSED', () => {
    const result = validateUpdateStatus({
      currentStatus: 'RESOLVED',
      newStatus: 'CLOSED'
    })
    expect(result.valid).toBe(true)
  })
})

describe('Validasi Comment', () => {
  it('menolak komentar kosong', () => {
    const result = validateComment({ content: '' })
    expect(result.valid).toBe(false)
  })

  it('menolak komentar terlalu pendek', () => {
    const result = validateComment({ content: 'ok' })
    expect(result.valid).toBe(false)
  })

  it('menerima komentar yang valid', () => {
    const result = validateComment({ 
      content: 'Sedang dalam pengerjaan' 
    })
    expect(result.valid).toBe(true)
  })
})
