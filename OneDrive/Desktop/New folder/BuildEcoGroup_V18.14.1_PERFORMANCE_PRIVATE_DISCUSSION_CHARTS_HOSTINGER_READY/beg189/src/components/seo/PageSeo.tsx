import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applySeoMeta } from '../../lib/applySeoMeta';
import { resolveSeoMeta } from '../../lib/seoConfig';

/** Updates document title, meta, canonical and OG tags on every route change */
export const PageSeo: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = resolveSeoMeta(pathname);
    applySeoMeta(pathname, meta);
  }, [pathname]);

  return null;
};
