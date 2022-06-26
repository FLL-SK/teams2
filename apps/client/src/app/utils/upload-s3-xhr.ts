export function uploadS3XHR(file: File, signedUrl: string): Promise<boolean> {
  console.log('XHR', file, signedUrl);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signedUrl);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(true);
        } else {
          reject(new Error('Upload failed'));
        }
      }
    };
    xhr.send(file);
  });
}
