/**
 * lint-staged configuration
 * اجرای lint و format روی فایل‌های staged قبل از commit
 */
module.exports = {
  '*.{js,ts,svelte}': [
    'eslint --fix',
    'prettier --write',
  ],
  '*.{json,md,css,html}': [
    'prettier --write',
  ],
};
