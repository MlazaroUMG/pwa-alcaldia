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
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Recuperar contraseña
          </h1>
          <p className="text-sm text-muted-foreground">
            Ingresa el correo de tu cuenta. No reutilizamos el correo del inicio de sesión.
          </p>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo electrónico</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" maxLength={254} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <p className="text-sm text-muted-foreground">{form.formState.errors.root.message}</p>
        )}

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Enviando..." : "Enviar enlace"}
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="w-full text-sm text-primary underline-offset-4 hover:underline"
        >
          Volver al inicio de sesión
        </button>
      </form>
    </Form>
  )
}
