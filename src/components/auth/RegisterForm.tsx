import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toUserFacingError } from "@/lib/network-errors"
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
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
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
      options: {
        data: {
          first_name: values.firstName,
          last_name: values.lastName,
          full_name: `${values.firstName} ${values.lastName}`,
        },
      },
    })

    if (error) {
      setErrorMessage(toUserFacingError(error))
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        role: "citizen",
        first_name: values.firstName,
        last_name: values.lastName,
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

  const handleGoogleSignUp = async () => {
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsGoogleSubmitting(true)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (error) {
      setErrorMessage(toUserFacingError(error))
      setIsGoogleSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-gray-600">Nombre *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Juan"
                    autoComplete="given-name"
                    className="rounded-xl border-gray-200 bg-white px-4 py-6 text-sm text-gray-900 placeholder:text-gray-300 focus-visible:ring-blue-400 dark:bg-white dark:text-gray-900"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-gray-600">Apellido *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Pérez"
                    autoComplete="family-name"
                    className="rounded-xl border-gray-200 bg-white px-4 py-6 text-sm text-gray-900 placeholder:text-gray-300 focus-visible:ring-blue-400 dark:bg-white dark:text-gray-900"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-gray-600">Correo electrónico *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="juan@correo.com"
                  autoComplete="email"
                  className="rounded-xl border-gray-200 bg-white px-4 py-6 text-sm text-gray-900 placeholder:text-gray-300 focus-visible:ring-blue-400 dark:bg-white dark:text-gray-900"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="dpi"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-gray-600">DPI *</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    placeholder="0000000000000"
                    autoComplete="off"
                    className="rounded-xl border-gray-200 bg-white px-4 py-6 text-sm text-gray-900 placeholder:text-gray-300 focus-visible:ring-blue-400 dark:bg-white dark:text-gray-900"
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
                <FormLabel className="text-sm text-gray-600">Teléfono *</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    placeholder="50000000"
                    autoComplete="tel"
                    className="rounded-xl border-gray-200 bg-white px-4 py-6 text-sm text-gray-900 placeholder:text-gray-300 focus-visible:ring-blue-400 dark:bg-white dark:text-gray-900"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-gray-600">Dirección (opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Zona 18, Ciudad de Guatemala"
                  autoComplete="street-address"
                  className="rounded-xl border-gray-200 bg-white px-4 py-6 text-sm text-gray-900 placeholder:text-gray-300 focus-visible:ring-blue-400 dark:bg-white dark:text-gray-900"
                  {...field}
                />
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
              <FormLabel className="text-sm text-gray-600">Contraseña *</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="********"
                  autoComplete="new-password"
                  className="rounded-xl border-gray-200 bg-white px-4 py-6 text-sm text-gray-900 placeholder:text-gray-300 focus-visible:ring-blue-400 dark:bg-white dark:text-gray-900"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-gray-600">
                Confirmar contraseña *
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="********"
                  autoComplete="new-password"
                  className="rounded-xl border-gray-200 bg-white px-4 py-6 text-sm text-gray-900 placeholder:text-gray-300 focus-visible:ring-blue-400 dark:bg-white dark:text-gray-900"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <label className="flex cursor-pointer items-start gap-2 pt-1 text-xs text-gray-500">
          <input required type="checkbox" className="mt-0.5 size-4 shrink-0 rounded accent-blue-500" />
          <span>
            Acepto los términos y condiciones y la política de privacidad del
            sistema municipal.
          </span>
        </label>

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
        {successMessage && (
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            {successMessage}
          </p>
        )}

        <Button
          type="submit"
          className="w-full rounded-xl bg-blue-500 py-6 font-semibold text-white shadow-sm transition-colors hover:bg-blue-600"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-100" />
          <span className="text-xs text-gray-400">O registrarse con</span>
          <div className="h-px flex-1 bg-gray-100" />
        </div>

        <GoogleAuthButton
          label="Continuar con Google"
          isLoading={isGoogleSubmitting}
          disabled={form.formState.isSubmitting}
          onClick={handleGoogleSignUp}
        />
      </form>
    </Form>
  )
}
