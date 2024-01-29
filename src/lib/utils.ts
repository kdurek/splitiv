import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(value: number, min: number | undefined, max: number | undefined) {
  if (min === undefined && max === undefined) {
    return value;
  }

  if (min !== undefined && max === undefined) {
    return Math.max(value, min);
  }

  if (min === undefined && max !== undefined) {
    return Math.min(value, max);
  }

  return Math.min(Math.max(value, min!), max!);
}

export function getFirstName(name: string | null | undefined) {
  const [firstName] = name?.split(' ') ?? '';
  return firstName;
}

export function getInitials(name: string | null | undefined) {
  const words = name?.split(' ');
  const initials = words?.map((word) => word.charAt(0).toUpperCase()).join('');
  return initials;
}
