#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# ai-boilerplate — project scaffolding script
# ──────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

banner() {
  echo ""
  echo -e "${CYAN}${BOLD}  ai-boilerplate — project scaffolding${NC}"
  echo -e "${CYAN}  ─────────────────────────────────────${NC}"
  echo ""
}

info()  { echo -e "  ${GREEN}✓${NC} $*"; }
warn()  { echo -e "  ${RED}!${NC} $*"; }
abort() { echo -e "  ${RED}✗ $*${NC}"; exit 1; }

# ──────────────────────────────────────────────
# 1. Detect sed flavour (BSD on macOS, GNU on Linux)
# ──────────────────────────────────────────────
if sed --version 2>/dev/null | grep -q "GNU"; then
  SED_INPLACE=(-i)
else
  SED_INPLACE=(-i "")
fi

# ──────────────────────────────────────────────
# 2. Derive identifiers from project name
# ──────────────────────────────────────────────
derive_identifiers() {
  local input="$1"

  PROJECT_NAME="$input"
  SCOPE="@${input}"
  DB_NAME="${input//-/_}"
  DB_NAME_TEST="${DB_NAME}_test"

  # Title Case: my-awesome-app → My Awesome App
  DISPLAY_NAME=$(echo "$input" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1')

  info "Project name   : $PROJECT_NAME"
  info "Scope          : $SCOPE"
  info "DB name        : $DB_NAME"
  info "DB test name   : $DB_NAME_TEST"
  info "Display name   : $DISPLAY_NAME"
  echo ""
}

# ──────────────────────────────────────────────
# 3. Confirm
# ──────────────────────────────────────────────
confirm() {
  local prompt="$1"
  local default="${2:-}"
  read -r -p "  $prompt " answer
  case "$answer" in
    y|Y|yes|YES) return 0 ;;
    n|N|no|NO)   return 1 ;;
    "")           [[ "$default" == "Y" ]] && return 0 || return 1 ;;
    *)           return 1 ;;
  esac
}

# ──────────────────────────────────────────────
# 4. Run sed replacement on a file
# ──────────────────────────────────────────────
replace() {
  local find="$1"
  local replace="$2"
  local file="$3"
  sed "${SED_INPLACE[@]}" "s|${find}|${replace}|g" "$file"
}

# ──────────────────────────────────────────────
# 5. Perform all replacements in target directory
# ──────────────────────────────────────────────
run_replacements() {
  local dir="$1"
  info "Replacing identifiers in source files..."

  # --- package.json files ---
  replace '"name": "ai-boilerplate"'        "\"name\": \"$PROJECT_NAME\""    "$dir/package.json"
  replace '"name": "@ai-boilerplate/shared"' "\"name\": \"$SCOPE/shared\""   "$dir/packages/shared/package.json"
  replace '"name": "@ai-boilerplate/utils"'  "\"name\": \"$SCOPE/utils\""    "$dir/packages/utils/package.json"
  replace '"name": "@ai-boilerplate/backend"' "\"name\": \"$SCOPE/backend\"" "$dir/apps/backend/package.json"
  replace '"name": "@ai-boilerplate/frontend"' "\"name\": \"$SCOPE/frontend\"" "$dir/apps/frontend/package.json"

  # --- package.json dependency entries ---
  replace '@ai-boilerplate/shared' "$SCOPE/shared"   "$dir/packages/utils/package.json"
  replace '@ai-boilerplate/shared' "$SCOPE/shared"   "$dir/apps/backend/package.json"
  replace '@ai-boilerplate/shared' "$SCOPE/shared"   "$dir/apps/frontend/package.json"
  replace '@ai-boilerplate/utils'  "$SCOPE/utils"    "$dir/apps/frontend/package.json"

  # --- TypeScript source imports ---
  for f in $(find "$dir/apps/backend/src" -name '*.ts' -not -path '*/node_modules/*' -not -path '*/dist/*'); do
    replace '@ai-boilerplate/shared' "$SCOPE/shared" "$f"
    replace '@ai-boilerplate/utils'  "$SCOPE/utils"  "$f"
  done
  for f in $(find "$dir/apps/frontend/src" -name '*.ts' -o -name '*.tsx' | grep -v node_modules | grep -v dist); do
    replace '@ai-boilerplate/shared' "$SCOPE/shared" "$f"
    replace '@ai-boilerplate/utils'  "$SCOPE/utils"  "$f"
  done

  # --- Database references ---
  replace "ai_boilerplate_test" "$DB_NAME_TEST" "$dir/apps/backend/vitest.config.ts"
  replace "ai_boilerplate_test" "$DB_NAME_TEST" "$dir/apps/backend/.env.test"
  replace "ai_boilerplate"      "$DB_NAME"      "$dir/apps/backend/src/db/pool.ts"
  replace "ai_boilerplate"      "$DB_NAME"      "$dir/apps/backend/.env.example"
  replace "ai_boilerplate"      "$DB_NAME"      "$dir/docker-compose.yml"

  # --- UI display strings ---
  replace 'AI Boilerplate'            "$DISPLAY_NAME"             "$dir/apps/frontend/index.html"
  replace 'Welcome to AI Boilerplate' "Welcome to $DISPLAY_NAME"  "$dir/apps/frontend/src/App.tsx"

  # --- Documentation ---
  if [[ -f "$dir/AGENTS.md" ]]; then
    replace '@ai-boilerplate/shared'     "$SCOPE/shared"      "$dir/AGENTS.md"
    replace '@ai-boilerplate/utils'      "$SCOPE/utils"       "$dir/AGENTS.md"
    replace '@ai-boilerplate/backend'    "$SCOPE/backend"     "$dir/AGENTS.md"
    replace '@ai-boilerplate/frontend'   "$SCOPE/frontend"    "$dir/AGENTS.md"
    replace 'ai_boilerplate_test'        "$DB_NAME_TEST"      "$dir/AGENTS.md"
    replace 'ai_boilerplate'             "$DB_NAME"           "$dir/AGENTS.md"
    replace 'ai-boilerplate'             "$PROJECT_NAME"      "$dir/AGENTS.md"
    replace 'AI Boilerplate'             "$DISPLAY_NAME"      "$dir/AGENTS.md"
  fi

  info "All replacements done."
  echo ""
}

# ──────────────────────────────────────────────
# 6. Cleanup generated artifacts
# ──────────────────────────────────────────────
cleanup_artifacts() {
  local dir="$1"
  info "Cleaning generated artifacts..."
  rm -rf "$dir/node_modules" "$dir/dist" "$dir/package-lock.json"
  rm -rf "$dir/apps/backend/dist" "$dir/apps/frontend/dist"
  rm -rf "$dir/packages/shared/dist" "$dir/packages/utils/dist"
  find "$dir" -name '*.tsbuildinfo' -delete 2>/dev/null || true
  info "Cleanup done."
  echo ""
}

# ──────────────────────────────────────────────
# 7. Verify — quick check that old strings are gone
# ──────────────────────────────────────────────
verify() {
  local dir="$1"
  info "Verifying no stale references remain..."

  local found=0
  for pattern in '@ai-boilerplate' 'ai_boilerplate' 'ai-boilerplate' 'AI Boilerplate'; do
    local matches
    matches=$(grep -r "$pattern" "$dir" \
      --include='*.ts' --include='*.tsx' --include='*.json' --include='*.html' \
      --include='*.yml' --include='*.md' --include='*.env.example' --include='*.env.test' \
      --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git 2>/dev/null || true)
    if [[ -n "$matches" ]]; then
      found=1
      while IFS= read -r line; do
        warn "Still found: $line"
      done <<< "$matches"
    fi
  done

  if [[ $found -eq 0 ]]; then
    info "All clear — no stale references remain."
  fi
  echo ""
}

# ──────────────────────────────────────────────
# 8. Main
# ──────────────────────────────────────────────
main() {
  banner

  # Validate running from project root
  if [[ ! -f "AGENTS.md" ]] || [[ ! -f "package.json" ]]; then
    abort "Must run from the ai-boilerplate project root."
  fi

  # Ask for project name
  read -r -p "  Enter project name (kebab-case): " INPUT
  if [[ -z "$INPUT" ]]; then
    abort "Project name cannot be empty."
  fi
  if [[ ! "$INPUT" =~ ^[a-z][a-z0-9-]*$ ]]; then
    abort "Project name must be kebab-case (lowercase letters, numbers, hyphens)."
  fi

  derive_identifiers "$INPUT"

  # Ask: new folder or in-place
  echo -e "  Mode:"
  echo "    [1] Create a NEW folder alongside this one"
  echo "    [2] Scaffold IN-PLACE (replace everything here)"
  read -r -p "  Choose [1/2] (default: 1): " MODE
  MODE="${MODE:-1}"

  TARGET_DIR=""

  if [[ "$MODE" == "1" ]]; then
    NEW_DIR="$(dirname "$(pwd)")/$PROJECT_NAME"
    if [[ -d "$NEW_DIR" ]]; then
      abort "Directory '$NEW_DIR' already exists. Remove it first or choose a different name."
    fi
    info "Copying project to $NEW_DIR ..."
    rsync -a --exclude='node_modules' --exclude='dist' --exclude='.env' --exclude='package-lock.json' --exclude='*.tsbuildinfo' --exclude='.git' ./ "$NEW_DIR/"
    TARGET_DIR="$NEW_DIR"
    info "Project copied to $TARGET_DIR"
    echo ""
  elif [[ "$MODE" == "2" ]]; then
    if ! confirm "  THIS WILL REPLACE ALL IDENTIFIERS IN-PLACE. Continue? [y/N]" "N"; then
      abort "Aborted."
    fi
    TARGET_DIR="$(pwd)"
    echo ""
  else
    abort "Invalid choice. Choose 1 or 2."
  fi

  run_replacements "$TARGET_DIR"
  cleanup_artifacts "$TARGET_DIR"
  verify "$TARGET_DIR"

  echo -e "${GREEN}${BOLD}  ✓ Scaffolding complete!${NC}"
  echo ""

  if confirm "  Run npm install now? [Y/n]" "Y"; then
    echo ""
    info "Running npm install in $TARGET_DIR ..."
    (cd "$TARGET_DIR" && npm install) || warn "npm install failed. Run 'npm install' manually."
  else
    echo ""
    info "Run 'npm install' manually when ready."
  fi

  echo ""
  echo -e "  ${BOLD}Next steps:${NC}"
  echo "    cd $PROJECT_NAME"
  echo "    cp apps/backend/.env.example apps/backend/.env"
  echo "    docker compose up -d"
  echo "    npm run dev:backend"
  echo "    npm run dev:frontend"
  echo ""
}

main "$@"
