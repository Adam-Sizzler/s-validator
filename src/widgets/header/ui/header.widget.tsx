import { ActionIcon, Group, Text, Title } from '@mantine/core'
import { PiGithubLogo, PiStar } from 'react-icons/pi'

import { StickyHeader } from '@/shared/ui/sticky-header'

import classes from './header.module.css'

interface Props {
    version: null | string
}

export function HeaderWidget(props: Props) {
    const { version } = props
    let normalizedVersion = 'v1.11.13'
    if (version) {
        normalizedVersion = version.startsWith('v') ? version : `v${version}`
    }
    const singboxTagUrl = `https://github.com/SagerNet/sing-box/tree/${normalizedVersion}`

    return (
        <StickyHeader className={classes.root} px="md">
            <Group h="100%" justify="space-between">
                <Title order={3}>S Validator</Title>

                <ActionIcon
                    component="a"
                    href="https://github.com/Adam-Sizzler/s-validator"
                    size="lg"
                    target="_blank"
                    variant="subtle"
                >
                    <PiGithubLogo size={24} />
                </ActionIcon>
            </Group>

            <Group gap="xs">
                <Text c="dimmed" size="md">
                    Powered by
                </Text>
                <Text
                    className={classes.logoLink}
                    component="a"
                    href={singboxTagUrl}
                    rel="noreferrer"
                    target="_blank"
                >
                    <picture>
                        <source media="(prefers-color-scheme: dark)" srcSet="./favicon-dark.svg" />
                        <source media="(prefers-color-scheme: light)" srcSet="./favicon-light.svg" />
                        <img alt="sing-box" className={classes.logoIcon} src="./favicon-light.svg" />
                    </picture>
                </Text>

                <ActionIcon
                    component="a"
                    href={singboxTagUrl}
                    size="lg"
                    target="_blank"
                    variant="subtle"
                >
                    <PiStar size={24} />
                </ActionIcon>
            </Group>
        </StickyHeader>
    )
}
