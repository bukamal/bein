/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // دعم الترجمة i18n
  i18n: {
    locales: ["en", "ar"],
    defaultLocale: "ar",
  },

  // السماح بتحميل الصور من مصادر خارجية
  images: {
    domains: ["localhost", "yourdomain.com"], // أضف الدومين الخاص بك إذا كنت تستخدم API خارجي
  },
};

module.exports = nextConfig;
