import { PiCaretDown, PiCheckSquareOffset } from 'react-icons/pi'
import { Button, Group, Menu } from '@mantine/core'

import { ChangeColorTheme } from '@features/config/change-color-theme/ui/change-color-theme'

import { Props } from './interfaces'

export function ConfigEditorActionsFeature(props: Props) {
    const { editorRef, onSelectVersion, selectedVersion, versionOptions } = props

    const formatDocument = () => {
        if (!editorRef.current) return
        if (typeof editorRef.current !== 'object') return
        if (!('getAction' in editorRef.current)) return
        if (typeof editorRef.current.getAction !== 'function') return

        editorRef.current.getAction('editor.action.formatDocument').run()
    }

    const selectedVersionLabel =
        versionOptions.find((option) => option.value === selectedVersion)?.label || selectedVersion

    return (
        <Group gap="xs" justify="space-between" mb="md">
            <Button
                leftSection={<PiCheckSquareOffset size={'1.4rem'} />}
                onClick={formatDocument}
                size="sm"
                variant="outline"
            >
                Format
            </Button>
            <Group gap="xs" justify="flex-end">
                <Menu position="bottom-end" shadow="md" withArrow>
                    <Menu.Target>
                        <Button
                            leftSection={<PiCheckSquareOffset size={'1.4rem'} />}
                            rightSection={<PiCaretDown size={'1rem'} />}
                            size="sm"
                            variant="outline"
                        >
                            Core: {selectedVersionLabel}
                        </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                        {versionOptions.map((option) => (
                            <Menu.Item
                                disabled={option.value === selectedVersion}
                                key={option.value}
                                onClick={() => onSelectVersion(option.value)}
                            >
                                {option.label}
                            </Menu.Item>
                        ))}
                    </Menu.Dropdown>
                </Menu>
                <ChangeColorTheme />
            </Group>
        </Group>
    )
}
