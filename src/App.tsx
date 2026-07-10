import { AdminTicketTable } from "@/components/admin/AdminTicketTable"
import { IncidentSubmissionForm } from "@/components/citizen/IncidentSubmissionForm"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import "./App.css"

function App() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Prototipo PWA Alcaldia - Zona 18
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Demostracion del flujo ciudadano y panel administrativo.
        </p>
      </header>

      <Tabs defaultValue="citizen" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-fit">
          <TabsTrigger value="citizen">Registro Ciudadano</TabsTrigger>
          <TabsTrigger value="admin">Dashboard Admin</TabsTrigger>
        </TabsList>

        <TabsContent value="citizen" className="mt-4 rounded-lg border bg-card">
          <IncidentSubmissionForm />
        </TabsContent>

        <TabsContent value="admin" className="mt-4">
          <AdminTicketTable />
        </TabsContent>
      </Tabs>
    </main>
  )
}

export default App
