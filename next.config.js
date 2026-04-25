/** @type {import('next').NextConfig} */
const nextConfig = {
  // ホーム画面に追加したアプリでも常に最新を取得するためのキャッシュ抑止
  async headers() {
    return [
      {
        source: '/((?!_next/static|_next/image|favicon.ico|icon.png|apple-touch-icon.png|icons|manifest.json).*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
    ]
  },
}
module.exports = nextConfig
