import { Container } from '@mantine/core'

import { ConfigEditorWidget } from '@widgets/config/config-editor'
import { HeaderWidget } from '@widgets/header'
import { Page } from '@/shared/ui/page'

import { Props } from './interfaces'

export const ConfigPageComponent = (props: Props) => {
    const { config, onSelectVersion, selectedVersion, version, versionOptions } = props

    return (
        <>
            <HeaderWidget version={version} />

            <Container size="lg">
                <Page title="Config">
                    <ConfigEditorWidget
                        config={config}
                        onSelectVersion={onSelectVersion}
                        selectedVersion={selectedVersion}
                        version={version}
                        versionOptions={versionOptions}
                    />
                </Page>
            </Container>
        </>
    )
}
