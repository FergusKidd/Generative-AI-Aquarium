import { IconButton, IconButtonProps, useColorMode } from '@chakra-ui/react'
import { Moon, Sun } from 'lucide-react'

/**
 * ThemeToggleButton allows the user to switch between light and dark mode.
 * It takes any IconButton props to customize the appearance and behavior of the button.
 *
 * @param {object} props - The props to pass down to the IconButton component.
 */

const ThemeToggleButton = (props: Omit<IconButtonProps, 'aria-label'>) => {
  const { colorMode, toggleColorMode } = useColorMode()
  const label = `Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`

  return (
    <IconButton
      aria-label={label}
      icon={colorMode === 'light' ? <Moon size="15px" /> : <Sun size="15px" />}
      onClick={toggleColorMode}
      {...props}
    />
  )
}

export default ThemeToggleButton
