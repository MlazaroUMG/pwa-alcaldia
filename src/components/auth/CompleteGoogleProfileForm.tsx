import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { BrandLogo } from "@/components/layout/BrandLogo"
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

const completeGoogleProfileSchema = z.object({
  dpi: z
    .string()
    .trim()
    .regex(/^\d{13}$/, "El DPI debe tener 13 dígitos numéricos."),
  phone: z
    .string()
    .trim()
    .regex(/^\d{8}$/, "El teléfono debe tener 8 dígitos numéricos."),
  address: z
    .string()
    .trim()
    .max(200, "La dirección no puede superar 200 caracteres.")
    .optional()
    .or(z.literal("")),
})

type CompleteGoogleProfileValues = z.infer<typeof completeGoogleProfileSchema>

interface CompleteGoogleProfileFormProps {
  userId: string
  email?: string
  onCompleted: () => void
  onSignOut: () => void
}

/**
 * Completa datos obligatorios antes de permitir el acceso ciudadano.
 *
 * @component
 * @module Auth
 */
export function CompleteGoogleProfileForm({
  userId,
  email,
  onCompleted,
  onSignOut,
}: CompleteGoogleProfileFormProps) {
  const form = useForm<CompleteGoogleProfileValues>({
    resolver: zodResolver(completeGoogleProfileSchema),
    defaultValues: {
      dpi: "",
      phone: "",
      address: "",
    },
  })

  useEffect(() => {
    const loadCurrentValues = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("dpi,phone,address")
        .eq("id", userId)
        .maybeSingle()

      if (error) {
        form.setError("root", { message: toUserFacingError(error) })
        return
      }

      form.reset({
        dpi: data?.dpi ?? "",
        phone: data?.phone ?? "",
        address: data?.address ?? "",
      })
    }

    void loadCurrentValues()
  }, [form, userId])

  const handleSubmit = async (values: CompleteGoogleProfileValues) => {
    form.clearErrors("root")

    const { error } = await supabase
      .from("profiles")
      .update({
        dpi: values.dpi,
        phone: values.phone,
        address: values.address || null,
      })
      .eq("id", userId)

    if (error) {
      form.setError("root", { message: toUserFacingError(error) })
      return
    }

    onCompleted()
  }

  return (
    <main className="min-h-screen bg-[#edf3fb] px-4 py-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md items-center">
        <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <BrandLogo className="size-12 border-slate-200" />
            <div>
              <p className="font-display font-bold text-gray-900">PWA Alcaldia</p>
              <p className="text-xs text-gray-500">{email}</p>
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold text-gray-950">
            Completa tu perfil
          </h1>
          <p className="mb-6 mt-1 text-sm text-gray-600">
            Estos datos son obligatorios para validar tus reportes. No se
            publican en el muro comunitario.
          </p>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
              noValidate
            >
              <FormField
                control={form.control}
                name="dpi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">DPI *</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        autoComplete="off"
                        className="bg-white text-gray-900 dark:bg-white dark:text-gray-900"
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
                    <FormLabel className="text-gray-700">Teléfono *</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        autoComplete="tel"
                        className="bg-white text-gray-900 dark:bg-white dark:text-gray-900"
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
                    <FormLabel className="text-gray-700">
                      Dirección (opcional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="street-address"
                        className="bg-white text-gray-900 dark:bg-white dark:text-gray-900"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.formState.errors.root?.message && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.root.message}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-500 text-white hover:bg-blue-600"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Guardando..."
                  : "Completar registro"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-gray-600"
                onClick={onSignOut}
              >
                Cerrar sesión
              </Button>
            </form>
          </Form>
        </section>
      </div>
    </main>
  )
}
