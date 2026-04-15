import React from 'react';
import { 
  RefreshCw, 
  MessageCircle, 
  Upload, 
  Type, 
  Link, 
  X, 
  Moon, 
  Sun, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  ChevronDown, 
  Share2, 
  Key, 
  Mail, 
  Home, 
  Lightbulb, 
  Clock, 
  Settings, 
  Info, 
  Loader2,
  ShieldCheck,
  ExternalLink,
  LucideProps
} from 'lucide-react';

const iconMap: Record<string, React.FC<LucideProps>> = {
  'arrow-path': RefreshCw,
  'chat-bubble-oval-left-ellipsis': MessageCircle,
  'upload': Upload,
  'text': Type,
  'link': Link,
  'x-mark': X,
  'moon': Moon,
  'sun': Sun,
  'check': Check,
  'thumbs-up': ThumbsUp,
  'thumbs-down': ThumbsDown,
  'chevron-down': ChevronDown,
  'share': Share2,
  'key': Key,
  'envelope': Mail,
  'home': Home,
  'light-bulb': Lightbulb,
  'clock': Clock,
  'cog': Settings,
  'information-circle': Info,
  'spinner': Loader2,
  'shield-check': ShieldCheck,
  'arrow-top-right-on-square': ExternalLink,
};

interface IconProps extends LucideProps {
  name: string;
}

export const Icon: React.FC<IconProps> = ({ name, className, ...props }) => {
  const LucideIcon = iconMap[name];
  
  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in mapping.`);
    return null;
  }

  return <LucideIcon className={className} {...props} />;
};
