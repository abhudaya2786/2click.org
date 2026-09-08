export interface NavItem {
  label: string;
  href: string;
  badge?: string;
  description?: string;
  iconName?: string;
  hasMegaMenu?: boolean;
}

export interface MegaMenuCategory {
  title: string;
  description?: string;
  items: {
    title: string;
    description: string;
    href: string;
    badge?: string;
    iconName?: string;
  }[];
}

export interface FooterLink {
  label: string;
  href: string;
  isExternal?: boolean;
  badge?: string;
}

export interface FooterGroup {
  title: string;
  links: FooterLink[];
}
