import { useEffect, useState } from 'react'
import { consola } from 'consola/browser'

import {
    DEFAULT_CONFIG,
    DEFAULT_SUPPORTED_VERSION,
    LATEST_SUPPORTED_VERSION,
    SUPPORTED_VERSION_OPTIONS
} from '@/shared/constants'
import { fetchWithProgress } from '@/shared/utils/fetch-with-progress'
import { LoadingScreen } from '@/shared/ui/loading-screen'

import { ConfigPageComponent } from '../components/config.page.component'

export function ConfigPageConnector() {
    const trimSlashes = (value: string): string => value.replace(/^\/+|\/+$/g, '')
    const resolveBasePrefix = (pathname: string): string => {
        const normalizedPathname = trimSlashes(pathname)
        if (!normalizedPathname) {
            return ''
        }

        const segments = normalizedPathname.split('/')
        const versionSegmentIndex = segments.indexOf('v')

        if (versionSegmentIndex > 0) {
            return `/${segments.slice(0, versionSegmentIndex).join('/')}`
        }

        if (versionSegmentIndex === 0) {
            return ''
        }

        return `/${segments[0]}`
    }
    const resolvePathVersion = (pathname: string): string => {
        const normalizedPathname = trimSlashes(pathname)
        if (!normalizedPathname) {
            return ''
        }

        const segments = normalizedPathname.split('/')
        const versionSegmentIndex = segments.indexOf('v')
        if (versionSegmentIndex < 0) {
            return ''
        }

        return segments[versionSegmentIndex + 1] || ''
    }
    const resolveSelectedVersion = (pathname: string): string => {
        const normalizedPathname = trimSlashes(pathname)
        if (!normalizedPathname) {
            return DEFAULT_SUPPORTED_VERSION
        }

        const segments = normalizedPathname.split('/')
        const versionSegmentIndex = segments.indexOf('v')
        const versionFromPath = versionSegmentIndex >= 0 ? segments[versionSegmentIndex + 1] : ''

        if (!versionFromPath) {
            return DEFAULT_SUPPORTED_VERSION
        }

        if (versionFromPath === DEFAULT_SUPPORTED_VERSION || versionFromPath === LATEST_SUPPORTED_VERSION) {
            return versionFromPath
        }

        return DEFAULT_SUPPORTED_VERSION
    }
    const buildVersionUrl = (basePrefix: string, value: string): string => {
        if (value === DEFAULT_SUPPORTED_VERSION) {
            return `${basePrefix || ''}/`
        }
        return `${basePrefix || ''}/v/${value}/`
    }
    const isSupportedVersion = (value: string): boolean =>
        SUPPORTED_VERSION_OPTIONS.some((option) => option.value === value)

    const [downloadProgress, setDownloadProgress] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [basePrefix, setBasePrefix] = useState('')
    const [selectedVersion, setSelectedVersion] = useState(DEFAULT_SUPPORTED_VERSION)
    const [version, setVersion] = useState<string>('')

    const config = DEFAULT_CONFIG

    const selectVersion = (nextVersion: string) => {
        if (!isSupportedVersion(nextVersion)) return
        if (nextVersion === selectedVersion) return
        const targetUrl = buildVersionUrl(basePrefix, nextVersion)
        window.location.assign(targetUrl)
    }

    useEffect(() => {
        const detectedBasePrefix = resolveBasePrefix(window.location.pathname)
        const requestedVersion = resolvePathVersion(window.location.pathname)
        if (requestedVersion && !isSupportedVersion(requestedVersion)) {
            window.location.replace(buildVersionUrl(detectedBasePrefix, DEFAULT_SUPPORTED_VERSION))
            return () => {}
        }

        const detectedSelectedVersion = resolveSelectedVersion(window.location.pathname)
        setBasePrefix(detectedBasePrefix)
        setSelectedVersion(detectedSelectedVersion)

        const initWasm = async () => {
            try {
                const go = new window.Go()
                const wasmInitialized = new Promise<void>((resolve) => {
                    window.onWasmInitialized = () => {
                        consola.info('WASM module initialized')
                        resolve()
                    }
                })

                const wasmBytes = await fetchWithProgress('main.wasm', setDownloadProgress)

                const { instance } = await WebAssembly.instantiate(wasmBytes, go.importObject)
                go.run(instance)
                await wasmInitialized

                if (typeof window.SingboxParseConfig === 'function') {
                    setIsLoading(false)
                } else {
                    throw new Error('SingboxParseConfig not initialized')
                }

                if (typeof window.SingboxGetVersion === 'function') {
                    const singboxVersion = window.SingboxGetVersion()
                    setVersion(singboxVersion)
                }
            } catch (err: unknown) {
                consola.error('WASM initialization error:', err)
                setIsLoading(false)
            }
        }

        initWasm()
        return () => {
            delete window.onWasmInitialized
        }
    }, [])

    if (isLoading) {
        return <LoadingScreen text={`WASM module is loading...`} value={downloadProgress} />
    }

    return (
        <ConfigPageComponent
            config={config}
            onSelectVersion={selectVersion}
            selectedVersion={selectedVersion}
            version={version}
            versionOptions={SUPPORTED_VERSION_OPTIONS}
        />
    )
}
