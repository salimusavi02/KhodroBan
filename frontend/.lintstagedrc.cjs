/**
 * lint-staged configuration
 * اجرای lint و format روی فایل‌های staged قبل از commit
 * 
 * توجه: تست‌های smoke در pre-commit hook اجرا می‌شوند (نه اینجا)
 * برای سرعت بیشتر، تست‌های کامل فقط در CI/CD اجرا می‌شوند
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
