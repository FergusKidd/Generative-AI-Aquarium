import React from 'react';
import { IconButton, useColorMode, IconButtonProps } from '@chakra-ui/react';
import { FaMoon, FaSun } from 'react-icons/fa';

/**
 * ThemeToggleButton allows the user to switch between light and dark mode.
 * It takes any IconButton props to customize the appearance and behavior of the button.
 *
 * @param {object} props - The props to pass down to the IconButton component.
 */

const ThemeToggleButton = (props: Omit<IconButtonProps, 'aria-label'>) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const label = `Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`;

  return (
    <IconButton
      aria-label={label}
      icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
      onClick={toggleColorMode}
      {...props} 
    />
  );
};

export default ThemeToggleButton;
