# OSS Scanner build environment for Ravora (draft; not yet enrolled).
# The scanner builds this image WITH network access, then audits the code on a VM with none,
# so everything the build and the tests need must be fetched here.
FROM node:22

WORKDIR /src

# Native modules (sqlite3) fall back to a source build when no prebuilt binary matches.
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

# Dependencies first, for layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Application source (the scanner mounts or copies the repository at this path)
COPY . .

# Prove the frontend builds; the Express API (server.js) runs from source with no build step
RUN npm run build
