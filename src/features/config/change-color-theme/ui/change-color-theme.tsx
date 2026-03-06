import { ActionIcon, Tooltip, useMantineColorScheme } from '@mantine/core'
import { PiMoon, PiSun } from 'react-icons/pi'

export function ChangeColorTheme() {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme()
    const isDark = colorScheme === 'dark'

    return (
        <Tooltip label={isDark ? 'Light mode' : 'Dark mode'}>
            <ActionIcon
                aria-label="Toggle color scheme"
                onClick={() => toggleColorScheme()}
                size="lg"
                variant="outline"
            >
                {isDark ? <PiSun size={'1.4rem'} /> : <PiMoon size={'1.4rem'} />}
            </ActionIcon>
        </Tooltip>
    )
}
