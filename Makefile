# Usage:
#   make dev              → runs ALL apps & packages in parallel (default)
#   make dev-all          → explicit alias for the same thing
#   make dev FILTER=web   → runs only the "web" app
#   make dev FILTER=admin → runs only the "admin" app
FILTER ?=

filter_flag = $(if $(FILTER),--filter=$(FILTER),)
filter_path = $(if $(FILTER),$(if $(wildcard apps/$(FILTER)),apps/$(FILTER),$(if $(wildcard packages/$(FILTER)),packages/$(FILTER),$(error Unknown FILTER "$(FILTER)"))),.)

.PHONY: dev dev-all build storybook fix fix-unsafe

dev:
	pnpm turbo run dev $(filter_flag)

dev-all:
	pnpm turbo run dev

build:
	pnpm turbo run build $(filter_flag)

storybook:
	pnpm turbo run storybook $(filter_flag)

fix:
	pnpm biome check --write $(filter_path)

fix-unsafe:
	pnpm biome check --write --unsafe $(filter_path)
