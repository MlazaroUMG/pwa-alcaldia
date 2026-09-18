import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { PasswordInput } from "@/components/auth/PasswordInput"
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton"
import {
  REGISTER_CONSENT_VERSION,
  registerFormSchema,
  type RegisterFormValues,
} from "@/components/auth/register-form.schema"
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
import { toUserFacingError } from "@/lib/network-errors"
import { supabase } from "@/lib/supabaseClient"
import { FIELD_LIMITS, getPasswordIssues } from "@/lib/validation"

const AUTH_INPUT_CLASS =
  "rounded-xl border-gray-200 bg-white px-4 py-6 text-sm text-gray-900 placeholder:text-gray-300 focus-visible:ring-blue-400 dark:bg-white dark:text-gray-900"

interface RegisterFormProps {
  onOpenPrivacy: () => void
  onOpenUsage: () => void
}

/**
 * Registration form for new citizen accounts.
 *
 * Creates the Auth user with metadata. The profile row is created by a
 * database trigger so the client never upserts as anonymous.
 *
 * @component
 * @module Auth
 */
export function RegisterForm({ onOpenPrivacy, onOpenUsage }: RegisterFormProps) {
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
      acceptedTerms: false,
    },
  })

  const passwordValue = useWatch({ control: form.control, name: "password" })
  const passwordHints = passwordValue ? getPasswordIssues(passwordValue) : []

  const handleSubmit = async (values: RegisterFormValues) => {
    setErrorMessage(null)
    setSuccessMessage(null)

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          first_name: values.firstName,
          last_name: values.lastName,
          full_name: `${values.firstName} ${values.lastName}`,
          dpi: values.dpi,
          phone: values.phone,
          address: values.address || null,
          consent_version: REGISTER_CONSENT_VERSION,
          role: "citizen",
        },
      },
    })

    if (error) {
      setErrorMessage(toUserFacingError(error, "No se pudo crear la cuenta."))
      return
    }

    setSuccessMessage(
      "Cuenta creada. Revisa tu correo para confirmar el acceso si está habilitado."
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
                    maxLength={FIELD_LIMITS.firstName.max}
                    className={AUTH_INPUT_CLASS}
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
                    maxLength={FIELD_LIMITS.lastName.max}
                    className={AUTH_INPUT_CLASS}
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
                  maxLength={FIELD_LIMITS.email.max}
                  className={AUTH_INPUT_CLASS}
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
                    maxLength={13}
                    className={AUTH_INPUT_CLASS}
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
                    maxLength={8}
                    className={AUTH_INPUT_CLASS}
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
                  maxLength={FIELD_LIMITS.address.max}
                  className={AUTH_INPUT_CLASS}
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
                <PasswordInput
                  placeholder="Mínimo 12 caracteres"
                  autoComplete="new-password"
                  maxLength={FIELD_LIMITS.password.maxChars}
                  className={AUTH_INPUT_CLASS}
                  {...field}
                />
              </FormControl>
              {passwordHints.length > 0 && (
                <ul className="list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
                  {passwordHints.map((hint) => (
                    <li key={hint}>{hint}</li>
                  ))}
                </ul>
              )}
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
                <PasswordInput
                  placeholder="Repite la contraseña"
                  autoComplete="new-password"
                  maxLength={FIELD_LIMITS.password.maxChars}
                  className={AUTH_INPUT_CLASS}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="acceptedTerms"
          render={({ field }) => (
            <FormItem>
              <label className="flex cursor-pointer items-start gap-2 pt-1 text-xs text-gray-500">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                  className="mt-0.5 size-4 shrink-0 rounded accent-blue-500"
                />
                <span>
                  Acepto el{" "}
                  <button
                    type="button"
                    className="font-medium text-blue-600 underline-offset-2 hover:underline"
                    onClick={onOpenPrivacy}
                  >
                    aviso de privacidad
                  </button>{" "}
                  y las{" "}
                  <button
                    type="button"
                    className="font-medium text-blue-600 underline-offset-2 hover:underline"
                    onClick={onOpenUsage}
                  >
                    reglas de uso
                  </button>
                  .
                </span>
              </label>
              <FormMessage />
            </FormItem>
          )}
        />

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
        {successMessage && (
          <p className="text-sm text-emerald-700 dark:text-emerald-300">{successMessage}</p>
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
