import { S3 } from 'aws-sdk';
import { getServerConfig } from '../../server-config';
import { logger } from '@teams2/logger';

const logLib = logger('aws-s3');

export const s3Client = new S3(getServerConfig().s3);

export async function deleteObjectsPromise(
  params: S3.DeleteObjectsRequest
): Promise<S3.DeleteObjectOutput> {
  return new Promise((resolve, reject) =>
    s3Client.deleteObjects(params, function (err, data) {
      if (err) return reject(err);
      else return resolve(data);
    })
  );
}

export function getLogoFileName() {
  return 'logo';
}

export async function listObjectsV2Promise(
  params: S3.ListObjectsV2Request
): Promise<S3.ListObjectsV2Output> {
  return new Promise((resolve, reject) =>
    s3Client.listObjectsV2(params, function (err, data) {
      if (err) return reject(err);
      else return resolve(data);
    })
  );
}

export async function deleteFileFromBucket(fileName: string) {
  const log = logLib.extend('deleteFile');
  const files: S3.ObjectIdentifier[] = [{ Key: fileName }];

  const params: S3.DeleteObjectsRequest = {
    Bucket: getServerConfig().s3.bucket,
    Delete: {
      Objects: files,
      Quiet: false,
    },
  };

  log.debug('Going to delete file from S3 %o', params.Delete);
  const data = await deleteObjectsPromise(params);
  log.debug('Deleted %o', data);
}

export async function getSignedUrlForUpload(fileName: string, fileType: string, expiresIn = 120) {
  const log = logLib.extend('pUrlUp');
  const params = {
    Bucket: getServerConfig().s3.bucket,
    Key: fileName,
    Expires: expiresIn, // seconds
    ContentType: fileType,
  };

  const url = await s3Client.getSignedUrlPromise('putObject', params);

  log.debug('Pre-signed url created. Blob id=%s ContentType=%s url=%s', fileName, fileType, url);
  return url;
}

export async function getSignedUrlForDownload(fileName: string, fileType: string, expiresIn = 900) {
  const log = logLib.extend('pUrlDown');
  const params = {
    Bucket: getServerConfig().s3.bucket,
    Key: fileName,
    Expires: expiresIn, // seconds
    ContentType: fileType,
  };

  const url = await s3Client.getSignedUrlPromise('getObject', params);

  log.debug('Pre-signed url created. Blob id=%s ContentType=%s url=%s', fileName, fileType, url);
  return url;
}
