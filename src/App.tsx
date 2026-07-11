import { AdminTicketTable } from "@/components/admin/AdminTicketTable"
import { IncidentSubmissionForm } from "@/components/citizen/IncidentSubmissionForm"
import { MainHeader } from "@/components/layout/MainHeader"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import "./App.css"

function App() {
  return (
    <div className="min-h-screen bg-background">
      <MainHeader />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Tabs defaultValue="citizen" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-fit">
            <TabsTrigger value="citizen">Registro Ciudadano</TabsTrigger>
            <TabsTrigger value="admin">Dashboard Admin</TabsTrigger>
          </TabsList>

          <TabsContent
            value="citizen"
            className="mt-4 rounded-lg border bg-card shadow-sm"
          >
            <IncidentSubmissionForm />
          </TabsContent>

          <TabsContent value="admin" className="mt-4">
            <AdminTicketTable />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App
