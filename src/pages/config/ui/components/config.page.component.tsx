import { Box, Container } from '@mantine/core'

import { ConfigEditorWidget } from '@widgets/config/config-editor'
import { HeaderWidget } from '@widgets/header'
import { Page } from '@/shared/ui/page'

import { Props } from './interfaces'
import classes from './config.module.css'

export const ConfigPageComponent = (props: Props) => {
    const { config, onSelectVersion, selectedVersion, version, versionOptions } = props

    return (
        <Box className={classes.shell}>
            <HeaderWidget version={version} />

            <Container className={classes.container} fluid px="md">
                <Page className={classes.page} title="Config">
                    <ConfigEditorWidget
                        config={config}
                        onSelectVersion={onSelectVersion}
                        selectedVersion={selectedVersion}
                        version={version}
                        versionOptions={versionOptions}
                    />
                </Page>
            </Container>
        </Box>
    )
}
