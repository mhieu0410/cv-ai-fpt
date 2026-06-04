import AppNavbar from '@/components/AppNavbar'
import CvForm from '@/components/CvForm'

export default function NewCvPage() {
  return (
    <>
      <AppNavbar />
      <CvForm mode="create" />
    </>
  )
}
