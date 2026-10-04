import React from 'react';
// Phosphor icons, imported one by one so only these end up in the app.
import { ArrowLeftIcon } from 'phosphor-react-native/src/icons/ArrowLeft';
import { ArrowRightIcon } from 'phosphor-react-native/src/icons/ArrowRight';
import { CalendarBlankIcon } from 'phosphor-react-native/src/icons/CalendarBlank';
import { CaretDownIcon } from 'phosphor-react-native/src/icons/CaretDown';
import { CaretLeftIcon } from 'phosphor-react-native/src/icons/CaretLeft';
import { ListBulletsIcon } from 'phosphor-react-native/src/icons/ListBullets';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { CaretUpIcon } from 'phosphor-react-native/src/icons/CaretUp';
import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import { DownloadSimpleIcon } from 'phosphor-react-native/src/icons/DownloadSimple';
import { DressIcon } from 'phosphor-react-native/src/icons/Dress';
import { EnvelopeSimpleIcon } from 'phosphor-react-native/src/icons/EnvelopeSimple';
import { EyeIcon } from 'phosphor-react-native/src/icons/Eye';
import { EyeSlashIcon } from 'phosphor-react-native/src/icons/EyeSlash';
import { GearSixIcon } from 'phosphor-react-native/src/icons/GearSix';
import { ImageSquareIcon } from 'phosphor-react-native/src/icons/ImageSquare';
import { LinkSimpleIcon } from 'phosphor-react-native/src/icons/LinkSimple';
import { MagnifyingGlassIcon } from 'phosphor-react-native/src/icons/MagnifyingGlass';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import { ShoppingBagOpenIcon } from 'phosphor-react-native/src/icons/ShoppingBagOpen';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import { XCircleIcon } from 'phosphor-react-native/src/icons/XCircle';
import { Colors } from '@/constants/theme';

const ICONS = {
  back: ArrowLeftIcon,
  forward: ArrowRightIcon,
  calendar: CalendarBlankIcon,
  caretDown: CaretDownIcon,
  caretUp: CaretUpIcon,
  caretRight: CaretRightIcon,
  caretLeft: CaretLeftIcon,
  list: ListBulletsIcon,
  check: CheckIcon,
  download: DownloadSimpleIcon,
  designers: DressIcon,
  email: EnvelopeSimpleIcon,
  settings: GearSixIcon,
  eye: EyeIcon,
  eyeSlash: EyeSlashIcon,
  image: ImageSquareIcon,
  link: LinkSimpleIcon,
  search: MagnifyingGlassIcon,
  plus: PlusIcon,
  orders: ShoppingBagOpenIcon,
  close: XIcon,
  clear: XCircleIcon,
};

export type IconName = keyof typeof ICONS;
export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  /** Light is the house weight; fill marks a selected tab. */
  weight?: IconWeight;
}

// One icon component for the whole app, so every icon shares a family and weight.
export function Icon({ name, size = 22, color = Colors.ink, weight = 'light' }: IconProps) {
  const C = ICONS[name];
  return <C size={size} color={color} weight={weight} />;
}
