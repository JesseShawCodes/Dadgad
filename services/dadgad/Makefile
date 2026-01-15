# Makefile for Next.js project

# Variables
NODE_MODULES = node_modules
NEXT_BUILD_DIR = .next

# Phony targets are not associated with files
.PHONY: all install dev stop build start lint test clean help

# Default target
all: help

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install

# Run the development server
dev:
	@echo "Starting development server..."
	npm run dev

# Stop the development server
stop:
	@echo "Stopping development server..."
	-lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Build the project for production
build:
	@echo "Building for production..."
	npm run build

# Start the production server
start:
	@echo "Starting production server..."
	npm run start

# Lint the project
lint:
	@echo "Linting project..."
	npm run lint

# Run tests
test:
	@echo "Running tests..."
	npm run test

# Clean the project
clean:
	@echo "Cleaning up project..."
	rm -rf $(NEXT_BUILD_DIR) node_modules package-lock.json

# NPM Related Commands
update:
	@echo "Updating all npm packages..."
	npx npm-check-updates -u
	npm install

# Display help
help:
	@echo "Makefile for Next.js project"
	@echo ""
	@echo "Usage:"
	@echo "  make install    - Install dependencies"
	@echo "  make dev        - Start the development server"
	@echo "  make stop       - Stop the development server"
	@echo "  make build      - Build the project for production"
	@echo "  make start      - Start the production server"
	@echo "  make lint       - Lint the project"
	@echo "  make test       - Run tests"
	@echo "  make clean      - Remove build artifacts and dependencies"
	@echo "  make update     - Update all npm packages"
	@echo ""
