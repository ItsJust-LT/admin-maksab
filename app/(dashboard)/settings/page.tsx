import { Suspense } from 'react'
import { getBankDetails } from './actions'
import { SettingsForm } from './form'
import Loading from '@/app/loading'



async function SettingsFormWrapper() {
  const bankDetails = await getBankDetails()
  return <SettingsForm initialData={bankDetails} />
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Suspense fallback={<Loading />}>
        <SettingsFormWrapper />
      </Suspense>
    </div>
  )
}