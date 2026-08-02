import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoadingView } from '../../components/feedback/LoadingView'

const LandingPage = lazy(() => import('../../features/rooms/pages/LandingPage').then(module => ({ default: module.LandingPage })))
const LobbyPage = lazy(() => import('../../features/lobby/pages/LobbyPage').then(module => ({ default: module.LobbyPage })))
const HostControlPage = lazy(() => import('../../features/host-control/pages/HostControlPage').then(module => ({ default: module.HostControlPage })))
const DisplayPage = lazy(() => import('../../features/display/pages/DisplayPage').then(module => ({ default: module.DisplayPage })))
const TvAccessPage = lazy(() => import('../../features/display/pages/TvAccessPage').then(module => ({ default: module.TvAccessPage })))

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingView />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/room/:code" element={<LobbyPage />} />
          <Route path="/room/:code/host" element={<HostControlPage />} />
          <Route path="/room/:code/display" element={<DisplayPage />} />
          <Route path="/tv" element={<TvAccessPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
