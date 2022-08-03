const spawn = require('child_process').spawn
const fs = require('fs')
const path = require('path')
const inputBucket = "locomation_offboard_sandbox_test_bucket"
const inputBucketPath = "test_upload_folder"
const inputFile = "./sample3.txt"

// exported function to call gsutil to upload a file with progress logging
async function uploadWithProgress(file, bucket, bucketPath) {
    try {
        return new Promise(async (resolve, reject) => {
            console.log('uploading file: ' + file)
            console.log('file name: ' + path.basename(file))
            console.log('bucket path: ' + bucketPath)
            const url = `gs://${bucket}/${bucketPath}/${path.basename(file)}`

            // use spawn to call gsutil to upload the file
            // catch error if any and reject promise
            const gsutil = spawn('gsutil', ['-m', 'cp', file, url])

            gsutil.stderr.on('data', (data) => {
                process.stdout.write('\x1B[2J\x1B[0f')
                //console.log(`Raw Output: ${data}`)
                try {
                    progressBytes = data.toString().match(/(\d{1,3}?\.\d)\s[K,M,G]?i?B/g)
                    //console.log(progressBytes)
                    console.log(`Progress: ${progressBytes[0]} of ${progressBytes[1]}`)
                } catch (error) {

                }
                // extract the progress percentage from the stderr output
                const progress = data.toString().match(/(\d)+%.*/)
                // extract time remaining from the stderr output
                if (progress) {
                    console.log(progress[0])
                }
            })

            gsutil.on('error', (error) => {
                reject(error)
            })
            gsutil.on('exit', (code) => {
                if (code !== 0) {
                    reject(`gsutil exited with code ${code}`)
                }
                resolve(`Upload successful: ${file} uploaded to ${bucket}/${bucketPath}`)
            })
            resolve(true)
        })
    } catch (error) {
        reject(error)
    }
}

uploadWithProgress(inputFile, inputBucket, inputBucketPath).catch(error => {
    console.log(error)
})