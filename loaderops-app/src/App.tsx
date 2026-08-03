import { useEffect, useMemo, useState } from 'react'
import writeXlsxFile, { type Row } from 'write-excel-file/browser'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { supabase } from './lib/supabase'
import './App.css'

type Status = 'Belum Dicocokkan' | 'Sesuai' | 'Tidak Sesuai'

type InboundActivity = {
  id: string
  activity_date: string
  vehicle_number: string
  total_carton: number
  loader_id: string
  reconciliation_status: Status
  reconciliation_note: string | null
  created_at: string
}

type OutboundActivity = {
  id: string
  activity_date: string
  container_number: string
  total_carton: number
  loader_id: string
  reconciliation_status: Status
  reconciliation_note: string | null
  created_at: string
}

type AuditLog = {
  id: string | number
  table_name: string
  activity_id: string | null
  action: 'TAMBAH' | 'EDIT' | 'HAPUS' | 'INSERT' | 'UPDATE' | 'DELETE'
  user_id: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  created_at: string
}

type InboundForm = { activityDate: string; vehicleNumber: string; totalCarton: string }
type OutboundForm = { activityDate: string; containerNumber: string; totalCarton: string }

const emptyInbound: InboundForm = { activityDate: '', vehicleNumber: '', totalCarton: '' }
const emptyOutbound: OutboundForm = {
  activityDate: '',
  containerNumber: '',
  totalCarton: '',
}

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isRecovery, setIsRecovery] = useState(false)
  const [userId, setUserId] = useState('')
  const [userRole, setUserRole] = useState('')
  const [loaderName, setLoaderName] = useState('')
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [showInboundForm, setShowInboundForm] = useState(false)
  const [showOutboundForm, setShowOutboundForm] = useState(false)
  const [inboundForm, setInboundForm] = useState(emptyInbound)
  const [outboundForm, setOutboundForm] = useState(emptyOutbound)
  const [editingInboundId, setEditingInboundId] = useState<string | null>(null)
  const [editingOutboundId, setEditingOutboundId] = useState<string | null>(null)
  const [inboundRows, setInboundRows] = useState<InboundActivity[]>([])
  const [outboundRows, setOutboundRows] = useState<OutboundActivity[]>([])
  const [loaderNames, setLoaderNames] = useState<Record<string, string>>({})
  const [selectedLoaderId, setSelectedLoaderId] = useState('all')
  const [auditRows, setAuditRows] = useState<AuditLog[]>([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const initialReportDate = new Date()
  const [reportStartDate, setReportStartDate] = useState(`${initialReportDate.getFullYear()}-${String(initialReportDate.getMonth() + 1).padStart(2, '0')}-01`)
  const [reportEndDate, setReportEndDate] = useState(`${initialReportDate.getFullYear()}-${String(initialReportDate.getMonth() + 1).padStart(2, '0')}-${String(initialReportDate.getDate()).padStart(2, '0')}`)
  const [reportLoaderId, setReportLoaderId] = useState('all')
  const [reportType, setReportType] = useState<'all' | 'Inbound' | 'Outbound'>('all')

  const loadProfile = async (id: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', id)
      .single()
    if (error || !data) throw new Error('Role akun tidak ditemukan.')
    setUserId(id)
    setUserRole(String(data.role).toLowerCase())
    setLoaderName(data.full_name || username || 'Loader')
  }

  const loadActivities = async () => {
    setLoading(true)
    const [inboundResult, outboundResult, profilesResult] = await Promise.all([
      supabase.from('inbound_activities').select('*').order('activity_date', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('outbound_activities').select('*').order('activity_date', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name'),
    ])
    setLoading(false)
    if (inboundResult.error || outboundResult.error) {
      alert(inboundResult.error?.message || outboundResult.error?.message || 'Data gagal dimuat.')
      return
    }
    setInboundRows((inboundResult.data || []) as InboundActivity[])
    setOutboundRows((outboundResult.data || []) as OutboundActivity[])
    if (!profilesResult.error) {
      setLoaderNames(Object.fromEntries((profilesResult.data || []).map((p) => [p.id, p.full_name || 'Loader'])))
    }
  }

  const loadAuditLogs = async () => {
    if (!['admin', 'spv'].includes(userRole)) return
    setAuditLoading(true)
    const { data, error } = await supabase
      .from('audit_logs')
      .select('id, table_name, activity_id, action, user_id, old_data, new_data, created_at')
      .order('created_at', { ascending: false })
      .limit(200)
    setAuditLoading(false)
    if (error) {
      alert(`Audit Log gagal dimuat: ${error.message}`)
      return
    }
    setAuditRows((data || []) as AuditLog[])
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        try { await loadProfile(data.session.user.id) } catch { await supabase.auth.signOut() }
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setIsRecovery(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { if (userRole) void loadActivities() }, [userRole])

  useEffect(() => {
    if (activeMenu === 'audit') void loadAuditLogs()
  }, [activeMenu, userRole])

  const canInput = userRole === 'loader'
  const closeAllForms = () => {
    setShowInboundForm(false); setShowOutboundForm(false)
    setEditingInboundId(null); setEditingOutboundId(null)
    setInboundForm(emptyInbound); setOutboundForm(emptyOutbound)
  }
  const changeMenu = (menu: string) => { setActiveMenu(menu); closeAllForms() }
  const cleanCode = (value: string) => value.trim().toUpperCase().replace(/\s+/g, ' ')
  const formatDate = (value: string) => {
    const [year, month, day] = value.split('-')
    return `${day}/${month}/${year}`
  }
  const showLoader = (id: string) => loaderNames[id] || (id === userId ? loaderName : 'Loader')
  const canViewAudit = ['admin', 'spv'].includes(userRole)
  const formatDateTime = (value: string) => new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
  const auditAction = (action: AuditLog['action']) => ({
    TAMBAH: 'Tambah', INSERT: 'Tambah', EDIT: 'Edit', UPDATE: 'Edit', HAPUS: 'Hapus', DELETE: 'Hapus',
  })[action]
  const auditType = (tableName: string) => tableName === 'inbound_activities' ? 'Inbound' : tableName === 'outbound_activities' ? 'Outbound' : tableName
  const auditSnapshot = (row: AuditLog) => row.new_data || row.old_data || {}
  const auditReference = (row: AuditLog) => {
    const data = auditSnapshot(row)
    return String(data.vehicle_number || data.container_number || '-')
  }
  const auditDetails = (row: AuditLog) => {
    const before = row.old_data || {}
    const after = row.new_data || {}
    if (auditAction(row.action) === 'Tambah') return `Data baru · ${auditReference(row)} · ${Number(after.total_carton || 0).toLocaleString('id-ID')} carton`
    if (auditAction(row.action) === 'Hapus') return `Data dihapus · ${auditReference(row)} · ${Number(before.total_carton || 0).toLocaleString('id-ID')} carton`
    const labels: Record<string, string> = { activity_date: 'Tanggal', vehicle_number: 'No. mobil', container_number: 'No. container', total_carton: 'Total carton', reconciliation_status: 'Status', reconciliation_note: 'Keterangan' }
    const changes = Object.keys(labels).filter((key) => before[key] !== after[key]).map((key) => `${labels[key]}: ${String(before[key] ?? '-')} → ${String(after[key] ?? '-')}`)
    return changes.length ? changes.join('; ') : 'Data diperbarui'
  }
  const isEditable = (row: { loader_id: string; reconciliation_status: Status }) =>
    row.reconciliation_status === 'Belum Dicocokkan' && row.loader_id === userId && userRole === 'loader'

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const loginUsername = username.trim().toLowerCase()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `rosmauliana.works+${loginUsername}@gmail.com`, password,
    })
    if (error) return alert('Username atau password salah.')
    try { await loadProfile(data.user.id) } catch (error) {
      alert(error instanceof Error ? error.message : 'Profil akun tidak ditemukan.')
      await supabase.auth.signOut()
    }
  }

  const handleForgotPassword = async () => {
    if (!username.trim()) return alert('Masukkan username terlebih dahulu.')
    const email = `rosmauliana.works+${username.trim().toLowerCase()}@gmail.com`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })
    alert(error ? error.message : 'Tautan reset password sudah dikirim ke email.')
  }

  const handleUpdatePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (newPassword.length < 6) return alert('Password baru minimal 6 karakter.')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return alert(error.message)
    alert('Password berhasil diperbarui. Silakan login.')
    setNewPassword(''); setIsRecovery(false); await supabase.auth.signOut()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUserId(''); setUserRole(''); setLoaderName(''); setUsername(''); setPassword('')
    setInboundRows([]); setOutboundRows([]); setActiveMenu('dashboard'); closeAllForms()
  }

  const handleSubmitInbound = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!userId) return
    setLoading(true)
    const values = {
      activity_date: inboundForm.activityDate,
      vehicle_number: cleanCode(inboundForm.vehicleNumber),
      total_carton: Number(inboundForm.totalCarton),
    }
    const result = editingInboundId
      ? await supabase.from('inbound_activities').update(values).eq('id', editingInboundId)
      : await supabase.from('inbound_activities').insert({ ...values, loader_id: userId })
    setLoading(false)
    if (result.error) return alert(`Data inbound gagal disimpan: ${result.error.message}`)
    alert(editingInboundId ? 'Data inbound berhasil diperbarui.' : 'Data inbound berhasil disimpan.')
    setInboundForm(emptyInbound); setEditingInboundId(null); setShowInboundForm(false); await loadActivities()
  }

  const handleSubmitOutbound = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!userId) return
    setLoading(true)
    const values = {
      activity_date: outboundForm.activityDate,
      container_number: cleanCode(outboundForm.containerNumber),
      total_carton: Number(outboundForm.totalCarton),
    }
    const result = editingOutboundId
      ? await supabase.from('outbound_activities').update(values).eq('id', editingOutboundId)
      : await supabase.from('outbound_activities').insert({ ...values, loader_id: userId })
    setLoading(false)
    if (result.error) return alert(`Data outbound gagal disimpan: ${result.error.message}`)
    alert(editingOutboundId ? 'Data outbound berhasil diperbarui.' : 'Data outbound berhasil disimpan.')
    setOutboundForm(emptyOutbound); setEditingOutboundId(null); setShowOutboundForm(false); await loadActivities()
  }

  const editInbound = (row: InboundActivity) => {
    setInboundForm({ activityDate: row.activity_date, vehicleNumber: row.vehicle_number, totalCarton: String(row.total_carton) })
    setEditingInboundId(row.id); setShowInboundForm(true); window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const editOutbound = (row: OutboundActivity) => {
    setOutboundForm({ activityDate: row.activity_date, containerNumber: row.container_number, totalCarton: String(row.total_carton) })
    setEditingOutboundId(row.id); setShowOutboundForm(true); window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const deleteActivity = async (type: 'inbound' | 'outbound', id: string) => {
    if (!window.confirm(`Hapus data ${type} ini? Data yang dihapus tidak dapat dikembalikan.`)) return
    setLoading(true)
    const { error } = await supabase.from(`${type}_activities`).delete().eq('id', id)
    setLoading(false)
    if (error) return alert(`Data gagal dihapus: ${error.message}`)
    alert(`Data ${type} berhasil dihapus.`); await loadActivities()
  }

  const padDatePart = (value: number) => String(value).padStart(2, '0')
  const now = new Date()
  const today = `${now.getFullYear()}-${padDatePart(now.getMonth() + 1)}-${padDatePart(now.getDate())}`
  const isLoader = userRole === 'loader'
  const visibleInboundRows = useMemo(() => {
    if (isLoader) return inboundRows.filter((row) => row.loader_id === userId)
    if (selectedLoaderId === 'all') return inboundRows
    return inboundRows.filter((row) => row.loader_id === selectedLoaderId)
  }, [inboundRows, isLoader, selectedLoaderId, userId])
  const visibleOutboundRows = useMemo(() => {
    if (isLoader) return outboundRows.filter((row) => row.loader_id === userId)
    if (selectedLoaderId === 'all') return outboundRows
    return outboundRows.filter((row) => row.loader_id === selectedLoaderId)
  }, [outboundRows, isLoader, selectedLoaderId, userId])
  const allVisibleActivities = useMemo(() => [
    ...visibleInboundRows.map((row) => ({
      ...row,
      type: 'Inbound' as const,
      reference: row.vehicle_number,
    })),
    ...visibleOutboundRows.map((row) => ({
      ...row,
      type: 'Outbound' as const,
      reference: row.container_number,
    })),
  ].sort((a, b) => {
    const dateComparison = b.activity_date.localeCompare(a.activity_date)
    return dateComparison || b.created_at.localeCompare(a.created_at)
  }), [visibleInboundRows, visibleOutboundRows])
  const totals = useMemo(() => ({
    today: visibleInboundRows.filter((r) => r.activity_date === today).length + visibleOutboundRows.filter((r) => r.activity_date === today).length,
    inbound: visibleInboundRows.filter((r) => r.activity_date === today).reduce((sum, r) => sum + r.total_carton, 0),
    outbound: visibleOutboundRows.filter((r) => r.activity_date === today).reduce((sum, r) => sum + r.total_carton, 0),
  }), [visibleInboundRows, visibleOutboundRows, today])

  const monthlyChart = useMemo(() => {
    const year = now.getFullYear()
    const monthIndex = now.getMonth()
    const lastDay = new Date(year, monthIndex + 1, 0).getDate()
    const monthPrefix = `${year}-${padDatePart(monthIndex + 1)}-`
    const weeks = Array.from({ length: Math.ceil(lastDay / 7) }, (_, index) => {
      const start = index * 7 + 1
      const end = Math.min(start + 6, lastDay)
      const inRange = (date: string) => {
        if (!date.startsWith(monthPrefix)) return false
        const day = Number(date.slice(-2))
        return day >= start && day <= end
      }
      return {
        label: `Minggu ${index + 1}`,
        range: `${start}–${end}`,
        inbound: visibleInboundRows.filter((row) => inRange(row.activity_date)).length,
        outbound: visibleOutboundRows.filter((row) => inRange(row.activity_date)).length,
      }
    })
    return {
      label: new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(now),
      weeks,
      max: Math.max(1, ...weeks.flatMap((week) => [week.inbound, week.outbound])),
    }
  }, [visibleInboundRows, visibleOutboundRows, today])

  const loaderOptions = useMemo(() => {
    const ids = new Set([...inboundRows.map((row) => row.loader_id), ...outboundRows.map((row) => row.loader_id)])
    return Array.from(ids).map((id) => ({ id, name: showLoader(id) })).sort((a, b) => a.name.localeCompare(b.name))
  }, [inboundRows, outboundRows, loaderNames, loaderName, userId])

  const reportSourceRows = useMemo(() => [
    ...inboundRows.map((row) => ({ ...row, type: 'Inbound' as const, reference: row.vehicle_number })),
    ...outboundRows.map((row) => ({ ...row, type: 'Outbound' as const, reference: row.container_number })),
  ].sort((a, b) => b.activity_date.localeCompare(a.activity_date) || b.created_at.localeCompare(a.created_at)), [inboundRows, outboundRows])

  const reportRows = useMemo(() => reportSourceRows.filter((row) => {
    const matchesDate = (!reportStartDate || row.activity_date >= reportStartDate) && (!reportEndDate || row.activity_date <= reportEndDate)
    const matchesLoader = reportLoaderId === 'all' || row.loader_id === reportLoaderId
    const matchesType = reportType === 'all' || row.type === reportType
    return matchesDate && matchesLoader && matchesType
  }), [reportSourceRows, reportStartDate, reportEndDate, reportLoaderId, reportType])

  const reportTotals = useMemo(() => ({
    activities: reportRows.length,
    inboundActivities: reportRows.filter((row) => row.type === 'Inbound').length,
    outboundActivities: reportRows.filter((row) => row.type === 'Outbound').length,
    inboundCarton: reportRows.filter((row) => row.type === 'Inbound').reduce((sum, row) => sum + row.total_carton, 0),
    outboundCarton: reportRows.filter((row) => row.type === 'Outbound').reduce((sum, row) => sum + row.total_carton, 0),
  }), [reportRows])

  const validateReportDates = () => {
    if (reportStartDate && reportEndDate && reportStartDate > reportEndDate) {
      alert('Tanggal mulai tidak boleh setelah tanggal akhir.')
      return false
    }
    return true
  }

  const reportFileSuffix = () => `${reportStartDate || 'awal'}_${reportEndDate || 'akhir'}`

  const exportReportExcel = async () => {
    if (!validateReportDates()) return
    if (!reportRows.length) return alert('Tidak ada data untuk diekspor.')
    const excelRows: Row[] = [
      ['Tanggal', 'Jenis', 'Loader', 'No. Mobil / Container', 'Total Carton', 'Status', 'Keterangan'].map((value) => ({
        type: String,
        value,
        fontWeight: 'bold',
        backgroundColor: '#DCE6F1',
        align: 'center',
      })),
      ...reportRows.map((row): Row => [
        { type: String, value: formatDate(row.activity_date) },
        { type: String, value: row.type },
        { type: String, value: showLoader(row.loader_id) },
        { type: String, value: row.reference },
        { type: Number, value: row.total_carton, format: '#,##0' },
        { type: String, value: row.reconciliation_status },
        { type: String, value: row.reconciliation_note || '-' },
      ]),
    ]
    await writeXlsxFile(excelRows).toFile(
  `Rekap_LoaderOps_${reportFileSuffix()}.xlsx`
)}
  const exportReportPdf = () => {
    if (!validateReportDates()) return
    if (!reportRows.length) return alert('Tidak ada data untuk diekspor.')
    const doc = new jsPDF({ orientation: 'landscape' })
    doc.setFontSize(16)
    doc.text('Rekap & Laporan LoaderOps', 14, 15)
    doc.setFontSize(10)
    doc.text(`Periode: ${reportStartDate ? formatDate(reportStartDate) : 'Semua'} s.d. ${reportEndDate ? formatDate(reportEndDate) : 'Semua'}`, 14, 22)
    doc.text(`Total aktivitas: ${reportTotals.activities} | Carton inbound: ${reportTotals.inboundCarton.toLocaleString('id-ID')} | Carton outbound: ${reportTotals.outboundCarton.toLocaleString('id-ID')}`, 14, 28)
    autoTable(doc, {
      startY: 34,
      head: [['Tanggal', 'Jenis', 'Loader', 'No. Mobil / Container', 'Total Carton', 'Status', 'Keterangan']],
      body: reportRows.map((row) => [formatDate(row.activity_date), row.type, showLoader(row.loader_id), row.reference, row.total_carton.toLocaleString('id-ID'), row.reconciliation_status, row.reconciliation_note || '-']),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 58, 95] },
    })
    doc.save(`Rekap_LoaderOps_${reportFileSuffix()}.pdf`)
  }

  const menuItems = isLoader
    ? [['dashboard', 'Dashboard'], ['inbound', 'Aktivitas Inbound'], ['outbound', 'Aktivitas Outbound']]
    : [['dashboard', 'Dashboard'], ['inbound', 'Aktivitas Inbound'], ['outbound', 'Aktivitas Outbound'], ['loader', 'Data Loader'], ['reports', 'Rekap & Laporan'], ...(canViewAudit ? [['audit', 'Audit Log']] : [])]

  if (isRecovery) return <main><section className="welcome-card"><h1>Password Baru</h1><p>Masukkan password baru untuk akun Anda.</p><form className="login-form" onSubmit={handleUpdatePassword}><input type="password" placeholder="Password baru" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} required/><button type="submit">Simpan Password</button></form></section></main>

  if (!userRole) return <main><section className="welcome-card"><h1>LoaderOps</h1><p>Masuk ke akun Anda</p><small>By Rosma</small><form className="login-form" onSubmit={handleLogin}><input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required/><input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/><button type="submit">Masuk</button><button type="button" className="forgot-password" onClick={handleForgotPassword}>Lupa Password?</button></form></section></main>

  return (
    <main className="dashboard">
      <aside className="sidebar"><div className="sidebar-brand"><strong>LOADEROPS</strong><span>{userRole.toUpperCase()} Panel</span></div><nav className="sidebar-menu">
        {menuItems.map(([key,label]) => <button key={key} type="button" className={activeMenu === key ? 'active' : ''} onClick={() => changeMenu(key)}>{label}</button>)}
      </nav></aside>
      <div className="dashboard-content">
        <header className="dashboard-header"><div><p className="dashboard-label">LOADEROPS</p><h1>{{dashboard:'Dashboard',all:'Semua Aktivitas',inbound:'Aktivitas Inbound',outbound:'Aktivitas Outbound',loader:'Data Loader',reports:'Rekap & Laporan',audit:'Audit Log'}[activeMenu]}</h1><p>{activeMenu === 'dashboard' ? `Selamat datang, ${loaderName || username}` : 'Kelola dan pantau data operasional LoaderOps'}</p></div><div className="dashboard-account"><span className="role-badge">{userRole.toUpperCase()}</span><button type="button" onClick={handleLogout}>Logout</button></div></header>

        {activeMenu === 'dashboard' && <>
          {!isLoader && <section className="data-panel" style={{ marginBottom: 24 }}><div className="form-group"><label htmlFor="loader-filter">Tampilkan aktivitas</label><select id="loader-filter" value={selectedLoaderId} onChange={(event) => setSelectedLoaderId(event.target.value)}><option value="all">Semua loader</option>{loaderOptions.map((loader) => <option key={loader.id} value={loader.id}>{loader.name}</option>)}</select></div></section>}
          <section className="summary-grid"><article className="summary-card"><span>Total Aktivitas Hari Ini</span><strong>{totals.today}</strong></article><article className="summary-card"><span>Total Carton Inbound Hari Ini</span><strong>{totals.inbound.toLocaleString('id-ID')}</strong></article><article className="summary-card"><span>Total Carton Outbound Hari Ini</span><strong>{totals.outbound.toLocaleString('id-ID')}</strong></article><article className="summary-card"><span>{isLoader ? 'Aktivitas Bulan Ini' : selectedLoaderId === 'all' ? 'Loader Tercatat' : 'Aktivitas Bulan Ini'}</span><strong>{isLoader || selectedLoaderId !== 'all' ? monthlyChart.weeks.reduce((sum, week) => sum + week.inbound + week.outbound, 0) : loaderOptions.length}</strong></article></section>
          <section className="data-panel" style={{ marginBottom: 24 }}><div className="data-panel-header"><div><h2>Grafik Aktivitas Bulanan</h2><p>{monthlyChart.label} · jumlah aktivitas per minggu</p></div><div style={{ display: 'flex', gap: 16, fontSize: 13 }}><span style={{ color: '#72a98f' }}>● Inbound</span><span style={{ color: '#7798b8' }}>● Outbound</span></div></div><div className="table-wrapper"><div style={{ display: 'grid', gridTemplateColumns: `repeat(${monthlyChart.weeks.length}, minmax(90px, 1fr))`, gap: 16, minWidth: 500, height: 260, alignItems: 'end', padding: '12px 4px 0' }}>{monthlyChart.weeks.map((week) => <div key={week.label} style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}><div style={{ height: 190, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8, borderBottom: '1px solid #cbd5e1' }}><div title={`Inbound: ${week.inbound}`} style={{ width: 28, minHeight: week.inbound ? 10 : 0, height: `${(week.inbound / monthlyChart.max) * 100}%`, background: '#72a98f', borderRadius: '6px 6px 0 0', display: 'flex', justifyContent: 'center', color: 'white', fontSize: 12, paddingTop: week.inbound ? 4 : 0, boxSizing: 'border-box' }}>{week.inbound || ''}</div><div title={`Outbound: ${week.outbound}`} style={{ width: 28, minHeight: week.outbound ? 10 : 0, height: `${(week.outbound / monthlyChart.max) * 100}%`, background: '#7798b8', borderRadius: '6px 6px 0 0', display: 'flex', justifyContent: 'center', color: 'white', fontSize: 12, paddingTop: week.outbound ? 4 : 0, boxSizing: 'border-box' }}>{week.outbound || ''}</div></div><strong style={{ fontSize: 13, color: '#1e3a5f' }}>{week.label}</strong><span style={{ fontSize: 12, color: '#64748b' }}>Tgl {week.range}</span></div>)}</div></div></section>
          <section className="dashboard-panel"><div><h2>Aktivitas Tercatat</h2><p>{allVisibleActivities.length ? `${allVisibleActivities.length} aktivitas dapat dilihat.` : 'Belum ada aktivitas operasional yang tercatat.'}</p></div><button type="button" onClick={() => changeMenu('all')}>Lihat Semua Aktivitas</button></section>
        </>}

        {activeMenu === 'all' && <section className="data-panel"><div className="data-panel-header"><div><h2>Semua Aktivitas</h2><p>Gabungan aktivitas Inbound dan Outbound.</p></div></div>
          <div className="table-wrapper"><table className="data-table"><thead><tr><th>Tanggal</th><th>Jenis</th><th>Loader</th><th>No. Mobil / Container</th><th>Total Carton</th><th>Status</th><th>Keterangan</th></tr></thead><tbody>{loading && !allVisibleActivities.length ? <tr><td colSpan={7} className="empty-table">Memuat data...</td></tr> : !allVisibleActivities.length ? <tr><td colSpan={7} className="empty-table">Belum ada aktivitas.</td></tr> : allVisibleActivities.map((row) => <tr key={`${row.type}-${row.id}`}><td>{formatDate(row.activity_date)}</td><td>{row.type}</td><td>{showLoader(row.loader_id)}</td><td>{row.reference}</td><td>{row.total_carton.toLocaleString('id-ID')}</td><td>{row.reconciliation_status}</td><td>{row.reconciliation_note || '-'}</td></tr>)}</tbody></table></div>
        </section>}

        {activeMenu === 'inbound' && <section className="data-panel"><div className="data-panel-header"><div><h2>Daftar Aktivitas Inbound</h2><p>Pencocokan berdasarkan tanggal dan nomor mobil.</p></div>{canInput && <button type="button" onClick={() => { if (showInboundForm) { setInboundForm(emptyInbound); setEditingInboundId(null) } setShowInboundForm(!showInboundForm) }}>{showInboundForm ? 'Tutup Form' : '+ Tambah Inbound'}</button>}</div>
          {showInboundForm && <form className="inbound-form" onSubmit={handleSubmitInbound}><div className="form-group"><label htmlFor="inbound-date">Tanggal</label><input id="inbound-date" type="date" value={inboundForm.activityDate} onChange={(e) => setInboundForm({...inboundForm, activityDate:e.target.value})} required/></div><div className="form-group"><label htmlFor="inbound-vehicle">Nomor Mobil</label><input id="inbound-vehicle" type="text" placeholder="Contoh: B 9123 XYZ" value={inboundForm.vehicleNumber} onChange={(e) => setInboundForm({...inboundForm, vehicleNumber:e.target.value})} required/></div><div className="form-group"><label htmlFor="inbound-carton">Total Carton</label><input id="inbound-carton" type="number" min="1" value={inboundForm.totalCarton} onChange={(e) => setInboundForm({...inboundForm, totalCarton:e.target.value})} required/></div><div className="form-actions"><button type="button" onClick={() => { setShowInboundForm(false); setEditingInboundId(null); setInboundForm(emptyInbound) }}>Batal</button><button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : editingInboundId ? 'Simpan Perubahan' : 'Simpan Inbound'}</button></div></form>}
          <div className="table-wrapper"><table className="data-table"><thead><tr><th>Tanggal</th><th>Loader</th><th>No. Mobil</th><th>Total Carton</th><th>Status</th><th>Keterangan</th><th>Aksi</th></tr></thead><tbody>{loading && !inboundRows.length ? <tr><td colSpan={7} className="empty-table">Memuat data...</td></tr> : !inboundRows.length ? <tr><td colSpan={7} className="empty-table">Belum ada aktivitas inbound.</td></tr> : inboundRows.map((row) => <tr key={row.id}><td>{formatDate(row.activity_date)}</td><td>{showLoader(row.loader_id)}</td><td>{row.vehicle_number}</td><td>{row.total_carton.toLocaleString('id-ID')}</td><td>{row.reconciliation_status}</td><td>{row.reconciliation_note || '-'}</td><td>{isEditable(row) ? <><button type="button" onClick={() => editInbound(row)}>Edit</button> <button type="button" onClick={() => void deleteActivity('inbound', row.id)}>Hapus</button></> : <span>Terkunci</span>}</td></tr>)}</tbody></table></div>
        </section>}

        {activeMenu === 'outbound' && <section className="data-panel"><div className="data-panel-header"><div><h2>Daftar Aktivitas Outbound</h2><p>Pencocokan berdasarkan tanggal dan nomor container.</p></div>{canInput && <button type="button" onClick={() => { if (showOutboundForm) { setOutboundForm(emptyOutbound); setEditingOutboundId(null) } setShowOutboundForm(!showOutboundForm) }}>{showOutboundForm ? 'Tutup Form' : '+ Tambah Outbound'}</button>}</div>
          {showOutboundForm && <form className="inbound-form" onSubmit={handleSubmitOutbound}><div className="form-group"><label htmlFor="outbound-date">Tanggal</label><input id="outbound-date" type="date" value={outboundForm.activityDate} onChange={(e) => setOutboundForm({...outboundForm, activityDate:e.target.value})} required/></div><div className="form-group"><label htmlFor="outbound-container">Nomor Container</label><input id="outbound-container" type="text" placeholder="Contoh: BSIU8021455" value={outboundForm.containerNumber} onChange={(e) => setOutboundForm({...outboundForm, containerNumber:e.target.value})} required/></div><div className="form-group"><label htmlFor="outbound-carton">Total Carton</label><input id="outbound-carton" type="number" min="1" value={outboundForm.totalCarton} onChange={(e) => setOutboundForm({...outboundForm, totalCarton:e.target.value})} required/></div><div className="form-actions"><button type="button" onClick={() => { setShowOutboundForm(false); setEditingOutboundId(null); setOutboundForm(emptyOutbound) }}>Batal</button><button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : editingOutboundId ? 'Simpan Perubahan' : 'Simpan Outbound'}</button></div></form>}
          <div className="table-wrapper"><table className="data-table"><thead><tr><th>Tanggal</th><th>Loader</th><th>No. Container</th><th>Total Carton</th><th>Status</th><th>Keterangan</th><th>Aksi</th></tr></thead><tbody>{loading && !outboundRows.length ? <tr><td colSpan={7} className="empty-table">Memuat data...</td></tr> : !outboundRows.length ? <tr><td colSpan={7} className="empty-table">Belum ada aktivitas outbound.</td></tr> : outboundRows.map((row) => <tr key={row.id}><td>{formatDate(row.activity_date)}</td><td>{showLoader(row.loader_id)}</td><td>{row.container_number}</td><td>{row.total_carton.toLocaleString('id-ID')}</td><td>{row.reconciliation_status}</td><td>{row.reconciliation_note || '-'}</td><td>{isEditable(row) ? <><button type="button" onClick={() => editOutbound(row)}>Edit</button> <button type="button" onClick={() => void deleteActivity('outbound', row.id)}>Hapus</button></> : <span>Terkunci</span>}</td></tr>)}</tbody></table></div>
        </section>}

        {activeMenu === 'loader' && <section className="data-panel"><h2>Data Loader</h2><p>Data aktivitas Mijan, Ompong, dan Safar dapat diperiksa melalui menu Inbound dan Outbound.</p></section>}
        {activeMenu === 'reports' && <section className="data-panel"><div className="data-panel-header"><div><h2>Rekap & Laporan</h2><p>Filter aktivitas operasional lalu unduh hasilnya dalam format Excel atau PDF.</p></div><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><button type="button" onClick={() => void exportReportExcel()}>Ekspor Excel</button><button type="button" onClick={exportReportPdf}>Ekspor PDF</button></div></div>
          <div className="inbound-form" style={{ marginBottom: 24 }}><div className="form-group"><label htmlFor="report-start">Tanggal Mulai</label><input id="report-start" type="date" value={reportStartDate} onChange={(event) => setReportStartDate(event.target.value)}/></div><div className="form-group"><label htmlFor="report-end">Tanggal Akhir</label><input id="report-end" type="date" value={reportEndDate} onChange={(event) => setReportEndDate(event.target.value)}/></div><div className="form-group"><label htmlFor="report-loader">Loader</label><select id="report-loader" value={reportLoaderId} onChange={(event) => setReportLoaderId(event.target.value)}><option value="all">Semua loader</option>{loaderOptions.map((loader) => <option key={loader.id} value={loader.id}>{loader.name}</option>)}</select></div><div className="form-group"><label htmlFor="report-type">Jenis Aktivitas</label><select id="report-type" value={reportType} onChange={(event) => setReportType(event.target.value as 'all' | 'Inbound' | 'Outbound')}><option value="all">Semua aktivitas</option><option value="Inbound">Inbound</option><option value="Outbound">Outbound</option></select></div></div>
          <section className="summary-grid" style={{ marginBottom: 24 }}><article className="summary-card"><span>Total Aktivitas</span><strong>{reportTotals.activities}</strong></article><article className="summary-card"><span>Aktivitas Inbound</span><strong>{reportTotals.inboundActivities}</strong></article><article className="summary-card"><span>Carton Inbound</span><strong>{reportTotals.inboundCarton.toLocaleString('id-ID')}</strong></article><article className="summary-card"><span>Aktivitas Outbound</span><strong>{reportTotals.outboundActivities}</strong></article><article className="summary-card"><span>Carton Outbound</span><strong>{reportTotals.outboundCarton.toLocaleString('id-ID')}</strong></article></section>
          <div className="table-wrapper"><table className="data-table"><thead><tr><th>Tanggal</th><th>Jenis</th><th>Loader</th><th>No. Mobil / Container</th><th>Total Carton</th><th>Status</th><th>Keterangan</th></tr></thead><tbody>{!reportRows.length ? <tr><td colSpan={7} className="empty-table">Tidak ada data yang sesuai dengan filter.</td></tr> : reportRows.map((row) => <tr key={`report-${row.type}-${row.id}`}><td>{formatDate(row.activity_date)}</td><td>{row.type}</td><td>{showLoader(row.loader_id)}</td><td>{row.reference}</td><td>{row.total_carton.toLocaleString('id-ID')}</td><td>{row.reconciliation_status}</td><td>{row.reconciliation_note || '-'}</td></tr>)}</tbody></table></div>
        </section>}
        {activeMenu === 'audit' && canViewAudit && <section className="data-panel"><div className="data-panel-header"><div><h2>Audit Log</h2><p>Riwayat tambah, edit, dan hapus aktivitas. Data terbaru ditampilkan paling atas.</p></div><button type="button" onClick={() => void loadAuditLogs()} disabled={auditLoading}>{auditLoading ? 'Memuat...' : 'Muat Ulang'}</button></div>
          <div className="table-wrapper"><table className="data-table"><thead><tr><th>Waktu</th><th>User</th><th>Aksi</th><th>Jenis</th><th>Referensi</th><th>Detail Perubahan</th></tr></thead><tbody>{auditLoading && !auditRows.length ? <tr><td colSpan={6} className="empty-table">Memuat Audit Log...</td></tr> : !auditRows.length ? <tr><td colSpan={6} className="empty-table">Belum ada riwayat aktivitas.</td></tr> : auditRows.map((row) => { const snapshot = auditSnapshot(row); const actorId = row.user_id || String(snapshot.loader_id || ''); return <tr key={row.id}><td>{formatDateTime(row.created_at)} WIB</td><td>{actorId ? showLoader(actorId) : 'Sistem'}</td><td><strong>{auditAction(row.action)}</strong></td><td>{auditType(row.table_name)}</td><td>{auditReference(row)}</td><td style={{ minWidth: 260, whiteSpace: 'normal' }}>{auditDetails(row)}</td></tr> })}</tbody></table></div>
        </section>}
      </div>
    </main>
  )
}

export default App