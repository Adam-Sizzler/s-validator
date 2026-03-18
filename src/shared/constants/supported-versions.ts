export interface VersionOption {
    label: string
    value: string
}

export const DEFAULT_SUPPORTED_VERSION = '1.13.3'

export const SUPPORTED_VERSION_OPTIONS: VersionOption[] = [
    {
        label: '1.13.3:latest_git',
        value: DEFAULT_SUPPORTED_VERSION
    }
]
