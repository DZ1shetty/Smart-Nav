import https from 'https'

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode })
    }).on('error', (err) => {
      resolve({ url, status: 'ERROR', error: err.message })
    })
  })
}

async function run() {
  const urls = [
    'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/OLD_LOCAL_DATA/public-backup/cv-raman-block-images/second-floor/lc26.png',
    'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/cv-raman-block-images/second-floor/lc26.png',
    'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/public/cv-raman-block-images/second-floor/lc26.png',
    'https://raw.githubusercontent.com/DZ1shetty/Smart-Nav/main/public/ccl41_door.png',
  ]

  for (const u of urls) {
    const res = await checkUrl(u)
    console.log(`URL: ${u} => Status: ${res.status}`)
  }
}

run()
