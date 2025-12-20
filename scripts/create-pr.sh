#!/bin/bash

# 🚀 اسکریپت کمکی برای ایجاد Pull Request
# این اسکریپت workflow ایجاد PR را ساده‌تر می‌کند

set -e  # در صورت خطا متوقف شود

# رنگ‌ها برای output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# تابع برای نمایش پیام
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# بررسی اینکه در یک git repository هستیم
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    error "این پوشه یک git repository نیست!"
    exit 1
fi

# دریافت نام branch فعلی
CURRENT_BRANCH=$(git branch --show-current)

# بررسی اینکه روی main نیستیم
if [ "$CURRENT_BRANCH" = "main" ]; then
    error "شما روی branch main هستید. لطفاً یک branch جدید بسازید."
    echo ""
    info "برای ایجاد branch جدید:"
    echo "  git checkout -b feature/نام-feature"
    exit 1
fi

info "Branch فعلی: $CURRENT_BRANCH"

# بررسی اینکه تغییرات commit شده‌اند
if ! git diff-index --quiet HEAD --; then
    warning "شما تغییرات uncommitted دارید!"
    echo ""
    read -p "آیا می‌خواهید تغییرات را commit کنید؟ (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "پیام commit را وارد کنید: " COMMIT_MSG
        if [ -z "$COMMIT_MSG" ]; then
            error "پیام commit نمی‌تواند خالی باشد!"
            exit 1
        fi
        git add .
        git commit -m "$COMMIT_MSG"
        success "تغییرات commit شدند"
    else
        error "لطفاً ابتدا تغییرات را commit کنید"
        exit 1
    fi
fi

# بررسی اینکه branch در remote وجود دارد
if git ls-remote --heads origin "$CURRENT_BRANCH" | grep -q "$CURRENT_BRANCH"; then
    info "Branch در remote وجود دارد. به‌روزرسانی می‌کنم..."
    git push origin "$CURRENT_BRANCH"
else
    info "Branch در remote وجود ندارد. ایجاد می‌کنم..."
    git push -u origin "$CURRENT_BRANCH"
fi

success "Branch به GitHub push شد"

# دریافت URL repository
REMOTE_URL=$(git config --get remote.origin.url)

# تبدیل SSH URL به HTTPS (در صورت نیاز)
if [[ $REMOTE_URL == git@github.com:* ]]; then
    REMOTE_URL=$(echo "$REMOTE_URL" | sed 's/git@github.com:/https:\/\/github.com\//' | sed 's/\.git$//')
elif [[ $REMOTE_URL == https://github.com/* ]]; then
    REMOTE_URL=$(echo "$REMOTE_URL" | sed 's/\.git$//')
fi

# ساخت URL برای ایجاد PR
PR_URL="${REMOTE_URL}/compare/main...${CURRENT_BRANCH}?expand=1"

echo ""
success "✅ آماده برای ایجاد Pull Request!"
echo ""
info "برای ایجاد PR، یکی از این کارها را انجام دهید:"
echo ""
echo "  1. لینک زیر را در مرورگر باز کنید:"
echo "     ${PR_URL}"
echo ""
echo "  2. یا به repository در GitHub بروید و روی 'Compare & pull request' کلیک کنید"
echo ""
echo "  3. یا از دستور زیر استفاده کنید (اگر gh CLI نصب دارید):"
echo "     gh pr create --title \"عنوان PR\" --body \"توضیحات\""
echo ""

# بررسی اینکه gh CLI نصب است یا نه
if command -v gh &> /dev/null; then
    read -p "آیا می‌خواهید از gh CLI برای ایجاد PR استفاده کنید؟ (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "عنوان PR را وارد کنید: " PR_TITLE
        if [ -z "$PR_TITLE" ]; then
            error "عنوان PR نمی‌تواند خالی باشد!"
            exit 1
        fi
        read -p "توضیحات PR (اختیاری): " PR_BODY
        
        if [ -z "$PR_BODY" ]; then
            gh pr create --title "$PR_TITLE"
        else
            gh pr create --title "$PR_TITLE" --body "$PR_BODY"
        fi
        
        success "Pull Request ایجاد شد!"
    fi
fi

