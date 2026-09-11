import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShareFatIcon, CheckIcon } from '@phosphor-icons/react';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from '@/lib/toast';

interface ShareButtonProps {
  url: string;
  title?: string;
  text?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  onShare?: () => void;
}

export const ShareButton = ({ 
  url, 
  title, 
  text, 
  className, 
  variant = 'outline',
  onShare 
}: ShareButtonProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const handleShare = async () => {
    setIsSharing(true);
    const shareUrl = new URL(url, window.location.origin).href;
    const shareTitle = title || t('share.title', 'Check out this event');
    const shareText = text || '';

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast.success('share.toast.success', 'Shared successfully!');
        onShare?.();
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          await copyToClipboard(shareUrl);
        }
      }
    } else {
      await copyToClipboard(shareUrl);
    }
    
    setIsSharing(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('share.toast.copied', 'Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
      onShare?.();
    } catch (err) {
      toast.error('share.toast.copyFailed', 'Failed to copy link');
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant={variant}
      disabled={isSharing}
      className={className}
    >
      <span>
        {isSharing
          ? t('share.sharing', 'Sharing...')
          : copied
            ? t('share.copied', 'Copied!')
            : t('share.button', 'Share')}
      </span>
      {copied ? (
        <CheckIcon size={18} className="ml-2" />
      ) : (
        <ShareFatIcon size={18} className="ml-2" />
      )}
    </Button>
  );
};
