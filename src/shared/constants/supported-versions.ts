export interface VersionOption {
    label: string
    value: string
}

export const DEFAULT_SUPPORTED_VERSION = '1.11.13'
export const LATEST_SUPPORTED_VERSION = 'latest'

export const SUPPORTED_VERSION_OPTIONS: VersionOption[] = [
    {
        label: '1.11.13:latest_ios',
        value: DEFAULT_SUPPORTED_VERSION
    },
    {
        label: '1.13.1:latest_git',
        value: LATEST_SUPPORTED_VERSION
    }
]
