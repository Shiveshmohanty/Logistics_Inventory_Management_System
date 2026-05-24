
import { getTranslation } from '@/locales';

export function useTranslation() {
  const t = (key: string): string => {
    return getTranslation(key);
  };
  
  return { t };
}
  