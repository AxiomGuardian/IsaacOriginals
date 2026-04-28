#!/bin/bash
# ===========================================================================
# Isaac Originals · site relocator
# Double-click this file in Finder to:
#   1. Fix the spelling of ~/Documents/IsaacOrignals (if that typo exists)
#   2. Create ~/Documents/IsaacOriginals/Website/
#   3. Copy every site file in this folder into Website/
# Safe to run multiple times. Files are copied, not moved, so the source
# stays intact until you delete it yourself.
# ===========================================================================

set -e

# Source = the folder this script lives in
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

DOCS="$HOME/Documents"
TYPO="$DOCS/IsaacOrignals"
CORRECT="$DOCS/IsaacOriginals"
DEST="$CORRECT/Website"

# Pretty banner
printf '\n'
printf '  ISAAC ORIGINALS · site relocator\n'
printf '  --------------------------------\n'
printf '  Source : %s\n' "$SCRIPT_DIR"
printf '  Dest   : %s\n' "$DEST"
printf '\n'

# 1) Fix folder typo if applicable
if [ -d "$TYPO" ] && [ ! -d "$CORRECT" ]; then
  printf '  → Renaming IsaacOrignals → IsaacOriginals\n'
  mv "$TYPO" "$CORRECT"
elif [ -d "$TYPO" ] && [ -d "$CORRECT" ]; then
  printf '  ! Both IsaacOrignals and IsaacOriginals exist in Documents.\n'
  printf '    Leaving both alone. Clean one up in Finder when you have a moment.\n'
fi

# 2) Make sure destination exists
mkdir -p "$DEST"

# 3) Copy site files into Website/ (excluding this script itself)
printf '  → Copying site files...\n'
rsync -a \
  --exclude "setup.command" \
  --exclude ".DS_Store" \
  --exclude ".git" \
  "$SCRIPT_DIR/" "$DEST/"

printf '\n'
printf '  ✓ Done.\n'
printf '\n'
printf '  Your site now lives at:\n'
printf '    %s\n' "$DEST"
printf '\n'
printf '  To run it locally, paste this into a new Terminal:\n'
printf '    cd "%s" && python3 -m http.server 5173\n' "$DEST"
printf '  Then open http://localhost:5173\n'
printf '\n'
printf '  Press any key to close this window.\n'

# Keep the window open so you can read the output
read -n 1 -s
