import { prisma } from '../config/db';

export const DEFAULT_SETTINGS = {
  desktopLogo: '/images/logo.png',
  mobileLogo: '/images/logo.png',
  socialLinks: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    youtube: 'https://youtube.com',
    linkedin: 'https://linkedin.com',
    twitter: 'https://x.com',
  },
};

export class SettingService {
  /**
   * Get site settings (logos, social media links)
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
          socialLinks: DEFAULT_SETTINGS.socialLinks,
        },
      });
    }

    const socialLinks = typeof settings.socialLinks === 'string'
      ? JSON.parse(settings.socialLinks)
      : (settings.socialLinks || DEFAULT_SETTINGS.socialLinks);

    return {
      id: settings.id,
      desktopLogo: settings.desktopLogo || DEFAULT_SETTINGS.desktopLogo,
      mobileLogo: settings.mobileLogo || settings.desktopLogo || DEFAULT_SETTINGS.mobileLogo,
      socialLinks: {
        facebook: socialLinks?.facebook || DEFAULT_SETTINGS.socialLinks.facebook,
        instagram: socialLinks?.instagram || DEFAULT_SETTINGS.socialLinks.instagram,
        youtube: socialLinks?.youtube || DEFAULT_SETTINGS.socialLinks.youtube,
        linkedin: socialLinks?.linkedin || DEFAULT_SETTINGS.socialLinks.linkedin,
        twitter: socialLinks?.twitter || DEFAULT_SETTINGS.socialLinks.twitter,
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
    socialLinks?: Record<string, string>;
  }) {
    const current = await this.getSettings();

    const newDesktopLogo = data.desktopLogo !== undefined ? data.desktopLogo : current.desktopLogo;
    const newMobileLogo = data.mobileLogo !== undefined ? data.mobileLogo : current.mobileLogo;
    const newSocialLinks = {
      ...current.socialLinks,
      ...(data.socialLinks || {}),
    };

    const settings = await (prisma as any).siteSetting.upsert({
      where: { id: 'site_settings' },
      create: {
        id: 'site_settings',
        desktopLogo: newDesktopLogo,
        mobileLogo: newMobileLogo,
        socialLinks: newSocialLinks,
      },
      update: {
        desktopLogo: newDesktopLogo,
        mobileLogo: newMobileLogo,
        socialLinks: newSocialLinks,
      },
    });

    const socialLinks = typeof settings.socialLinks === 'string'
      ? JSON.parse(settings.socialLinks)
      : (settings.socialLinks || DEFAULT_SETTINGS.socialLinks);

    return {
      id: settings.id,
      desktopLogo: settings.desktopLogo || DEFAULT_SETTINGS.desktopLogo,
      mobileLogo: settings.mobileLogo || settings.desktopLogo || DEFAULT_SETTINGS.mobileLogo,
      socialLinks: {
        facebook: socialLinks?.facebook || DEFAULT_SETTINGS.socialLinks.facebook,
        instagram: socialLinks?.instagram || DEFAULT_SETTINGS.socialLinks.instagram,
        youtube: socialLinks?.youtube || DEFAULT_SETTINGS.socialLinks.youtube,
        linkedin: socialLinks?.linkedin || DEFAULT_SETTINGS.socialLinks.linkedin,
        twitter: socialLinks?.twitter || DEFAULT_SETTINGS.socialLinks.twitter,
      },
      updatedAt: settings.updatedAt,
    };
  }
}
