import { createBrowserRouter } from 'react-router-dom'
import ConsentScreen from '@/components/ConsentScreen'
import ReportingConsentGate from '@/components/ReportingConsentGate'
import ProjectGate from '@/components/reporting/ProjectGate'
import AuthShell from '@/routes/AuthShell'
import ReportingLayout from '@/routes/ReportingLayout'
import HomePage from '@/routes/HomePage'
import RunDetailPage from '@/routes/RunDetailPage'
import AdminAccessRequestsPage from '@/routes/AdminAccessRequestsPage'

export const router = createBrowserRouter([
  { path: '/oauth/consent', element: <ConsentScreen /> },
  {
    path: '/',
    element: <AuthShell />,
    children: [
      {
        element: <ReportingConsentGate />,
        children: [
          {
            element: <ProjectGate />,
            children: [
              {
                element: <ReportingLayout />,
                children: [
                  { index: true, element: <HomePage /> },
                  { path: 'runs/:runId', element: <RunDetailPage /> },
                  {
                    path: 'admin/access-requests',
                    element: <AdminAccessRequestsPage />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
])
