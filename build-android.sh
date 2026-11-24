#!/usr/bin/env bash
# Builds the Android app locally with EAS and drops the result in ../app-builds.
#
# Usage: ./build-android.sh [version] [profile]
#   version  patch | minor | major | 1.2.3 | keep   (default: patch)
#   profile  an eas.json build profile             (default: prod)
#
# Examples:
#   ./build-android.sh              # 1.0.13 -> 1.0.14, prod .aab
#   ./build-android.sh minor        # 1.0.13 -> 1.1.0
#   ./build-android.sh 2.0.0
#   ./build-android.sh keep preview # no version change
set -euo pipefail

cd "$(dirname "$0")"

BUMP="${1:-patch}"
PROFILE="${2:-prod}"
OUT_DIR="../app-builds"

case "$PROFILE" in
  prod) TAG="prd"; EXT="aab" ;;
  *)    TAG="$PROFILE"; EXT="apk" ;;
esac

CURRENT=$(node -p "require('./app.json').expo.version")

if [[ "$BUMP" == "keep" ]]; then
  VERSION="$CURRENT"
elif [[ "$BUMP" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  VERSION="$BUMP"
else
  IFS=. read -r MAJOR MINOR PATCH <<< "$CURRENT"
  case "$BUMP" in
    major) VERSION="$((MAJOR + 1)).0.0" ;;
    minor) VERSION="$MAJOR.$((MINOR + 1)).0" ;;
    patch) VERSION="$MAJOR.$MINOR.$((PATCH + 1))" ;;
    *) echo "Unknown version '$BUMP'. Use patch, minor, major, keep or x.y.z." >&2; exit 1 ;;
  esac
fi

OUTPUT="$OUT_DIR/dusko_${TAG}_v${VERSION}.${EXT}"
if [[ -e "$OUTPUT" ]]; then
  echo "$OUTPUT already exists. Pick another version." >&2
  exit 1
fi

set_version() {
  node -e "
    const fs = require('fs');
    const config = JSON.parse(fs.readFileSync('app.json', 'utf8'));
    config.expo.version = process.argv[1];
    fs.writeFileSync('app.json', JSON.stringify(config, null, 2) + '\n');
  " "$1"
}

if [[ "$VERSION" != "$CURRENT" ]]; then
  echo "Version $CURRENT -> $VERSION"
  set_version "$VERSION"
  # Put the old version back if the build fails or is cancelled.
  trap 'echo "Build failed, restoring version $CURRENT"; set_version "$CURRENT"' ERR INT
fi

mkdir -p "$OUT_DIR"
echo "Building $PROFILE ($EXT) v$VERSION..."
eas build -p android --profile "$PROFILE" --local --output "$OUTPUT"

trap - ERR INT
echo "Done: $(cd "$OUT_DIR" && pwd)/$(basename "$OUTPUT")"
