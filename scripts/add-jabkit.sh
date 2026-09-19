#!/usr/bin/env bash
set -euo pipefail
COMPONENTS=(
  button input label textarea checkbox radio-group switch card badge avatar separator skeleton
  alert alert-dialog dialog drawer popover tooltip dropdown-menu command combobox pagination
  progress scroll-area toast breadcrumb accordion collapsible data-table table-2 chart chart-group14
  calendar-03 calendar-with-localisation fullscreen-calendar sidebar navigation-menu
  application-shell1 application-shell13 tubelight-navbar footer-column footer-section
  login4 forgot-password2 attachment image-cropper aspect-ratio ticket-confirmation-card
  order-confirmation-card receipt-pricing stepper-with-titles hero-1 about6 faq12 team11
  content1 cta22 agency-contact-form form
)
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
for app in web admin; do
  echo "Adding Jabkit baseline to apps/${app}"
  (cd "$ROOT/apps/${app}" && npx --yes @jabkit/cli add "${COMPONENTS[@]}")
done
