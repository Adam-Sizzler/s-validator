.PHONY: help bump-patch bump-minor bump-major tag-release release-patch release-minor release-major release-prepare

CORE_VERSION := $(shell node -p "String(require('./versions.json').pinnedVersions[0]).replace(/^v/, '')")
RELEASE_TAG ?= v$(CORE_VERSION)

# Default target
help:
	@echo "Available targets:"
	@echo "  bump-patch      - Bump patch version (x.x.X) and install dependencies"
	@echo "  bump-minor      - Bump minor version (x.X.x) and install dependencies"
	@echo "  bump-major      - Bump major version (X.x.x) and install dependencies"
	@echo "  tag-release     - Create and push signed git tag for current sing-box core version"
	@echo "  release-patch   - Full release flow for patch version"
	@echo "  release-minor   - Full release flow for minor version"
	@echo "  release-major   - Full release flow for major version"

# Bump patch version (0.0.1 -> 0.0.2)
bump-patch:
	@echo "Bumping patch version..."
	npm version patch --no-git-tag-version
	@echo "New version: $$(node -p "require('./package.json').version")"
	npm install

# Bump minor version (0.1.0 -> 0.2.0)
bump-minor:
	@echo "Bumping minor version..."
	npm version minor --no-git-tag-version
	@echo "New version: $$(node -p "require('./package.json').version")"
	npm install

# Bump major version (1.0.0 -> 2.0.0)
bump-major:
	@echo "Bumping major version..."
	npm version major --no-git-tag-version
	@echo "New version: $$(node -p "require('./package.json').version")"
	npm install

# Create and push git tag for current version
tag-release:
	@TAG="$(RELEASE_TAG)" && \
	echo "Creating signed tag $$TAG..." && \
	git tag -s "$$TAG" -m "Release $$TAG" && \
	git push origin --follow-tags && \
	echo "Signed tag $$TAG created and pushed"

release-prepare:
	npm run build
	@VERSION=$$(node -p "require('./package.json').version") && \
	git add package.json package-lock.json && \
	git commit -m "chore(release): v$$VERSION" && \
	git push origin HEAD && \
	echo "Release commit pushed: v$$VERSION"

release-patch: bump-patch release-prepare tag-release

release-minor: bump-minor release-prepare tag-release

release-major: bump-major release-prepare tag-release
