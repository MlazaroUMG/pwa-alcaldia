import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

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
import { emailSchema } from "@/lib/validation"

const forgotPasswordSchema = z.object({
  email: emailSchema,
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

interface ForgotPasswordFormProps {
  onBack: () => void
}

/**
 * Solicita el correo de recuperación sin depender del formulario de acceso.
 *
 * @component
 * @module Auth
 */
export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    const redirectTo = `${window.location.origin}/?reset=1`
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo,
    })

    if (error) {
      form.setError("root", { message: toUserFacingError(error) })
      return
    }

    form.setError("root", {
      message: "Si el correo existe, enviaremos un enlace para restablecer la contraseña.",
    })
  })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-semibold text-gray-950">
            Recuperar contraseña
          </h1>
          <p className="text-sm text-gray-500">
            Ingresa el correo de tu cuenta. No reutilizamos el correo del inicio de sesión.
          </p>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">Correo electrónico</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  className="rounded-xl border-gray-200 bg-white px-4 py-6 text-sm text-gray-900 placeholder:text-gray-300 dark:bg-white dark:text-gray-900"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <p className="text-sm text-gray-600">{form.formState.errors.root.message}</p>
        )}

        <Button
          type="submit"
          className="w-full rounded-xl bg-blue-500 py-6 font-semibold text-white hover:bg-blue-600"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Enviando..." : "Enviar enlace"}
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="w-full text-sm text-blue-600 underline-offset-4 hover:underline"
        >
          Volver al inicio de sesión
        </button>
      </form>
    </Form>
  )
}
