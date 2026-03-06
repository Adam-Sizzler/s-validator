import { ActionIcon, Group, Text, Title } from '@mantine/core'
import { StickyHeader } from '@/shared/ui/sticky-header'
import { PiGithubLogo, PiStar } from 'react-icons/pi'

import classes from './header.module.css'

export function HeaderWidget() {
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
                    Powered by{' '}
                    <Text component="a" href="https://github.com/SagerNet/sing-box/tree/v1.11.13" inherit>
                        sing-box@v1.11.13
                    </Text>
                </Text>

                <ActionIcon
                    component="a"
                    href="https://github.com/SagerNet/sing-box/tree/v1.11.13"
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
