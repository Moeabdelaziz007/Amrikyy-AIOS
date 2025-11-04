#!/bin/bash

# Repository Integration Helper Script
# Compares components and files across related repositories
# Usage: ./scripts/compare-repositories.sh

set -e

echo "🔍 Repository Integration Analysis Tool"
echo "========================================"
echo ""

# Configuration
TEMP_DIR="/tmp/repo-analysis"
CURRENT_REPO="/home/runner/work/Amrikyy-AIOS/Amrikyy-AIOS"

# Repositories to analyze
REPOS=(
  "AmrikyyAIOS-UI"
  "AuraOS-Monorepo"
  "UiAmrikyy"
  "auraos"
)

REPO_URLS=(
  "https://github.com/Moeabdelaziz007/AmrikyyAIOS-UI.git"
  "https://github.com/Moeabdelaziz007/AuraOS-Monorepo.git"
  "https://github.com/Moeabdelaziz007/UiAmrikyy.git"
  "https://github.com/Moeabdelaziz007/auraos.git"
)

# Create temp directory
mkdir -p "$TEMP_DIR"
mkdir -p "$CURRENT_REPO/analysis-results"

echo "📦 Cloning repositories for analysis..."
echo ""

# Clone repositories (shallow clone for speed)
for i in "${!REPOS[@]}"; do
  REPO_NAME="${REPOS[$i]}"
  REPO_URL="${REPO_URLS[$i]}"
  
  if [ -d "$TEMP_DIR/$REPO_NAME" ]; then
    echo "✓ $REPO_NAME already cloned (skipping)"
  else
    echo "Cloning $REPO_NAME..."
    git clone --depth 1 "$REPO_URL" "$TEMP_DIR/$REPO_NAME" 2>&1 | grep -v "^remote:" | head -5
  fi
done

echo ""
echo "📊 Generating analysis reports..."
echo ""

# Function to count files by extension
count_files() {
  local repo_path=$1
  local extension=$2
  find "$repo_path" -type f -name "*.$extension" 2>/dev/null | wc -l
}

# Generate comparison report
REPORT_FILE="$CURRENT_REPO/analysis-results/repository-comparison.md"

cat > "$REPORT_FILE" << HEADER
# Repository Comparison Report
Generated: $(date)

## File Statistics

HEADER

echo "| Repository | TypeScript | JavaScript | TSX | CSS | Total |" >> "$REPORT_FILE"
echo "|-----------|-----------|-----------|-----|-----|-------|" >> "$REPORT_FILE"

for REPO in "${REPOS[@]}"; do
  REPO_PATH="$TEMP_DIR/$REPO"
  TS_COUNT=$(count_files "$REPO_PATH" "ts")
  JS_COUNT=$(count_files "$REPO_PATH" "js")
  TSX_COUNT=$(count_files "$REPO_PATH" "tsx")
  CSS_COUNT=$(count_files "$REPO_PATH" "css")
  TOTAL=$((TS_COUNT + JS_COUNT + TSX_COUNT + CSS_COUNT))
  
  echo "| $REPO | $TS_COUNT | $JS_COUNT | $TSX_COUNT | $CSS_COUNT | $TOTAL |" >> "$REPORT_FILE"
done

# Add current repo stats
TS_COUNT=$(count_files "$CURRENT_REPO" "ts")
JS_COUNT=$(count_files "$CURRENT_REPO" "js")
TSX_COUNT=$(count_files "$CURRENT_REPO" "tsx")
CSS_COUNT=$(count_files "$CURRENT_REPO" "css")
TOTAL=$((TS_COUNT + JS_COUNT + TSX_COUNT + CSS_COUNT))

echo "| **Amrikyy-AIOS (Current)** | **$TS_COUNT** | **$JS_COUNT** | **$TSX_COUNT** | **$CSS_COUNT** | **$TOTAL** |" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "## Component Files Comparison" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Compare components directories
for REPO in "${REPOS[@]}"; do
  COMP_DIR="$TEMP_DIR/$REPO/components"
  if [ -d "$COMP_DIR" ]; then
    echo "### $REPO Components" >> "$REPORT_FILE"
    echo '```' >> "$REPORT_FILE"
    ls -1 "$COMP_DIR" 2>/dev/null | head -20 >> "$REPORT_FILE"
    COMP_COUNT=$(ls -1 "$COMP_DIR" 2>/dev/null | wc -l)
    echo "... ($COMP_COUNT total items)" >> "$REPORT_FILE"
    echo '```' >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
  fi
done

# Current repo components
COMP_DIR="$CURRENT_REPO/components"
if [ -d "$COMP_DIR" ]; then
  echo "### Amrikyy-AIOS (Current) Components" >> "$REPORT_FILE"
  echo '```' >> "$REPORT_FILE"
  ls -1 "$COMP_DIR" 2>/dev/null | head -20 >> "$REPORT_FILE"
  COMP_COUNT=$(ls -1 "$COMP_DIR" 2>/dev/null | wc -l)
  echo "... ($COMP_COUNT total items)" >> "$REPORT_FILE"
  echo '```' >> "$REPORT_FILE"
fi

echo ""
echo "✅ File analysis complete!"
echo "📄 Report saved to: analysis-results/repository-comparison.md"
echo ""

# Compare package.json files
echo "📦 Comparing package dependencies..."
PACKAGES_REPORT="$CURRENT_REPO/analysis-results/package-dependencies.md"

cat > "$PACKAGES_REPORT" << 'HEADER'
# Package Dependencies Comparison

## React & TypeScript Versions

HEADER

echo "| Repository | React | React-DOM | TypeScript |" >> "$PACKAGES_REPORT"
echo "|-----------|-------|----------|-----------|" >> "$PACKAGES_REPORT"

for REPO in "${REPOS[@]}"; do
  PKG_FILE="$TEMP_DIR/$REPO/package.json"
  if [ -f "$PKG_FILE" ]; then
    REACT_VER=$(grep -o '"react": "[^"]*"' "$PKG_FILE" | cut -d'"' -f4 || echo "N/A")
    REACT_DOM=$(grep -o '"react-dom": "[^"]*"' "$PKG_FILE" | cut -d'"' -f4 || echo "N/A")
    TS_VER=$(grep -o '"typescript": "[^"]*"' "$PKG_FILE" | cut -d'"' -f4 || echo "N/A")
    echo "| $REPO | $REACT_VER | $REACT_DOM | $TS_VER |" >> "$PACKAGES_REPORT"
  fi
done

# Current repo
PKG_FILE="$CURRENT_REPO/package.json"
if [ -f "$PKG_FILE" ]; then
  REACT_VER=$(grep -o '"react": "[^"]*"' "$PKG_FILE" | cut -d'"' -f4 || echo "N/A")
  REACT_DOM=$(grep -o '"react-dom": "[^"]*"' "$PKG_FILE" | cut -d'"' -f4 || echo "N/A")
  TS_VER=$(grep -o '"typescript": "[^"]*"' "$PKG_FILE" | cut -d'"' -f4 || echo "N/A")
  echo "| **Amrikyy-AIOS (Current)** | **$REACT_VER** | **$REACT_DOM** | **$TS_VER** |" >> "$PACKAGES_REPORT"
fi

echo ""
echo "✅ Package comparison complete!"
echo "📄 Report saved to: analysis-results/package-dependencies.md"
echo ""

# Create integration checklist
CHECKLIST="$CURRENT_REPO/analysis-results/INTEGRATION_CHECKLIST.md"

cat > "$CHECKLIST" << 'EOF'
# Integration Checklist

Use this checklist to track progress when integrating code from related repositories.

## Phase 1: AmrikyyAIOS-UI Integration (High Priority)

### Pre-Integration
- [ ] Backup current branch: `git branch backup-$(date +%Y%m%d)`
- [ ] Review type definitions in both repos
- [ ] Document current components list

### Component Integration
- [ ] Compare `/components/` directories
- [ ] List components to copy (create inventory)
- [ ] Copy non-conflicting components one by one
- [ ] Update imports and dependencies for each
- [ ] Test each component individually
- [ ] Run: `npm test` after each addition

### Context & Services
- [ ] Review `/contexts/` providers in AmrikyyAIOS-UI
- [ ] Integrate useful context providers
- [ ] Review `/services/` architecture
- [ ] Adopt service layer patterns
- [ ] Test state management integration

### Utilities & Helpers
- [ ] Review `/utils/` directory
- [ ] Copy useful utility functions
- [ ] Remove any duplicates
- [ ] Update import paths throughout codebase
- [ ] Test utility functions

### Validation
- [ ] Run: `npm run lint`
- [ ] Run: `npm run build`
- [ ] Run: `npm test`
- [ ] Manual browser testing
- [ ] Check for console errors

## Phase 2: AuraOS-Monorepo Tooling (Medium Priority)

### Configuration Files
- [ ] Copy `.eslintrc.json` from AuraOS-Monorepo
- [ ] Copy `.prettierrc.json`
- [ ] Update `tsconfig.json` with best practices
- [ ] Run: `npm run lint:fix`
- [ ] Run: `npm run format`

### Testing Infrastructure
- [ ] Review Playwright setup in AuraOS-Monorepo
- [ ] Install Playwright: `npm install -D @playwright/test`
- [ ] Copy `playwright.config.ts`
- [ ] Create sample E2E tests
- [ ] Run: `npx playwright test`

### Documentation
- [ ] Review `ARCHITECTURE.md` in AuraOS-Monorepo
- [ ] Adopt relevant architectural principles
- [ ] Review `DESIGN_SYSTEM.md`
- [ ] Update local documentation
- [ ] Create/update SECURITY_POLICY.md

## Phase 3: Selective Features (Lower Priority)

### From UiAmrikyy
- [ ] Review agent-related components
- [ ] Identify useful custom hooks in `/hooks/`
- [ ] Copy dashboard layout patterns
- [ ] Review theme system (if multi-theme needed)
- [ ] Test integrated features

### From auraos
- [ ] Review AI automation patterns
- [ ] Extract prompt management code (if applicable)
- [ ] Review workflow engine architecture
- [ ] Adapt for current use cases
- [ ] Test AI integrations

## Final Validation

### Code Quality
- [ ] ESLint: 0 errors, 0 warnings
- [ ] Prettier: All files formatted
- [ ] TypeScript: 0 compilation errors
- [ ] Build: Successful with no warnings
- [ ] Bundle size: Reviewed and acceptable

### Testing
- [ ] Unit tests: 100% passing
- [ ] Integration tests: All passing
- [ ] E2E tests: Core flows covered
- [ ] Manual testing: Complete
- [ ] Cross-browser testing: Done

### Documentation
- [ ] README.md updated
- [ ] CHANGELOG.md updated
- [ ] Component documentation added
- [ ] Integration notes documented
- [ ] API documentation current

### Performance
- [ ] Build time: Acceptable
- [ ] Bundle size: Optimized
- [ ] Runtime performance: No regressions
- [ ] Lighthouse score: Maintained or improved
- [ ] Memory usage: Acceptable

## Deployment Checklist

- [ ] All code reviewed
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Staging deployment successful
- [ ] Production deployment plan ready

---

**Notes:**
- Update this checklist as you progress
- Check off items as completed
- Add notes for any issues or decisions
- Keep this document in version control

**Last Updated:** (Add date when you start)  
**Completed By:** (Your name/team)
EOF

echo "✅ Integration checklist created!"
echo "📄 Checklist saved to: analysis-results/INTEGRATION_CHECKLIST.md"
echo ""

echo "🎉 Repository analysis complete!"
echo ""
echo "📊 Generated Reports:"
echo "  1. analysis-results/repository-comparison.md"
echo "  2. analysis-results/package-dependencies.md"
echo "  3. analysis-results/INTEGRATION_CHECKLIST.md"
echo ""
echo "🚀 Next Steps:"
echo "  1. Review REPOSITORY_INTEGRATION_ANALYSIS.md (main doc)"
echo "  2. Check analysis-results/ for detailed comparisons"
echo "  3. Start with INTEGRATION_CHECKLIST.md Phase 1"
echo "  4. Begin integrating AmrikyyAIOS-UI components"
echo ""
echo "💡 Tip: Repos cached in $TEMP_DIR for quick reference"
echo ""
