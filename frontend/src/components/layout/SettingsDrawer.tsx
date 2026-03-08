import { useSettings } from '@/context/SettingsContext'

interface SettingsDrawerProps {
  open: boolean
  onClose: () => void
}

function Toggle({ label, description, value, onChange }: {
  label: string
  description?: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/6">
      <div>
        <div className="text-sm font-medium text-white">{label}</div>
        {description && <div className="text-xs text-slate-500 mt-0.5">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative w-10 h-5 rounded-full transition-all flex-shrink-0"
        style={{ background: value ? '#f97316' : 'rgba(255,255,255,0.12)' }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
          style={{ transform: value ? 'translateX(22px)' : 'translateX(2px)' }}
        />
      </button>
    </div>
  )
}

export default function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const { settings, updateSetting } = useSettings()
  const isDev = import.meta.env.DEV

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-60"
          onClick={onClose}
        />
      )}
      <div
        className="fixed right-0 top-0 h-full w-80 z-70 flex flex-col"
        style={{
          background: 'rgba(7,15,26,0.97)',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <div>
            <div className="font-display text-xl tracking-widest text-white">SETTINGS</div>
            <div className="text-xs text-slate-500">Customize your experience</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-white rounded-lg hover:bg-white/10 transition-all">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-1">
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-3">Appearance</div>
          <Toggle
            label="Dark Mode"
            value={settings.darkMode}
            onChange={v => updateSetting('darkMode', v)}
          />

          <div className="text-xs font-semibold uppercase tracking-widest text-slate-600 mt-5 mb-3">Performance</div>
          <Toggle
            label="Performance Mode"
            description="Reduced effects, lower 3D quality"
            value={settings.performanceMode}
            onChange={v => updateSetting('performanceMode', v)}
          />
          <Toggle
            label="Show 3D Background"
            description="Persistent arena scene"
            value={settings.show3DBackground}
            onChange={v => updateSetting('show3DBackground', v)}
          />

          {isDev && (
            <>
              <div className="text-xs font-semibold uppercase tracking-widest text-slate-600 mt-5 mb-3 flex items-center gap-2">
                Developer
                <span className="text-xs text-orange-500 font-mono bg-orange-500/10 px-1.5 py-0.5 rounded">DEV</span>
              </div>
              <Toggle
                label="Use Mock Data"
                description="Use local mock data instead of API"
                value={settings.useMockData}
                onChange={v => updateSetting('useMockData', v)}
              />
            </>
          )}
        </div>

        <div className="p-5 border-t border-white/8">
          <div className="text-xs text-slate-600 text-center">
            HoopsIntel v0.1 · {isDev ? 'Development' : 'Production'}
          </div>
        </div>
      </div>
    </>
  )
}
