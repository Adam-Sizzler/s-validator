import { VersionOption } from '@/shared/constants'

export interface Props {
    config: Record<string, unknown> | string
    onSelectVersion: (version: string) => void
    selectedVersion: string
    version: null | string
    versionOptions: VersionOption[]
}
