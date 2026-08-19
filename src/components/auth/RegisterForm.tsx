import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabaseClient"
import {
  registerFormSchema,
  type RegisterFormValues,
} from "@/components/auth/register-form.schema"

/**
 * Registration form for new citizen accounts.
 *
 * Creates a Supabase auth user and writes a matching citizen profile —
 * including DPI, phone, and optional address — so the administrative module
 * can verify a reporting citizen's identity when managing incidents.
 *
 * @component
 * @module Auth
 * @returns {JSX.Element} Citizen registration form with status feedback.
 */
export function RegisterForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      dpi: "",
      phone: "",
      address: "",
    },
  })

  const handleSubmit = async (values: RegisterFormValues) => {
    setErrorMessage(null)
    setSuccessMessage(null)

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    })

    if (error) {
      setErrorMessage(error.message)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        role: "citizen",
        dpi: values.dpi,
        phone: values.phone,
        address: values.address ? values.address : null,
      })

      if (profileError) {
        setErrorMessage(profileError.message)
        return
      }
    }

    setSuccessMessage(
      "Cuenta creada. Revisa tu correo para confirmar el acceso si está habilitado en Auth."
    )
    form.reset()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo electrónico</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dpi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de DPI</FormLabel>
              <FormControl>
                <Input
                  inputMode="numeric"
                  placeholder="13 dígitos"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de teléfono</FormLabel>
              <FormControl>
                <Input
                  inputMode="numeric"
                  placeholder="8 dígitos"
                  autoComplete="tel"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección (opcional)</FormLabel>
              <FormControl>
                <Input autoComplete="street-address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
        {successMessage && (
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            {successMessage}
          </p>
        )}

        <Button
          type="submit"
          variant="secondary"
          className="h-11 w-full bg-muni-green text-[#153d0c] hover:bg-muni-green/90"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Creando cuenta..." : "Registrarme como ciudadano"}
        </Button>
      </form>
    </Form>
  )
}
