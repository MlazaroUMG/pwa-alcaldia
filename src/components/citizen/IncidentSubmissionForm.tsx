import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ImagePlus } from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
export function IncidentSubmissionForm({ userId }: IncidentSubmissionFormProps) {
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

  const latitude = form.watch("latitude")
  const longitude = form.watch("longitude")

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
        className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8"
        noValidate
      >
        <header className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Reportar incidente
          </h1>
          <p className="text-sm text-muted-foreground">
            Describe el problema para que la Alcaldía Auxiliar de Zona 18 pueda
            atenderlo.
          </p>
        </header>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. Fuga de agua en la calle principal"
                  autoComplete="off"
                  className="h-11 text-base sm:h-10 sm:text-sm"
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
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalla qué ocurre, dónde y desde cuándo..."
                  rows={5}
                  className="min-h-32 text-base sm:min-h-28 sm:text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11 w-full text-base sm:h-10 sm:text-sm">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {INCIDENT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photo"
          render={({ field: { onChange, ref, value, ...field } }) => (
            <FormItem>
              <FormLabel>Fotografía (opcional)</FormLabel>
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
                      "flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-muted/30 px-4 py-8 text-center transition-colors",
                      "hover:border-ring hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                      "active:bg-muted/60"
                    )}
                  >
                    <ImagePlus
                      className="size-8 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-foreground">
                      Toca para tomar o seleccionar una foto
                    </span>
                    <span className="text-xs text-muted-foreground">
                      JPG, PNG o WEBP
                    </span>
                  </button>
                  {value instanceof File && (
                    <p className="truncate text-sm text-muted-foreground">
                      Archivo seleccionado:{" "}
                      <span className="font-medium text-foreground">
                        {value.name}
                      </span>
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
              <FormLabel>Ubicación del incidente</FormLabel>
              <FormControl>
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
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full bg-muni-green text-[#153d0c] hover:bg-muni-green/90 sm:h-11 sm:text-sm"
          disabled={form.formState.isSubmitting}
        >
          Enviar reporte
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