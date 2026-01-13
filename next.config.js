/** @type {import('next').NextConfig} */
const nextConfig = {
    // Required for Cloud Run standalone deployment
    output: 'standalone',

    // Disable image optimization (using Canvas content)
    images: {
        unoptimized: true,
    },

    // Experimental optimizations
    // Note: optimizeCss requires 'critters' package
}


module.exports = nextConfig
