export const INCIDENT_CATEGORIES = [
  "Áreas verdes y jardinería",
  "Limpieza urbana",
  "Infraestructura vial",
  "Agua potable",
  "Drenajes y alcantarillado",
  "Consultas y solicitudes",
] as const

export type IncidentCategory = (typeof INCIDENT_CATEGORIES)[number]

export const INCIDENT_DEPENDENCIES = [
  "Regencia Norte - Servicios",
  "Empagua - Distribución",
  "Empagua - Sistemas Drenajes",
] as const

export type IncidentDependency = (typeof INCIDENT_DEPENDENCIES)[number]

export interface IncidentCallType {
  code: number
  label: string
  category: IncidentCategory
}

export const INCIDENT_CALL_TYPES_BY_DEPENDENCY = {
  "Regencia Norte - Servicios": [
    { code: 501, label: "MANTENIMIENTO DE ÁREAS VERDES", category: "Áreas verdes y jardinería" },
    {
      code: 502,
      label: "MANTENIMIENTO DE JARDINES EN BOULEVARES PRINCIPALES",
      category: "Áreas verdes y jardinería",
    },
    { code: 503, label: "JARDINIZACIONES", category: "Áreas verdes y jardinería" },
    { code: 504, label: "PODAS Y TALAS MENORES", category: "Áreas verdes y jardinería" },
    { code: 505, label: "CHAPEO", category: "Áreas verdes y jardinería" },
    { code: 506, label: "REFORESTACIONES", category: "Áreas verdes y jardinería" },
    { code: 507, label: "RETIRO DE RIPIO", category: "Limpieza urbana" },
    { code: 508, label: "LIMPIEZA DE REJILLAS", category: "Limpieza urbana" },
    { code: 509, label: "LIMPIEZA DE CUNETAS (REGENCIA NORTE)", category: "Limpieza urbana" },
    { code: 510, label: "LIMPIEZA DE BASUREROS CLANDESTINOS", category: "Limpieza urbana" },
    { code: 511, label: "LIMPIEZA DE TRAGANTES (REGENCIA NORTE)", category: "Limpieza urbana" },
    { code: 512, label: "BACHEO", category: "Infraestructura vial" },
    { code: 513, label: "PINTURA DE BORDILLOS", category: "Infraestructura vial" },
  ],
  "Empagua - Distribución": [
    { code: 601, label: "FUGAS DE AGUA", category: "Agua potable" },
    { code: 602, label: "FALTAS DE AGUA SECTORIAL", category: "Agua potable" },
    { code: 603, label: "FALTAS DE AGUA LOCAL (DOMICILIAR)", category: "Agua potable" },
    { code: 604, label: "MANEJO Y COLOCACIÓN DE LLAVE DE PASO", category: "Agua potable" },
    {
      code: 605,
      label: "SOLICITUD DE RELLENOS POR REPARACIONES DE EMPAGUA",
      category: "Infraestructura vial",
    },
    { code: 606, label: "CONSULTAS - EMPAGUA - DISTRIBUCIÓN", category: "Consultas y solicitudes" },
    { code: 608, label: "RIPIO POR TRABAJOS DE EMPAGUA", category: "Infraestructura vial" },
    { code: 609, label: "BANQUETAS POR TRABAJOS DE EMPAGUA", category: "Infraestructura vial" },
  ],
  "Empagua - Sistemas Drenajes": [
    { code: 701, label: "DRENAJES (TRAGANTES)", category: "Drenajes y alcantarillado" },
    { code: 702, label: "HUNDIMENTOS", category: "Drenajes y alcantarillado" },
    { code: 703, label: "COLOCACION DE TAPADERAS DE REGISTRO", category: "Drenajes y alcantarillado" },
    { code: 704, label: "DESAGÜES A FLOR DE TIERRA", category: "Drenajes y alcantarillado" },
    { code: 705, label: "SOLICITUDES", category: "Consultas y solicitudes" },
    { code: 706, label: "CONSULTAS - SISTEMA DRENAJES", category: "Consultas y solicitudes" },
    { code: 707, label: "DRENAJE CON FUGA", category: "Drenajes y alcantarillado" },
    { code: 709, label: "TAPADERAS DE DRENAJE (TRAGANTE)", category: "Drenajes y alcantarillado" },
  ],
} as const satisfies Record<IncidentDependency, readonly IncidentCallType[]>

export function getCallTypeLabel(callType: IncidentCallType) {
  return `${callType.code} - ${callType.label}`
}

export function getCallTypeByCode(
  dependency: IncidentDependency,
  code: number
) {
  return INCIDENT_CALL_TYPES_BY_DEPENDENCY[dependency].find(
    (callType) => callType.code === code
  )
}

export function isValidCallTypeForDependency(
  dependency: IncidentDependency,
  code: number
) {
  return getCallTypeByCode(dependency, code) !== undefined
}
