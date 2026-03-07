import { VersionOption } from '@/shared/constants'

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Props {
    editorRef: any
    isConfigValid: boolean
    isSaving: boolean
    monacoRef: any
    onSelectVersion: (version: string) => void
    selectedVersion: string
    setIsSaving: (value: boolean) => void
    setResult: (value: string) => void
    versionOptions: VersionOption[]
}
