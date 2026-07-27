import { prisma } from '../config/db';

export const INITIAL_HEADER_MENU = [
  {
    id: 'nav-about',
    title: 'About Jivanjor',
    type: 'menu',
    isMegaMenu: true,
    isStatic: false,
    order: 1,
    url: null,
    subItems: [
      { id: 'sub-about-1', title: 'About Jivanjor', type: 'page', url: '/about', order: 1 },
      { id: 'sub-about-2', title: 'Research and Innovation', type: 'page', url: '/about/research-and-innovation', order: 2 },
      { id: 'sub-about-3', title: 'Quality & Performance Promise', type: 'page', url: '/about/quality-and-performance-promise', order: 3 },
      { id: 'sub-about-4', title: 'TVC', type: 'page', url: '/about/tvc', order: 4 },
      { id: 'sub-about-5', title: 'Market Presence', type: 'page', url: '/about/market-presence', order: 5 },
    ],
  },
  {
    id: 'nav-products',
    title: 'Products',
    type: 'menu',
    isMegaMenu: true,
    isStatic: true, // Static product catalog navigation
    order: 2,
    url: null,
    subItems: [],
  },
  {
    id: 'nav-applications',
    title: 'Applications',
    type: 'menu',
    isMegaMenu: true,
    isStatic: false,
    order: 3,
    url: null,
    subItems: [
      { id: 'sub-app-1', title: 'Furniture & Woodwork', type: 'page', url: '/applications', order: 1 },
      { id: 'sub-app-2', title: 'Laminates & Finishing', type: 'page', url: '/applications', order: 2 },
      { id: 'sub-app-3', title: 'Kitchen & Storage Units', type: 'page', url: '/applications', order: 3 },
      { id: 'sub-app-4', title: 'Moisture-Prone Woodwork', type: 'page', url: '/applications', order: 4 },
      { id: 'sub-app-5', title: 'PVC & Edge Finishing', type: 'page', url: '/applications', order: 5 },
      { id: 'sub-app-6', title: 'Foam & Acoustic Bonding', type: 'page', url: '/applications', order: 6 },
    ],
  },
  {
    id: 'nav-knowledge',
    title: 'Knowledge Center',
    type: 'menu',
    isMegaMenu: true,
    isStatic: false,
    order: 4,
    url: null,
    subItems: [
      { id: 'sub-know-1', title: 'Choosing The Right Adhesive', type: 'page', url: '/blog?category=Choosing%20The%20Right%20Adhesive', order: 1 },
      { id: 'sub-know-2', title: 'Application Tips', type: 'page', url: '/blog?category=Application%20Tips', order: 2 },
      { id: 'sub-know-3', title: 'Fix Common Issues', type: 'page', url: '/blog?category=Fix%20Common%20Issues', order: 3 },
      { id: 'sub-know-4', title: 'Latest Blogs', type: 'page', url: '/blog?category=Latest%20Blogs', order: 4 },
      { id: 'sub-know-5', title: 'Technical Resources', type: 'page', url: '/resources', order: 5 },
    ],
  },
  {
    id: 'nav-partner',
    title: 'Partner',
    type: 'menu',
    isMegaMenu: true,
    isStatic: false,
    order: 5,
    url: null,
    subItems: [
      { id: 'sub-part-1', title: 'Become a Dealer / Partner', type: 'page', url: '/partner', order: 1 },
      { id: 'sub-part-2', title: 'Contractor / Carpenter Connect', type: 'page', url: '/contractor', order: 2 },
    ],
  },
];

export const INITIAL_FOOTER_MENU = [
  {
    id: 'footer-products',
    title: 'Products',
    order: 1,
    subItems: [
      { id: 'fsub-prod-1', title: 'Super Premium Adhesive', url: '/categories/super-premium', target: '_self', order: 1 },
      { id: 'fsub-prod-2', title: 'Speciality Adhesive', url: '/categories/speciality', target: '_self', order: 2 },
      { id: 'fsub-prod-3', title: 'Regular Adhesive', url: '/categories/regular', target: '_self', order: 3 },
      { id: 'fsub-prod-4', title: 'Water Proof Grade Adhesive', url: '/categories/waterproof', target: '_self', order: 4 },
      { id: 'fsub-prod-5', title: 'Wood Ancillaries', url: '/categories/wood-ancillaries', target: '_self', order: 5 },
      { id: 'fsub-prod-6', title: 'ECO', url: '/categories/eco', target: '_self', order: 6 },
      { id: 'fsub-prod-7', title: 'Wood Preservative', url: '/categories/wood-preservative', target: '_self', order: 7 },
    ],
  },
  {
    id: 'footer-about',
    title: 'About Jivanjor',
    order: 2,
    subItems: [
      { id: 'fsub-about-1', title: 'About Jivanjor', url: '/about', target: '_self', order: 1 },
      { id: 'fsub-about-2', title: 'Research & Innovation', url: '/about/research-and-innovation', target: '_self', order: 2 },
      { id: 'fsub-about-3', title: 'Quality & Performance Promise', url: '/about/quality-and-performance-promise', target: '_self', order: 3 },
      { id: 'fsub-about-4', title: 'TVCs', url: '/about/tvc', target: '_self', order: 4 },
      { id: 'fsub-about-5', title: 'Market Presence', url: '/about/market-presence', target: '_self', order: 5 },
    ],
  },
  {
    id: 'footer-support',
    title: 'Support & Compliance',
    order: 3,
    subItems: [
      { id: 'fsub-supp-1', title: 'Technical Resources', url: '/resources', target: '_self', order: 1 },
      { id: 'fsub-supp-2', title: 'Become a Dealer', url: '/partner', target: '_self', order: 2 },
      { id: 'fsub-supp-3', title: 'Contractor Connect', url: '/contractor', target: '_self', order: 3 },
      { id: 'fsub-supp-4', title: 'Privacy Policy', url: '/privacy', target: '_self', order: 4 },
      { id: 'fsub-supp-5', title: 'Terms of Use', url: '/privacy#terms', target: '_self', order: 5 },
      { id: 'fsub-supp-6', title: 'Sitemap', url: '/sitemap', target: '_self', order: 6 },
      { id: 'fsub-supp-7', title: 'Contact Us', url: '/contact', target: '_self', order: 7 },
    ],
  },
];

export class MenuService {
  /**
   * Get main header menu (draft & published)
   */
  static async getHeaderMenu() {
    let menu = await (prisma as any).menu.findUnique({
      where: { id: 'header_menu' },
    });

    if (!menu) {
      menu = await (prisma as any).menu.create({
        data: {
          id: 'header_menu',
          name: 'Main Header Navigation',
          draftItems: INITIAL_HEADER_MENU,
          publishedItems: INITIAL_HEADER_MENU,
        },
      });
    }

    return {
      id: menu.id,
      name: menu.name,
      draftItems: typeof menu.draftItems === 'string' ? JSON.parse(menu.draftItems) : menu.draftItems,
      publishedItems: typeof menu.publishedItems === 'string' ? JSON.parse(menu.publishedItems) : menu.publishedItems,
      updatedAt: menu.updatedAt,
    };
  }

  /**
   * Update draft header menu items
   */
  static async updateDraftHeaderMenu(items: any[]) {
    const sanitizedItems = items.map((item, index) => ({
      ...item,
      order: index + 1,
      url: item.type === 'menu' ? null : item.url,
      subItems: Array.isArray(item.subItems)
        ? item.subItems.map((sub: any, subIndex: number) => ({
            ...sub,
            order: subIndex + 1,
          }))
        : [],
    }));

    let menu = await (prisma as any).menu.findUnique({
      where: { id: 'header_menu' },
    });

    if (!menu) {
      menu = await (prisma as any).menu.create({
        data: {
          id: 'header_menu',
          name: 'Main Header Navigation',
          draftItems: sanitizedItems,
          publishedItems: INITIAL_HEADER_MENU,
        },
      });
    } else {
      menu = await (prisma as any).menu.update({
        where: { id: 'header_menu' },
        data: {
          draftItems: sanitizedItems,
        },
      });
    }

    return {
      id: menu.id,
      name: menu.name,
      draftItems: typeof menu.draftItems === 'string' ? JSON.parse(menu.draftItems) : menu.draftItems,
      publishedItems: typeof menu.publishedItems === 'string' ? JSON.parse(menu.publishedItems) : menu.publishedItems,
      updatedAt: menu.updatedAt,
    };
  }

  /**
   * Publish draft header menu items
   */
  static async publishHeaderMenu() {
    const current = await this.getHeaderMenu();
    const draftItems = current.draftItems;

    const updated = await (prisma as any).menu.update({
      where: { id: 'header_menu' },
      data: {
        publishedItems: draftItems,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      draftItems: typeof updated.draftItems === 'string' ? JSON.parse(updated.draftItems) : updated.draftItems,
      publishedItems: typeof updated.publishedItems === 'string' ? JSON.parse(updated.publishedItems) : updated.publishedItems,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Reset header menu to default system items
   */
  static async resetHeaderMenu() {
    const menu = await (prisma as any).menu.upsert({
      where: { id: 'header_menu' },
      create: {
        id: 'header_menu',
        name: 'Main Header Navigation',
        draftItems: INITIAL_HEADER_MENU,
        publishedItems: INITIAL_HEADER_MENU,
      },
      update: {
        draftItems: INITIAL_HEADER_MENU,
        publishedItems: INITIAL_HEADER_MENU,
      },
    });

    return {
      id: menu.id,
      name: menu.name,
      draftItems: typeof menu.draftItems === 'string' ? JSON.parse(menu.draftItems) : menu.draftItems,
      publishedItems: typeof menu.publishedItems === 'string' ? JSON.parse(menu.publishedItems) : menu.publishedItems,
      updatedAt: menu.updatedAt,
    };
  }

  // ── FOOTER MENU SERVICES ──────────────────────────────────────────────────

  /**
   * Get Footer Menu (draft & published)
   */
  static async getFooterMenu() {
    let menu = await (prisma as any).menu.findUnique({
      where: { id: 'footer_menu' },
    });

    if (!menu) {
      menu = await (prisma as any).menu.create({
        data: {
          id: 'footer_menu',
          name: 'Footer Navigation',
          draftItems: INITIAL_FOOTER_MENU,
          publishedItems: INITIAL_FOOTER_MENU,
        },
      });
    }

    return {
      id: menu.id,
      name: menu.name,
      draftItems: typeof menu.draftItems === 'string' ? JSON.parse(menu.draftItems) : menu.draftItems,
      publishedItems: typeof menu.publishedItems === 'string' ? JSON.parse(menu.publishedItems) : menu.publishedItems,
      updatedAt: menu.updatedAt,
    };
  }

  /**
   * Update draft footer menu items
   */
  static async updateDraftFooterMenu(items: any[]) {
    const sanitizedItems = items.map((sec, index) => ({
      ...sec,
      order: index + 1,
      subItems: Array.isArray(sec.subItems)
        ? sec.subItems.map((sub: any, subIndex: number) => ({
            ...sub,
            order: subIndex + 1,
            target: sub.target === '_blank' ? '_blank' : '_self',
          }))
        : [],
    }));

    let menu = await (prisma as any).menu.findUnique({
      where: { id: 'footer_menu' },
    });

    if (!menu) {
      menu = await (prisma as any).menu.create({
        data: {
          id: 'footer_menu',
          name: 'Footer Navigation',
          draftItems: sanitizedItems,
          publishedItems: INITIAL_FOOTER_MENU,
        },
      });
    } else {
      menu = await (prisma as any).menu.update({
        where: { id: 'footer_menu' },
        data: {
          draftItems: sanitizedItems,
        },
      });
    }

    return {
      id: menu.id,
      name: menu.name,
      draftItems: typeof menu.draftItems === 'string' ? JSON.parse(menu.draftItems) : menu.draftItems,
      publishedItems: typeof menu.publishedItems === 'string' ? JSON.parse(menu.publishedItems) : menu.publishedItems,
      updatedAt: menu.updatedAt,
    };
  }

  /**
   * Publish draft footer menu items
   */
  static async publishFooterMenu() {
    const current = await this.getFooterMenu();
    const draftItems = current.draftItems;

    const updated = await (prisma as any).menu.update({
      where: { id: 'footer_menu' },
      data: {
        publishedItems: draftItems,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      draftItems: typeof updated.draftItems === 'string' ? JSON.parse(updated.draftItems) : updated.draftItems,
      publishedItems: typeof updated.publishedItems === 'string' ? JSON.parse(updated.publishedItems) : updated.publishedItems,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Reset footer menu to default system items
   */
  static async resetFooterMenu() {
    const menu = await (prisma as any).menu.upsert({
      where: { id: 'footer_menu' },
      create: {
        id: 'footer_menu',
        name: 'Footer Navigation',
        draftItems: INITIAL_FOOTER_MENU,
        publishedItems: INITIAL_FOOTER_MENU,
      },
      update: {
        draftItems: INITIAL_FOOTER_MENU,
        publishedItems: INITIAL_FOOTER_MENU,
      },
    });

    return {
      id: menu.id,
      name: menu.name,
      draftItems: typeof menu.draftItems === 'string' ? JSON.parse(menu.draftItems) : menu.draftItems,
      publishedItems: typeof menu.publishedItems === 'string' ? JSON.parse(menu.publishedItems) : menu.publishedItems,
      updatedAt: menu.updatedAt,
    };
  }
}
