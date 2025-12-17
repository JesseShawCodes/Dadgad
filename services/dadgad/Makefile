# Makefile for Next.js project

# Variables
NODE_MODULES = node_modules
NEXT_BUILD_DIR = .next

# Phony targets are not associated with files
.PHONY: all install dev build start lint test clean help

# Default target
all: help

# Install dependencies
install: $(NODE_MODULES)/.bin
	@echo "Installing dependencies..."
	npm install

$(NODE_MODULES)/.bin: package.json
	npm install

# Run the development server
dev: install
	@echo "Starting development server..."
	npm run dev

# Build the project for production
build: install
	@echo "Building for production..."
	npm run build

# Start the production server
start: build
	@echo "Starting production server..."
	npm run start

# Lint the project
lint: install
	@echo "Linting project..."
	npm run lint

# Run tests
test: install
	@echo "Running tests..."
	npm run test

# Clean the project
clean:
	@echo "Cleaning up project..."
	rm -rf $(NEXT_BUILD_DIR) node_modules package-lock.json

# Display help
help:
	@echo "Makefile for Next.js project"
	@echo ""
	@echo "Usage:"
	@echo "  make install    - Install dependencies"
	@echo "  make dev        - Start the development server"
	@echo "  make build      - Build the project for production"
	@echo "  make start      - Start the production server"
	@echo "  make lint       - Lint the project"
	@echo "  make test       - Run tests"
	@echo "  make clean      - Remove build artifacts and dependencies"
	@echo ""
