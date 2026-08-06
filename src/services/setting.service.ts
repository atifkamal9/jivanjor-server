import { prisma } from '../config/db';

export const DEFAULT_SETTINGS = {
  desktopLogo: '/images/logo.png',
  mobileLogo: '/images/logo.png',
  categoryHeroCover: '/images/main-category-hero.png',
  categoryCardBg: '/images/placeholder.png',
  socialLinks: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    youtube: 'https://youtube.com',
    linkedin: 'https://linkedin.com',
    twitter: 'https://x.com',
  },
  rightChoiceBanner: {
    title: 'Need Help Choosing the Right Adhesive?',
    subtitle: 'Share your woodwork needs, product query or application concerns. Our team will help you find the right Jivanjor solution.',
    ctaText: 'Submit Your Query',
    ctaLink: '/contact',
  },
  contactPage: {
    heroImage: '/images/image 24.png',
    heroTitle: 'Contact Us',
    mainHeading: 'We are always happy to assist you.',
    watermarkImage: '/images/watermark-contact.svg',
    sections: [
      {
        title: 'Customer Support',
        details: [
          { label: 'Phone', value: '1800-XXX-XXX', icon: '/images/Phone-call.svg' },
          { label: 'Email', value: 'support@jivanjor.com', icon: '/images/Mail-one.svg' },
          { label: 'Hours', value: 'Mon-Sat, 9:00 AM – 6:00 PM', icon: '/images/Alarm-clock.svg' },
        ],
      },
      {
        title: 'Corporate Headquarters',
        details: [
          { label: 'Address', value: '1234, Address Street', icon: '/images/Pin.svg' },
          { label: 'Hours', value: 'Mon-Sat, 9:00 AM – 6:00 PM', icon: '/images/Alarm-clock.svg' },
        ],
      },
    ],
  },
};

export class SettingService {
  /**
   * Get site settings (logos, category covers/backgrounds, social media links, right choice banner, contact page)
   */
  static async getSettings() {
    let settings = await (prisma as any).siteSetting.findUnique({
      where: { id: 'site_settings' },
    });

    if (!settings) {
      settings = await (prisma as any).siteSetting.create({
        data: {
          id: 'site_settings',
          desktopLogo: DEFAULT_SETTINGS.desktopLogo,
          mobileLogo: DEFAULT_SETTINGS.mobileLogo,
          categoryHeroCover: DEFAULT_SETTINGS.categoryHeroCover,
          categoryCardBg: DEFAULT_SETTINGS.categoryCardBg,
          socialLinks: DEFAULT_SETTINGS.socialLinks,
          rightChoiceBanner: DEFAULT_SETTINGS.rightChoiceBanner,
          contactPage: DEFAULT_SETTINGS.contactPage,
        },
      });
    }

    const socialLinks = typeof settings.socialLinks === 'string'
      ? JSON.parse(settings.socialLinks)
      : (settings.socialLinks || DEFAULT_SETTINGS.socialLinks);

    const rightChoiceBanner = typeof settings.rightChoiceBanner === 'string'
      ? JSON.parse(settings.rightChoiceBanner)
      : (settings.rightChoiceBanner || DEFAULT_SETTINGS.rightChoiceBanner);

    const contactPage = typeof settings.contactPage === 'string'
      ? JSON.parse(settings.contactPage)
      : (settings.contactPage || DEFAULT_SETTINGS.contactPage);

    return {
      id: settings.id,
      desktopLogo: settings.desktopLogo || DEFAULT_SETTINGS.desktopLogo,
      mobileLogo: settings.mobileLogo || settings.desktopLogo || DEFAULT_SETTINGS.mobileLogo,
      categoryHeroCover: settings.categoryHeroCover || DEFAULT_SETTINGS.categoryHeroCover,
      categoryCardBg: settings.categoryCardBg || DEFAULT_SETTINGS.categoryCardBg,
      socialLinks: {
        facebook: socialLinks?.facebook || DEFAULT_SETTINGS.socialLinks.facebook,
        instagram: socialLinks?.instagram || DEFAULT_SETTINGS.socialLinks.instagram,
        youtube: socialLinks?.youtube || DEFAULT_SETTINGS.socialLinks.youtube,
        linkedin: socialLinks?.linkedin || DEFAULT_SETTINGS.socialLinks.linkedin,
        twitter: socialLinks?.twitter || DEFAULT_SETTINGS.socialLinks.twitter,
      },
      rightChoiceBanner: {
        title: rightChoiceBanner?.title ?? DEFAULT_SETTINGS.rightChoiceBanner.title,
        subtitle: rightChoiceBanner?.subtitle ?? DEFAULT_SETTINGS.rightChoiceBanner.subtitle,
        ctaText: rightChoiceBanner?.ctaText ?? DEFAULT_SETTINGS.rightChoiceBanner.ctaText,
        ctaLink: rightChoiceBanner?.ctaLink ?? DEFAULT_SETTINGS.rightChoiceBanner.ctaLink,
      },
      contactPage: {
        heroImage: contactPage?.heroImage || DEFAULT_SETTINGS.contactPage.heroImage,
        heroTitle: contactPage?.heroTitle || DEFAULT_SETTINGS.contactPage.heroTitle,
        mainHeading: contactPage?.mainHeading || DEFAULT_SETTINGS.contactPage.mainHeading,
        watermarkImage: contactPage?.watermarkImage || DEFAULT_SETTINGS.contactPage.watermarkImage,
        sections: Array.isArray(contactPage?.sections) ? contactPage.sections : DEFAULT_SETTINGS.contactPage.sections,
      },
      updatedAt: settings.updatedAt,
    };
  }

  /**
   * Update site settings
   */
  static async updateSettings(data: {
    desktopLogo?: string;
    mobileLogo?: string;
    categoryHeroCover?: string;
    categoryCardBg?: string;
    socialLinks?: Record<string, string>;
    rightChoiceBanner?: Record<string, string>;
    contactPage?: any;
  }) {
    const current = await this.getSettings();

    const newDesktopLogo = data.desktopLogo !== undefined ? data.desktopLogo : current.desktopLogo;
    const newMobileLogo = data.mobileLogo !== undefined ? data.mobileLogo : current.mobileLogo;
    const newCategoryHeroCover = data.categoryHeroCover !== undefined ? data.categoryHeroCover : current.categoryHeroCover;
    const newCategoryCardBg = data.categoryCardBg !== undefined ? data.categoryCardBg : current.categoryCardBg;
    const newSocialLinks = {
      ...current.socialLinks,
      ...(data.socialLinks || {}),
    };
    const newRightChoiceBanner = {
      ...current.rightChoiceBanner,
      ...(data.rightChoiceBanner || {}),
    };
    const newContactPage = data.contactPage !== undefined ? data.contactPage : current.contactPage;

    const settings = await (prisma as any).siteSetting.upsert({
      where: { id: 'site_settings' },
      create: {
        id: 'site_settings',
        desktopLogo: newDesktopLogo,
        mobileLogo: newMobileLogo,
        categoryHeroCover: newCategoryHeroCover,
        categoryCardBg: newCategoryCardBg,
        socialLinks: newSocialLinks,
        rightChoiceBanner: newRightChoiceBanner,
        contactPage: newContactPage,
      },
      update: {
        desktopLogo: newDesktopLogo,
        mobileLogo: newMobileLogo,
        categoryHeroCover: newCategoryHeroCover,
        categoryCardBg: newCategoryCardBg,
        socialLinks: newSocialLinks,
        rightChoiceBanner: newRightChoiceBanner,
        contactPage: newContactPage,
      },
    });

    const socialLinks = typeof settings.socialLinks === 'string'
      ? JSON.parse(settings.socialLinks)
      : (settings.socialLinks || DEFAULT_SETTINGS.socialLinks);

    const rightChoiceBanner = typeof settings.rightChoiceBanner === 'string'
      ? JSON.parse(settings.rightChoiceBanner)
      : (settings.rightChoiceBanner || DEFAULT_SETTINGS.rightChoiceBanner);

    const contactPage = typeof settings.contactPage === 'string'
      ? JSON.parse(settings.contactPage)
      : (settings.contactPage || DEFAULT_SETTINGS.contactPage);

    return {
      id: settings.id,
      desktopLogo: settings.desktopLogo || DEFAULT_SETTINGS.desktopLogo,
      mobileLogo: settings.mobileLogo || settings.desktopLogo || DEFAULT_SETTINGS.mobileLogo,
      categoryHeroCover: settings.categoryHeroCover || DEFAULT_SETTINGS.categoryHeroCover,
      categoryCardBg: settings.categoryCardBg || DEFAULT_SETTINGS.categoryCardBg,
      socialLinks: {
        facebook: socialLinks?.facebook || DEFAULT_SETTINGS.socialLinks.facebook,
        instagram: socialLinks?.instagram || DEFAULT_SETTINGS.socialLinks.instagram,
        youtube: socialLinks?.youtube || DEFAULT_SETTINGS.socialLinks.youtube,
        linkedin: socialLinks?.linkedin || DEFAULT_SETTINGS.socialLinks.linkedin,
        twitter: socialLinks?.twitter || DEFAULT_SETTINGS.socialLinks.twitter,
      },
      rightChoiceBanner: {
        title: rightChoiceBanner?.title ?? DEFAULT_SETTINGS.rightChoiceBanner.title,
        subtitle: rightChoiceBanner?.subtitle ?? DEFAULT_SETTINGS.rightChoiceBanner.subtitle,
        ctaText: rightChoiceBanner?.ctaText ?? DEFAULT_SETTINGS.rightChoiceBanner.ctaText,
        ctaLink: rightChoiceBanner?.ctaLink ?? DEFAULT_SETTINGS.rightChoiceBanner.ctaLink,
      },
      contactPage: {
        heroImage: contactPage?.heroImage || DEFAULT_SETTINGS.contactPage.heroImage,
        heroTitle: contactPage?.heroTitle || DEFAULT_SETTINGS.contactPage.heroTitle,
        mainHeading: contactPage?.mainHeading || DEFAULT_SETTINGS.contactPage.mainHeading,
        watermarkImage: contactPage?.watermarkImage || DEFAULT_SETTINGS.contactPage.watermarkImage,
        sections: Array.isArray(contactPage?.sections) ? contactPage.sections : DEFAULT_SETTINGS.contactPage.sections,
      },
      updatedAt: settings.updatedAt,
    };
  }
}

