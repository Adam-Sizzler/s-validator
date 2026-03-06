declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Go: typeof window.Go
        onWasmInitialized?: () => void
        SingboxGetVersion?: () => string

        SingboxParseConfig: (config: string) => null | string
    }
}

export {}
