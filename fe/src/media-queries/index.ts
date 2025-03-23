/**
 * Defines media query components for different device sizes.
 */
import { useMediaQuery } from 'react-responsive';
import { ReactNode } from 'react';

/**
 * Props for the media query components.
 */
interface Props {
    children: ReactNode;
}

/**
 * Function which verifies if user is using desktop (device with width greater than or equal to 992 pixels)
 * @returns True if user is using desktop, False otherwise
 */
const useDesktop = (): boolean => useMediaQuery({ minWidth: 992 });

/**
 * Function which verifies if user is using tablet (device with width between 768 and 991 pixels)
 * @returns True if user is using tablet, False otherwise
 */
const useTablet = (): boolean => useMediaQuery({ minWidth: 768, maxWidth: 991 });

/**
 * Function which verifies if user is using Mobile (device with width lower than or equal to 767 pixels)
 * @returns True if user is using desktop, False otherwise
 */
const useMobile = ():boolean => useMediaQuery({ maxWidth: 767 });

/**
 * Function which verifies if user is not using mobile (device with width greater than or equal to 768 pixels)
 * @returns True if user is using desktop, False otherwise
 */
const useDefault = ():boolean => useMediaQuery({ minWidth: 768 });

/**
 * Component that renders its children only when the device width is greater than or equal to 992 pixels (desktop).
 * @param children - The content to be rendered.
 * @returns The rendered content if the device width is greater than or equal to 992 pixels, otherwise null.
 */
const Desktop = ({ children }: Props) => useDesktop() ? children : null;

/**
 * Component that renders its children only when the device width is between 768 and 991 pixels (tablet).
 * @param children - The content to be rendered.
 * @returns The rendered content if the device width is between 768 and 991 pixels, otherwise null.
 */
const Tablet = ({ children }: Props) =>  useTablet() ? children : null;

/**
 * Component that renders its children only when the device width is less than or equal to 767 pixels (mobile).
 * @param children - The content to be rendered.
 * @returns The rendered content if the device width is less than or equal to 767 pixels, otherwise null.
 */
const Mobile = ({ children }: Props) => useMobile() ? children : null;


/**
 * Component that renders its children only when the device width is greater than or equal to 768 pixels (default).
 * @param children - The content to be rendered.
 * @returns The rendered content if the device width is greater than or equal to 768 pixels, otherwise null.
 */
const Default = ({ children }: Props) => useDefault() ? children : null;


export { Desktop, Tablet, Mobile, Default, useDesktop, useTablet, useDefault, useMobile };
