'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackClickAnyButton, trackPhoneClick, trackWhatsAppClick } from '@/utils/analytics';

function getButtonLabel(element: HTMLElement): string {
  const ariaLabel = element.getAttribute('aria-label')?.trim();
  if (ariaLabel) return ariaLabel;

  if (element instanceof HTMLInputElement) {
    const inputValue = element.value?.trim();
    if (inputValue) return inputValue;
  }

  const textContent = element.textContent?.replace(/\s+/g, ' ').trim();
  return textContent || '';
}

export function useClickAnyButton(): void {
  const pathname = usePathname();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const clickable = target.closest(
        'button, a, [role="button"], input[type="button"], input[type="submit"]',
      ) as HTMLElement | null;
      if (!clickable) return;

      if (clickable.getAttribute('data-track-ignore') === 'true') return;

      const buttonText = getButtonLabel(clickable).slice(0, 120);
      if (!buttonText) return;

      const destinationUrl = clickable instanceof HTMLAnchorElement ? clickable.href : undefined;
      trackClickAnyButton({
        button_text: buttonText,
        page_path: pathname,
        ...(clickable.id && { button_id: clickable.id }),
        ...(destinationUrl && { destination_url: destinationUrl }),
      });

      if (destinationUrl?.startsWith('tel:')) {
        trackPhoneClick(destinationUrl.replace('tel:', ''), pathname);
      }

      if (destinationUrl && (destinationUrl.includes('wa.me/') || destinationUrl.includes('whatsapp.com/'))) {
        trackWhatsAppClick(destinationUrl, pathname);
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [pathname]);
}
