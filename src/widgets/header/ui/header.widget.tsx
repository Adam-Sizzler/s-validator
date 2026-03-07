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
                    <svg
                        aria-label="sing-box"
                        className={classes.logoIcon}
                        fill="none"
                        viewBox="0 0 50 50"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M25 47C23.9439 47 22.9078 46.7122 22.0026 46.1675L8.34547 37.9665C7.47616 37.4456 6.75412 36.7059 6.25534 35.8235C5.76843 34.9435 5.50717 33.9541 5.50004 32.948V16.1442C5.49618 15.1283 5.75652 14.1289 6.25543 13.2444C6.75435 12.3598 7.47466 11.6206 8.34547 11.0994L22.0026 3.80947C22.9128 3.27929 23.947 3 25 3C26.053 3 27.0872 3.27929 27.9974 3.80947L41.6545 11.0994C42.5257 11.6208 43.2462 12.3604 43.7452 13.2454C44.2441 14.1304 44.5042 15.1303 44.4999 16.1465V32.9456C44.4928 33.9541 44.2316 34.9435 43.7447 35.8235C43.2459 36.7059 42.5238 37.4456 41.6545 37.9665L27.9974 46.1675C27.0922 46.7122 26.0561 47 25 47ZM25 47V24.5473M43.7185 13.2924L25 24.5473M25 24.5473L6.28145 13.2927M35.4031 27.221V18.2899L15.6562 7.2134"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                        />
                    </svg>
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
