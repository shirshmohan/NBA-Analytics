import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { SettingsProvider } from '@/context/SettingsContext'
import { ThreeProvider } from '@/context/ThreeContext'
import Navbar from '@/components/layout/Navbar'
import { Skeleton } from '@/components/ui/Skeleton'

const HomePage = lazy(() => import('@/pages/HomePage'))
const PlayersPage = lazy(() => import('@/pages/PlayersPage'))
const GamesPage = lazy(() => import('@/pages/GamesPage'))
const ComparePage = lazy(() => import('@/pages/ComparePage'))

function PageLoader() {
  return (
    <div className="min-h-screen pt-14 p-8">
      <div className="max-w-7xl mx-auto space-y-4">
        <Skeleton height="6rem" className="rounded-2xl" />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} height="5rem" className="rounded-xl" />)}
        </div>
        <Skeleton height="16rem" className="rounded-xl" />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <SettingsProvider>
      <ThreeProvider>
        <div className="min-h-screen bg-court-950">
          <Navbar />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/players" element={<PlayersPage />} />
              <Route path="/games" element={<GamesPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="*" element={
                <div className="min-h-screen pt-14 flex items-center justify-center">
                  <div className="text-center">
                    <div className="font-display text-8xl text-orange-500 mb-4">404</div>
                    <div className="text-slate-400 mb-6">Page not found</div>
                    <a href="/" className="btn-primary">Go Home</a>
                  </div>
                </div>
              } />
            </Routes>
          </Suspense>
        </div>
      </ThreeProvider>
    </SettingsProvider>
  )
}
