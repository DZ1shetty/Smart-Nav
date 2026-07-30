/**
 * Uploads an image file to Cloudinary and returns the secure URL.
 * 
 * @param {File} file - The image file to upload
 * @param {function} onProgress - Optional callback for upload progress (0-100)
 * @returns {Promise<string>} - Resolves with the Cloudinary secure URL
 */
export async function uploadToCloudinary(file, onProgress) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided'))
    if (!file.type.startsWith('image/')) return reject(new Error('File is not an image'))

    // These should ideally be in env vars, but hardcoding for now as they are public/unsigned
    const cloudName = 'jjwuzizy'
    const uploadPreset = 'smart_nav_preset'

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`)

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100)
          onProgress(percentComplete)
        }
      }
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText)
          resolve(response.secure_url)
        } catch (err) {
          reject(new Error('Failed to parse Cloudinary response'))
        }
      } else {
        console.error('[Upload] Cloudinary error:', xhr.responseText)
        reject(new Error(`Cloudinary upload failed: ${xhr.status}`))
      }
    }

    xhr.onerror = () => {
      reject(new Error('Network error occurred during upload'))
    }

    xhr.send(formData)
  })
}
