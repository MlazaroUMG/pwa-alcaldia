import { useRef, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Camera, ImagePlus, MapPin } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabaseClient"
import { LocationPicker } from "@/components/citizen/LocationPicker"
import {
  INCIDENT_CATEGORIES,
  incidentFormSchema,
  type IncidentFormValues,
  type IncidentSubmissionPayload,
} from "@/components/citizen/incident-form.schema"

interface IncidentSubmissionFormProps {
  userId: string
  onBack?: () => void
}

/**
 * Mobile-first form for citizens to report municipal incidents.
 *
 * Collects a title, description, category, and optional photo through
 * validated fields powered by React Hook Form and Zod. On successful
 * submission, photos are uploaded to Supabase Storage and incident rows are
 * written to the database.
 *
 * @component
 * @module Citizen
 * @returns {JSX.Element} Validated incident report form for the Citizen PWA module.
 */
export function IncidentSubmissionForm({ userId, onBack }: IncidentSubmissionFormProps) {
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [photoInputKey, setPhotoInputKey] = useState(0)
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: undefined,
      photo: undefined,
      latitude: undefined,
      longitude: undefined,
    },
  })

  const latitude = useWatch({ control: form.control, name: "latitude" })
  const longitude = useWatch({ control: form.control, name: "longitude" })

  const handleSubmit = async (values: IncidentFormValues) => {
    setSubmitFeedback(null)
    setSubmitError(null)

    const payload: IncidentSubmissionPayload = {
      title: values.title,
      description: values.description,
      category: values.category,
      photo: values.photo ?? null,
      latitude: values.latitude,
      longitude: values.longitude,
    }

    let imageUrl: string | null = null

    if (payload.photo) {
      const fileExtension = payload.photo.name.split(".").pop() ?? "jpg"
      const baseName = payload.photo.name.replace(/\.[^/.]+$/, "")
      const normalizedFileName = baseName
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase()
      const filePath = `${userId}/${payload.photo.lastModified}-${normalizedFileName}.${fileExtension}`

      const { error: uploadError } = await supabase.storage
        .from("incident-photos")
        .upload(filePath, payload.photo, {
          upsert: false,
        })

      if (uploadError) {
        setSubmitError(uploadError.message)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from("incident-photos")
        .getPublicUrl(filePath)

      imageUrl = publicUrlData.publicUrl
    }

    const { error: insertError } = await supabase.from("incidents").insert({
      user_id: userId,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      status: "Pendiente",
      image_url: imageUrl,
      is_public: false,
      resolution_summary: null,
      resolved_at: null,
      latitude: payload.latitude,
      longitude: payload.longitude,
    })

    if (insertError) {
      setSubmitError(insertError.message)
      return
    }

    form.reset({
      title: "",
      description: "",
      category: undefined,
      photo: undefined,
      latitude: undefined,
      longitude: undefined,
    })
    setPhotoInputKey((previous) => previous + 1)
    setSubmitFeedback("Incidencia registrada correctamente.")
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex w-full flex-col gap-5 px-4 py-5"
        noValidate
      >
        <header className="space-y-5">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-indigo-300 transition-colors hover:text-gray-100"
          >
            <ArrowLeft className="size-4" />
            Volver
          </button>
          <h1 className="font-display text-xl font-bold text-gray-100">
            Reportar Incidencia
          </h1>
        </header>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Categoría *
              </FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {INCIDENT_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        form.setValue("category", category, { shouldValidate: true })
                      }
                      className={cn(
                        "rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                        field.value === category
                          ? "border-indigo-500 bg-indigo-500 text-white"
                          : "border-gray-200 bg-white text-gray-600 hover:border-indigo-300"
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Título *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Describe brevemente el problema"
                  autoComplete="off"
                  className="h-14 rounded-xl border-indigo-200 bg-transparent px-4 text-base text-gray-100 placeholder:text-indigo-300/40 focus-visible:ring-indigo-300"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Descripción
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Proporciona más detalles sobre la incidencia..."
                  rows={5}
                  className="min-h-32 resize-none rounded-xl border-indigo-200 bg-transparent px-4 py-3 text-base text-gray-100 placeholder:text-indigo-300/40 focus-visible:ring-indigo-300"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photo"
          render={({ field: { onChange, ref, value, ...field } }) => (
            <FormItem>
              <FormLabel className="block text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Fotografía de evidencia
              </FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <input
                    key={photoInputKey}
                    {...field}
                    ref={(element) => {
                      ref(element)
                      photoInputRef.current = element
                    }}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      onChange(file)
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className={cn(
                      "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-7 text-center transition-all",
                      "border-gray-200 bg-gray-100 text-gray-400 hover:border-gray-300 focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:outline-none"
                    )}
                  >
                    {value instanceof File ? (
                      <ImagePlus className="size-7 text-indigo-500" aria-hidden="true" />
                    ) : (
                      <Camera className="size-7 text-gray-400" aria-hidden="true" />
                    )}
                    <span className="text-sm">
                      {value instanceof File
                        ? "Foto adjuntada"
                        : "Tomar foto o seleccionar galería"}
                    </span>
                  </button>
                  {value instanceof File && (
                    <p className="break-all text-sm text-indigo-300">
                      Archivo seleccionado:{" "}
                      <span className="font-medium text-gray-100">{value.name}</span>
                    </p>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="latitude"
          render={() => (
            <FormItem>
              <FormLabel className="block text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Ubicación *
              </FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-100 px-4 py-3 text-gray-400">
                    <MapPin className="size-5" />
                    <span className="text-sm">
                      {latitude !== undefined && longitude !== undefined
                        ? "Ubicación GPS capturada"
                        : "Usar mi ubicación GPS"}
                    </span>
                  </div>
                  <LocationPicker
                    value={
                      latitude !== undefined && longitude !== undefined
                        ? { latitude, longitude }
                        : null
                    }
                    onChange={(coordinates) => {
                      form.setValue("latitude", coordinates.latitude, {
                        shouldValidate: true,
                      })
                      form.setValue("longitude", coordinates.longitude, {
                        shouldValidate: true,
                      })
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          className="h-14 w-full rounded-2xl bg-indigo-500 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 disabled:opacity-50"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Enviando..." : "Enviar reporte"}
        </Button>

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}
        {submitFeedback && (
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            {submitFeedback}
          </p>
        )}
      </form>
    </Form>
  )
}